import {isOwner} from '../../lib/admin';
import {database} from '../../db';
import {requireChatGPTUser} from '../chatgpt-auth';
export const dynamic='force-dynamic';
export default async function Admin(){
 await requireChatGPTUser('/admin');
 if(!await isOwner())return <main><h1>Доступ закрыт</h1><p>Список контактов доступен только владельцу сайта.</p></main>;
 try{
 const {results}=await database().prepare('SELECT name,telegram,sphere,created_at FROM workbook_leads ORDER BY created_at DESC LIMIT 200').all<{name:string;telegram:string;sphere:string;created_at:number}>();
 return <main><p><a href="/">К калькулятору</a></p><h1 style={{margin:'24px 0'}}>Заявки на таблицу</h1><p>Последние 200 заявок. Выгрузка содержит все контакты.</p><p style={{margin:'20px 0'}}><a className="primary" href="/api/admin/leads">Скачать CSV</a></p><div style={{overflowX:'auto'}}><table className="funnel-table"><thead><tr><th>Имя</th><th>Telegram</th><th>Сфера</th><th>Дата, Москва</th></tr></thead><tbody>{results.map((r,i)=><tr key={i}><td style={{fontSize:16}}>{r.name}</td><td style={{fontSize:16}}><a href={'https://t.me/'+r.telegram.slice(1)} target="_blank" rel="noopener noreferrer">{r.telegram}</a></td><td style={{fontSize:16}}>{r.sphere||'—'}</td><td style={{fontSize:14}}>{new Date(r.created_at).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'})}</td></tr>)}</tbody></table></div>{!results.length&&<p>Заявок пока нет.</p>}</main>;
 }catch{return <main><h1>Заявки временно недоступны</h1><p>Обновите страницу немного позже.</p></main>}
}
