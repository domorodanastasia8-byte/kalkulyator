import {database} from '../../../../db';
import {isOwner} from '../../../../lib/admin';
export async function GET(){
 const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
 if(!await isOwner())return new Response('Доступ закрыт',{status:403,headers});
 try{
 const {results}=await database().prepare('SELECT name,telegram,sphere,created_at FROM workbook_leads ORDER BY created_at DESC').all<{name:string;telegram:string;sphere:string;created_at:number}>();
 const cell=(v:string)=>'"'+(/^[=+\-@\t\r]/.test(v)?"'"+v:v).replaceAll('"','""')+'"';
 const rows=[['Имя','Telegram','Сфера деятельности','Дата (UTC)'],...results.map(r=>[r.name,r.telegram,r.sphere,new Date(r.created_at).toISOString()])];
 return new Response('\uFEFF'+rows.map(r=>r.map(cell).join(';')).join('\r\n'),{headers:{...headers,'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="workbook-leads.csv"'}});
 }catch{return new Response('Список временно недоступен',{status:503,headers});}
}
