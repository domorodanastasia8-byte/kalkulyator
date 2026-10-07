(() => {
const dialog=document.getElementById('download-dialog'),form=document.getElementById('download-form'),result=document.getElementById('download-result'),message=document.getElementById('download-message'),submit=document.getElementById('download-submit');
document.querySelectorAll('[data-download-open]').forEach(button=>button.addEventListener('click',()=>dialog.showModal()));
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
let busy=false;
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;
 for(const id of ['name','telegram','sphere']){document.getElementById('lead-'+id).removeAttribute('aria-invalid');document.getElementById('lead-'+id+'-error').textContent='';}
 message.textContent='';
 if(!form.reportValidity())return;
 busy=true;submit.disabled=true;submit.textContent='Сохраняем…';
 try{
  const values=new FormData(form);const response=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:values.get('name'),telegram:values.get('telegram'),sphere:values.get('sphere'),website:values.get('website'),consent:true})});
  const data=await response.json();
  if(!response.ok){
   let first=null;
   for(const [field,error] of Object.entries(data.errors||{})){const input=document.getElementById('lead-'+field),el=document.getElementById('lead-'+field+'-error');if(input&&el){input.setAttribute('aria-invalid','true');el.textContent=error;first ||=input;}}
   message.textContent=data.error||(first?'Проверьте отмеченные поля.':'Не удалось отправить форму. Попробуйте снова.');first?.focus();return;
  }
  form.hidden=true;result.hidden=false;document.getElementById('download-success-title').focus();
 }catch{message.textContent='Не удалось отправить форму. Проверьте соединение и попробуйте снова — введённые данные сохранены в форме.';}
 finally{busy=false;submit.disabled=false;submit.textContent='Получить таблицу';}
});
})();
