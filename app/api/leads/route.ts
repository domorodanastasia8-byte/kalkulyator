import {notifyLead} from '../../../lib/telegram';
import {database} from '../../../db';
import {validateLead,tokenHash} from '../../../lib/lead-validation';
export async function POST(req:Request){
 const headers={'Cache-Control':'no-store'};
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Запрос отклонён.'},{status:403,headers});
 if(!req.headers.get('content-type')?.includes('application/json'))return Response.json({error:'Неверный формат.'},{status:415,headers});
 try{
  const body=await req.text();if(body.length>4096)return Response.json({error:'Слишком большой запрос.'},{status:413,headers});
  let data;try{data=JSON.parse(body);}catch{return Response.json({error:'Неверный формат.'},{status:400,headers});}
  if(data.website)return Response.json({error:'Не удалось отправить форму.'},{status:400,headers});
  const lead=validateLead(data);if(Object.keys(lead.errors).length)return Response.json({errors:lead.errors},{status:400,headers});
  const now=Date.now(),db=database();
  const recent=await db.prepare('SELECT COUNT(*) AS n FROM workbook_leads WHERE telegram = ? AND created_at > ?').bind(lead.telegram,now-3600000).first<{n:number}>();
  if((recent?.n||0)>=5)return Response.json({error:'Вы уже отправляли форму. Попробуйте снова через час.'},{status:429,headers});
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
  await db.prepare('INSERT INTO workbook_leads (id,name,telegram,sphere,created_at,consent_version,token_hash,expires_at) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),lead.name,lead.telegram,lead.sphere,now,'workbook-contact-v1',await tokenHash(token),now+86400000).run();
  await notifyLead(lead);
  return Response.json({download:'/api/workbook'},{headers:{...headers,'Set-Cookie':`workbook_access=${token}; HttpOnly; Secure; SameSite=Lax; Path=/api/workbook; Max-Age=86400`}});
 }catch{console.error('workbook_lead_save_failed');return Response.json({error:'Не удалось сохранить контакты. Ваши данные остались в форме — попробуйте ещё раз.'},{status:503,headers});}
}
