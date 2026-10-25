import {readFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT,loadEnv} from './lib/db.mjs';
export async function seed(db){if((await db.query('select 1 from partners limit 1')).length)return {skipped:true};await db.exec('BEGIN');try{await db.exec(readFileSync(path.join(REPO_ROOT,'supabase/seed.sql'),'utf8'));await db.exec('COMMIT');return {seeded:true};}catch(e){await db.exec('ROLLBACK');throw e;}}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){loadEnv();if(process.env.DATABASE_URL)throw Error('Demo seed refuses DATABASE_URL');const db=await getDb();try{console.log(await seed(db));}finally{await db.close();}}
