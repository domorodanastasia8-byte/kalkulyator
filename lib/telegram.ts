import {env} from 'cloudflare:workers';
export async function notifyLead(lead:{name:string;telegram:string;sphere:string}){
 const config=env as unknown as Record<string,string>;
 const token=config.TELEGRAM_BOT_TOKEN,chat=config.TELEGRAM_CHAT_ID;
 if(!token||!chat)return;
 try{
  const response=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:chat,text:`Новая заявка — Калькулятор роста\n\nИмя: ${lead.name}\nTelegram: ${lead.telegram}\nСфера деятельности: ${lead.sphere||'Не указана'}\n\nЗапрос: рабочая таблица собственника`,link_preview_options:{is_disabled:true}}),signal:AbortSignal.timeout(5000)});
  const result=await response.json() as {ok?:boolean};
  if(!response.ok||!result.ok)console.error('telegram_lead_delivery_failed');
 }catch{console.error('telegram_lead_delivery_failed');}
}
