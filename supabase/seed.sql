insert into partners(code,name,owner) values('HARBOUR','Harbour Sessions','Mere'),('SOUTH','Southern Echo','Ari') on conflict do nothing;
insert into tracks(code,name,artist) values('NZABC2600001','Night Ferry','Harbour Sessions'),('NZABC2600002','Long Road','Southern Echo') on conflict do nothing;
insert into periods(code,name,start_on,end_on,due_on,currency) values('2026-Q3','September quarter','2026-07-01','2026-09-30',current_date-10,'NZD'),('2026-Q4','December quarter','2026-10-01','2026-12-31','2027-01-31','NZD') on conflict do nothing;
insert into contracts(code,name,partner_id,track_id,rate,start_on,end_on,currency,opening_debt,source) select 'HARBOUR-50','Night Ferry recording agreement',p.id,t.id,50,'2026-01-01','2027-12-31','NZD',100,'Fictional signed agreement H1' from partners p,tracks t where p.code='HARBOUR' and t.code='NZABC2600001' on conflict do nothing;
insert into contracts(code,name,partner_id,track_id,rate,start_on,end_on,currency,opening_debt,source) select 'SOUTH-40','Long Road recording agreement',p.id,t.id,40,'2026-01-01','2026-12-31','NZD',300,'Fictional signed agreement S1' from partners p,tracks t where p.code='SOUTH' and t.code='NZABC2600002' on conflict do nothing;
insert into imports(code,name,period_id,fingerprint,raw_text,source,actor) select 'DEMO','Fictional distributor report',id,'demo','isrc,units,net,territory,reseller
NZABC2600001,1000,1000.000000,NZ,Demo streams
NZABC2600002,250,200.000000,AU,Demo downloads
UNKNOWN,12,30.000000,NZ,Demo streams
','Fictional demo data','Demo' from periods where code='2026-Q3' on conflict do nothing;
insert into sales(period_id,import_id,row_no,track_id,reported_isrc,territory,reseller,units,net_amount) select i.period_id,i.id,v.n,t.id,v.isrc,v.territory,v.reseller,v.units,v.net from imports i cross join (values(1,'NZABC2600001','NZ','Demo streams',1000,1000),(2,'NZABC2600002','AU','Demo downloads',250,200),(3,'UNKNOWN','NZ','Demo streams',12,30)) v(n,isrc,territory,reseller,units,net) left join tracks t on t.code=v.isrc where i.code='DEMO' on conflict do nothing;
insert into costs(code,name,contract_id,period_id,amount,source) select 'ARTWORK','Approved artwork recoupment',c.id,p.id,50,'Fictional receipt A1 and contract clause' from contracts c,periods p where c.code='HARBOUR-50' and p.code='2026-Q3' on conflict do nothing;
insert into actions(code,name,period_id,owner,due_on) select 'CHECK-ISRC','Confirm the unidentified recording with the distributor',id,'Mere',current_date-5 from periods where code='2026-Q3' on conflict do nothing;
