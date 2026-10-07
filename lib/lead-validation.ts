export function validateLead(input:unknown){
 const d=(input && typeof input==='object'?input:{}) as Record<string,unknown>;
 const name=typeof d.name==='string'?d.name.trim().replace(/\s+/g,' '):'';
 const raw=typeof d.telegram==='string'?d.telegram.trim():'';
 const telegram=raw.replace(/^https?:\/\/(?:www\.)?t\.me\//i,'').replace(/^@/,'').replace(/\/$/,'');
 const sphere=typeof d.sphere==='string'?d.sphere.trim():'';
 const errors:Record<string,string>={};
 if(name.length<2||name.length>80||/[\x00-\x1f<>]/.test(name))errors.name='Укажите имя: от 2 до 80 символов.';
 if(!/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(telegram))errors.telegram='Укажите ник Telegram, например @your_name. От 5 до 32 латинских букв, цифр или знаков подчёркивания.';
 if(sphere.length>160||/[\x00-\x1f<>]/.test(sphere))errors.sphere='Сократите описание до 160 символов.';
 if(d.consent!==true)errors.consent='Подтвердите передачу контактных данных.';
 return {name,telegram:'@'+telegram.toLowerCase(),sphere,errors};
}
export async function tokenHash(token:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
