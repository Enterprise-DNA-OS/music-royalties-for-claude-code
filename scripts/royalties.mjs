import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table as textTable} from './lib/format.mjs';
import {page,table,writeOut} from './lib/render.mjs';
const reads=['help','partners','tracks','periods','contracts','income','sales','unmatched','recoupment','statements','costs','attention','actions-due','contract-expiry','compliance','history','weekly-review'];
const writes=['add-partner','add-track','add-period','add-contract','add-cost','add-action','complete-action','match-income','revise-sale','reconcile','calculate','approve-statement','lock-period','record-backup','import'];
export const commands=[...reads,...writes,'export','draft-statement'];
const tables=['partners','tracks','periods','contracts','imports','sales','costs','actions','statements','activity','settings'];
function argsOf(args){const o={};for(const a of args.filter(x=>x.startsWith('--'))){const i=a.indexOf('=');o[a.slice(2,i<0?undefined:i)]=i<0?true:a.slice(i+1);}return o;}
const need=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`Required --${k}=value`);return o[k].trim();};
function date(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error(`Invalid date: ${s}`);return s;}
function number(s,{positive=false,max=null}={}){if(!/^-?(?:0|[1-9]\d{0,12})(?:\.\d{1,6})?$/.test(s)||!Number.isFinite(Number(s))||(positive&&Number(s)<=0)||(max!==null&&Number(s)>max))throw Error(`Expected plain decimal with at most six places: ${s}`);return s;}
const currency=s=>{if(!/^[A-Z]{3}$/.test(s))throw Error('Currency must be three uppercase letters');return s;};
async function resolve(db,t,s){if(!tables.includes(t))throw Error('Unknown record type');let rows=await db.query(`select * from ${t} where lower(code)=lower($1) or id::text=$1`,[s]);if(rows.length===1)return rows[0];rows=await db.query(`select * from ${t} where strpos(lower(name),lower($1))>0 or starts_with(id::text,lower($1)) order by code`,[s]);if(rows.length!==1)throw Error(`${rows.length?'Ambiguous':'No match'} ${t}: ${s}${rows.length?'\n'+rows.map(r=>`${r.code} | ${r.name} | ${r.id}`).join('\n'):''}`);return rows[0];}
async function period(db,o){return resolve(db,'periods',need(o,'period'));}
async function writable(db,p){if(p.status==='locked')throw Error('Period is locked');if((await db.query("select 1 from periods where status='locked' and end_on>$1",[p.end_on])).length)throw Error('A later period is locked; historical revisions require a controlled migration');}
async function changed(db,p){await db.query('update periods set revision=revision+1,source_review=null,reviewed_by=null where id=$1',[p.id]);await db.query('update statements set approved_by=null where period_id=$1',[p.id]);}
async function contractChange(db,start,end){if((await db.query("select 1 from periods where status='locked' and start_on<=$2 and end_on>=$1",[start,end])).length)throw Error('Contract overlaps a locked period');for(const p of await db.query('select * from periods where start_on<=$2 and end_on>=$1',[start,end]))await changed(db,p);}
async function issues(db,p,{final=false}={}){
 const rows=[];const add=(rule,record,issue)=>rows.push({rule,record,issue});
 const sources=await db.query('select * from imports where period_id=$1',[p.id]);
 if(!sources.length)add('SOURCE',p.code,'No income report loaded');
 if(!p.source_review)add('SOURCE-REVIEW',p.code,'Reconcile totals against original distributor statements');
 for(const s of sources)if(!s.raw_text||!s.source)add('RETENTION',s.code,'Original income or source reference missing');
 for(const s of await db.query('select * from v_unmatched where period=$1',[p.code]))add('MATCH',s.reported_isrc,'Income has no recording match');
 const gaps=await db.query(`select distinct t.code,t.name from sales s join tracks t on t.id=s.track_id where s.period_id=$1 and not exists(select 1 from contracts c where c.track_id=t.id and c.start_on<=$2 and c.end_on>=$3 and c.currency=$4)`,[p.id,p.start_on,p.end_on,p.currency]);
 for(const g of gaps)add('CONTRACT',g.code,'No same-currency contract covering the entire reporting period');
 const partial=await db.query(`select distinct c.code from contracts c where c.start_on<=$2 and c.end_on>=$1 and (c.start_on>$1 or c.end_on<$2 or c.currency<>$3) and exists(select 1 from sales s where s.period_id=$4 and s.track_id=c.track_id)`,[p.start_on,p.end_on,p.currency,p.id]);
 for(const c of partial)add('TERM',c.code,'Partial-period or different-currency contract requires separate prepared periods');
 for(const a of await db.query('select code,name from actions where period_id=$1 and result is null',[p.id]))add('ACTION',a.code,a.name);
 for(const prior of await db.query("select code from periods where end_on<$1 and status<>'locked'",[p.start_on]))add('PRIOR',prior.code,'Earlier period must be locked before carrying recoupment');
 const cfg=(await db.query('select * from settings'))[0];
 if(!cfg.backup_checked_on||!cfg.backup_evidence||(await db.query('select $1::date < current_date-30 old',[cfg.backup_checked_on]))[0].old)add('BACKUP','OPERATOR','Record a successful restore check within the last 30 days');
 if(final){const earned=await db.query('select * from v_earned where period_id=$1',[p.id]);const ss=await db.query('select * from statements where period_id=$1',[p.id]);if(ss.length!==earned.length||!ss.length)add('CALCULATION',p.code,'Calculate all contract statements');for(const s of ss){if(s.revision!==p.revision)add('STALE',s.code,'Statement predates a change');if(!s.approved_by)add('REVIEW',s.code,'Different reviewer must approve the statement');}}
 return rows;
}
export async function run(db,args){
 const cmd=args.find(x=>!x.startsWith('--'))||'help',o=argsOf(args);
 if(!commands.includes(cmd))throw Error(`Unknown command ${cmd}. Use help.`);
 if(cmd==='help')return commands.map(command=>({command}));
 const selected=o.period?await period(db,o):null;
 const read=async()=>{
  if(['partners','tracks','periods','contracts','history'].includes(cmd))return db.query(`select * from ${cmd==='history'?'activity':cmd} order by created_at,id`);
  if(['income','unmatched','recoupment','attention'].includes(cmd))return db.query(`select ${cmd==='recoupment'?'period,contract,partner,currency,earned_amount,opening_amount,cost_amount,recouped_amount,closing_amount,available_amount':cmd==='attention'?'period,due_on,unmatched,open_actions,unapproved,source_review':'*'} from v_${cmd}${selected?' where period=$1':''} order by period`,selected?[selected.code]:[]);
  if(['sales','costs','statements','actions-due'].includes(cmd)){const t=cmd==='actions-due'?'actions':cmd;return db.query(`select * from ${t}${selected?' where period_id=$1':''}${cmd==='actions-due'?(selected?' and':' where')+' result is null':''} order by created_at,id`,selected?[selected.id]:[]);}
  if(cmd==='contract-expiry')return db.query('select code,name,end_on,currency from contracts where end_on<=$1::date+90 order by end_on',[date(o.asof||new Date().toISOString().slice(0,10))]);
  if(cmd==='compliance')return issues(db,selected||await period(db,o),{final:true});
  if(cmd==='weekly-review'){const p=selected||await period(db,o);return [{period:p.code,attention:await db.query('select * from v_attention where period=$1',[p.code]),recoupment:await db.query('select * from v_recoupment where period_id=$1',[p.id]),checks:await issues(db,p,{final:true})}];}
 };
 if(reads.includes(cmd))return read();
 if(cmd==='export'){const dir=path.resolve(need(o,'dir'));fs.mkdirSync(dir,{recursive:true,mode:0o700});const records={};await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{for(const t of tables)records[t]=await db.query(`select * from ${t} order by created_at,id`);}finally{await db.exec('ROLLBACK');}const file=path.join(dir,'royalties.json');fs.writeFileSync(file,JSON.stringify({version:1,exported:new Date().toISOString(),records},null,2),{mode:0o600});fs.chmodSync(file,0o600);return [{file,tables:tables.length}];}
 if(cmd==='draft-statement'){const s=await resolve(db,'statements',need(o,'statement'));const p=await resolve(db,'periods',s.period_id);const file=writeOut('drafts',s.code,page({title:'Royalty working statement',subtitle:`${s.code} | ${p.status} | ${s.currency} | Not a payment or tax document`,sections:[{title:'Calculation',html:table([s],['earned_amount','opening_amount','cost_amount','recouped_amount','closing_amount','available_amount','prepared_by','approved_by'])},{title:'Snapshot',html:table([s.snapshot])},{title:'Checks',html:table(await issues(db,p,{final:true}))}]}));return [{file}];}
 const actor=need(o,'actor');await db.exec('BEGIN');
 try{
  await db.query("select id from settings where code='OPERATOR' for update");
  const p=o.period?await period(db,o):null;
  let result,detail={options:{...o}};delete detail.options.file;
  const insert=async(t,fields,values)=>db.query(`insert into ${t}(${fields.join(',')}) values(${values.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,values);
  if(cmd==='add-partner'){result=await insert('partners',['code','name','owner'],[need(o,'code'),need(o,'name'),need(o,'owner')]);}
  if(cmd==='add-track'){const code=need(o,'code').toUpperCase();if(!/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(code))throw Error('Track code must be an unhyphenated 12-character ISRC');result=await insert('tracks',['code','name','artist'],[code,need(o,'name'),need(o,'artist')]);}
  if(cmd==='add-period'){const start=date(need(o,'start')),end=date(need(o,'end'));if(end<start)throw Error('Period end precedes start');if((await db.query('select 1 from periods where start_on<=$2 and end_on>=$1',[start,end])).length)throw Error('Reporting periods must not overlap');if((await db.query("select 1 from periods where status='locked' and end_on >= $1",[start])).length)throw Error('Cannot add a historical period before a locked period');result=await insert('periods',['code','name','start_on','end_on','due_on','currency'],[need(o,'code'),need(o,'name'),start,end,date(need(o,'due')),currency(need(o,'currency'))]);}
  if(cmd==='add-contract'){
   const partner=await resolve(db,'partners',need(o,'partner')),track=await resolve(db,'tracks',need(o,'track')),start=date(need(o,'start')),end=date(need(o,'end')),rate=number(need(o,'rate'),{positive:true,max:100});if(!/^\d+(\.\d{1,4})?$/.test(rate))throw Error('Rate supports four decimal places');
   await contractChange(db,start,end);const overlap=await db.query('select * from contracts where track_id=$1 and start_on<=$3 and end_on>=$2',[track.id,start,end]);if(overlap.some(c=>c.partner_id===partner.id))throw Error('Overlapping contract for this partner and recording');if(overlap.reduce((n,c)=>n+Number(c.rate),Number(rate))>100)throw Error('Combined overlapping shares exceed 100 percent');
   const debt=number(o.debt||'0');if(Number(debt)<0)throw Error('Opening debt cannot be negative');result=await insert('contracts',['code','name','partner_id','track_id','rate','start_on','end_on','currency','opening_debt','source'],[need(o,'code'),need(o,'name'),partner.id,track.id,rate,start,end,currency(need(o,'currency')),debt,need(o,'source')]);
  }
  if(['add-cost','add-action','complete-action','match-income','revise-sale','reconcile','calculate','approve-statement','lock-period','import'].includes(cmd)){if(!p)throw Error('Required --period=value');await writable(db,p);}
  if(cmd==='add-cost'){const c=await resolve(db,'contracts',need(o,'contract'));if(c.currency!==p.currency||c.start_on>p.start_on||c.end_on<p.end_on)throw Error('Contract must cover period and currency');result=await insert('costs',['code','name','contract_id','period_id','amount','source'],[need(o,'code'),need(o,'name'),c.id,p.id,number(need(o,'amount'),{positive:true}),need(o,'source')]);await changed(db,p);}
  if(cmd==='add-action'){result=await insert('actions',['code','name','period_id','owner','due_on'],[need(o,'code'),need(o,'name'),p.id,need(o,'owner'),date(need(o,'due'))]);await changed(db,p);}
  if(cmd==='complete-action'){const a=await resolve(db,'actions',need(o,'action'));if(a.period_id!==p.id)throw Error('Action belongs to a different period');result=await db.query('update actions set result=$1 where id=$2 returning *',[need(o,'result'),a.id]);await changed(db,p);}
  if(cmd==='match-income'){const t=await resolve(db,'tracks',need(o,'track'));result=await db.query('update sales set track_id=$1 where period_id=$2 and reported_isrc=$3 and track_id is null returning *',[t.id,p.id,need(o,'reported')]);if(!result.length)throw Error('No unmatched income for that reported identifier');detail.reason=need(o,'reason');await changed(db,p);}
  if(cmd==='revise-sale'){const found=await db.query('select * from sales where period_id=$1 and starts_with(id::text,$2)',[p.id,need(o,'sale')]);if(found.length!==1)throw Error(`Expected one sale; found ${found.length}: ${found.map(s=>s.id).join(', ')}`);detail.before=found[0];detail.reason=need(o,'reason');detail.source=need(o,'source');result=await db.query('update sales set net_amount=$1 where id=$2 returning *',[number(need(o,'net')),found[0].id]);await changed(db,p);}
  if(cmd==='reconcile'){const expected=number(need(o,'total'));const actual=await db.query('select coalesce(sum(net_amount),0)::numeric(20,6) total from sales where period_id=$1',[p.id]);if(!(await db.query('select $1::numeric=$2::numeric same',[expected,actual[0].total]))[0].same)throw Error(`Source total differs: recorded ${actual[0].total}`);result=await db.query('update periods set source_review=$1,reviewed_by=$2 where id=$3 returning *',[`${need(o,'source')} | ${need(o,'note')} | total ${expected}`,actor,p.id]);}
  if(cmd==='calculate'){
   const blocked=await issues(db,p);if(blocked.length)throw Error('Calculation blocked: '+blocked.map(r=>r.rule+': '+r.record).join('; '));
   const values=await db.query('select * from v_recoupment where period_id=$1 order by contract',[p.id]);if(!values.length)throw Error('No eligible contracts');
   const before=await db.query('select * from statements where period_id=$1',[p.id]);detail.previous=before;
   for(const v of values){const code=p.code+'-'+v.contract;const inputs={calculation:v,contract:(await db.query('select * from contracts where id=$1',[v.contract_id]))[0],sales:await db.query('select s.* from sales s join contracts c on c.track_id=s.track_id where c.id=$1 and s.period_id=$2',[v.contract_id,p.id]),costs:await db.query('select * from costs where contract_id=$1 and period_id=$2',[v.contract_id,p.id])};await db.query(`insert into statements(code,name,period_id,contract_id,currency,revision,earned_amount,opening_amount,cost_amount,recouped_amount,closing_amount,available_amount,prepared_by,snapshot) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) on conflict(period_id,contract_id) do update set revision=excluded.revision,earned_amount=excluded.earned_amount,opening_amount=excluded.opening_amount,cost_amount=excluded.cost_amount,recouped_amount=excluded.recouped_amount,closing_amount=excluded.closing_amount,available_amount=excluded.available_amount,prepared_by=excluded.prepared_by,approved_by=null,snapshot=excluded.snapshot`,[code,v.partner,p.id,v.contract_id,p.currency,p.revision,v.earned_amount,v.opening_amount,v.cost_amount,v.recouped_amount,v.closing_amount,v.available_amount,actor,JSON.stringify(inputs)]);}
   result=await db.query('select code,earned_amount,recouped_amount,closing_amount,available_amount from statements where period_id=$1 order by code',[p.id]);
  }
  if(cmd==='approve-statement'){const s=await resolve(db,'statements',need(o,'statement'));if(s.period_id!==p.id)throw Error('Wrong period');if(s.prepared_by.toLowerCase()===actor.toLowerCase())throw Error('A different reviewer must approve');if(s.revision!==p.revision)throw Error('Stale calculation; calculate again');const blocked=await issues(db,p);if(blocked.length)throw Error('Review blocked: '+blocked.map(x=>x.rule).join(', '));detail.note=need(o,'note');result=await db.query('update statements set approved_by=$1 where id=$2 returning code,approved_by',[actor,s.id]);}
  if(cmd==='lock-period'){const blocked=await issues(db,p,{final:true});if(blocked.length)throw Error('Period blocked: '+blocked.map(x=>x.rule).join(', '));detail.note=need(o,'note');result=await db.query("update periods set status='locked' where id=$1 returning code,status",[p.id]);}
  if(cmd==='record-backup'){const d=date(need(o,'date'));if(d>new Date().toISOString().slice(0,10))throw Error('Backup check cannot be future dated');result=await db.query("update settings set backup_checked_on=$1,backup_evidence=$2 where code='OPERATOR' returning backup_checked_on,backup_evidence",[d,need(o,'evidence')]);}
  if(cmd==='import'){
   if(args.filter(x=>!x.startsWith('--'))[1]!=='melino')throw Error('Use import melino');const raw=fs.readFileSync(need(o,'file'),'utf8');const fingerprint=createHash('sha256').update(raw).digest('hex');
   const old=await db.query('select code from imports where period_id=$1 and fingerprint=$2',[p.id,fingerprint]);
   if(old.length)result=[{unchanged:true,code:old[0].code}];
   else{
    const code=need(o,'code');if((await db.query('select 1 from imports where code=$1',[code])).length)throw Error('Import code already exists; never overwrite a source batch');
    const parsed=parseCsv(raw);if(!parsed.length)throw Error('Empty income file');const map=o.map?JSON.parse(fs.readFileSync(o.map,'utf8')):{};const allowed=['isrc','units','net','territory','reseller','title'];if(Object.keys(map).some(k=>!allowed.includes(k))||Object.values(map).some(x=>typeof x!=='string'))throw Error('Invalid column map');
    const get=(r,k)=>pick(r,map[k]||k);for(const k of ['isrc','units','net'])if(!Object.keys(parsed[0]).some(h=>h.toLowerCase()===(map[k]||k).toLowerCase()))throw Error(`Missing column ${map[k]||k}`);
    const im=(await insert('imports',['code','name','period_id','fingerprint','raw_text','source','actor'],[code,path.basename(o.file),p.id,fingerprint,raw,need(o,'source'),actor]))[0];
    for(let i=0;i<parsed.length;i++){const r=parsed[i],isrc=get(r,'isrc').trim().toUpperCase();if(!isrc)throw Error(`Row ${i+2}: missing ISRC`);const t=(await db.query('select id from tracks where upper(code)=$1',[isrc]))[0];await insert('sales',['period_id','import_id','row_no','track_id','reported_isrc','territory','reseller','units','net_amount'],[p.id,im.id,i+1,t?.id||null,isrc,get(r,'territory')||'Unspecified',get(r,'reseller')||'Unspecified',number(get(r,'units')),number(get(r,'net'))]);}
    await changed(db,p);result=[{code,lines:parsed.length,dry_run:Boolean(o['dry-run'])}];
   }
  }
  if(!result)throw Error('Command not implemented');
  await db.query('insert into activity(name,actor,detail) values($1,$2,$3)',[cmd,actor,JSON.stringify({...detail,result})]);
  await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return result;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
export function print(rows,{compact=false}={}){if(compact&&rows[0]?.contract&&'recouped_amount' in rows[0])rows=rows.map(r=>({contract:r.contract,currency:r.currency,earned:r.earned_amount,recouped:r.recouped_amount,carried:r.closing_amount,available:r.available_amount}));const cleaned=rows.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,typeof v==='object'&&v!==null?JSON.stringify(v):v])));console.log(textTable(cleaned,Object.keys(cleaned[0]||{}).map(key=>({key,label:key.replaceAll('_',' '),width:100}))));}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const rows=await run(db,process.argv.slice(2));if(process.argv.includes('--json'))console.log(JSON.stringify(rows,null,2));else print(rows,{compact:process.argv.includes('--compact')});}catch(e){console.error(process.argv.includes('--json')?JSON.stringify({error:e.message}):e.message);process.exitCode=1;}finally{await db?.close();}}
