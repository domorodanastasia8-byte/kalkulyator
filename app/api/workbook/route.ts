import {database} from '../../../db';
import {tokenHash} from '../../../lib/lead-validation';
import {workbookBase64} from '../../../lib/workbook';
export async function GET(req:Request){
 const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
 const token=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('workbook_access='))?.slice(16);
 if(!token||!/^[a-f0-9]{64}$/.test(token))return new Response('Сначала заполните форму на главной странице.',{status:403,headers});
 try{
  const row=await database().prepare('SELECT id FROM workbook_leads WHERE token_hash = ? AND expires_at > ? LIMIT 1').bind(await tokenHash(token),Date.now()).first();
  if(!row)return new Response('Ссылка истекла. Заполните форму на главной странице ещё раз.',{status:403,headers});
  const bytes=Uint8Array.from(atob(workbookBase64),c=>c.charCodeAt(0));
  return new Response(bytes,{headers:{...headers,'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':'attachment; filename="owner-business-workbook.xlsx"'}});
 }catch{console.error('workbook_download_failed');return new Response('Не удалось скачать файл. Попробуйте снова.',{status:503,headers});}
}
