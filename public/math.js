(function(root){
  'use strict';
  const num = v => v === '' || v === null || v === undefined ? null : Number(v);
  const ratio = (a,b) => b > 0 ? a/b : null;
  function normalize(d){
    const n={...d};
    if(d.ticketMode==='revenue')n.ticket=ratio(num(d.firstRevenue),num(d.customers));
    if(d.marginMode==='amount')n.margin=num(d.marginBase)>0&&num(d.marginRemaining)!==null?num(d.marginRemaining)/num(d.marginBase)*100:null;
    return n;
  }
  function missing(d){
    return ['budget',...(d.mode==='lead'?['leads']:[]),'customers',d.ticketMode==='revenue'?'firstRevenue':'ticket'].filter(k=>d.confidence?.[k]==='unknown');
  }
  function calculate(d){
    d=normalize(d);
    const budget=num(d.budget)||0,leads=d.mode==='lead'?num(d.leads):null,customers=num(d.customers)||0,ticket=num(d.ticket)||0;
    const repeatOrders=d.repeat?num(d.repeatOrders)||0:0,repeatTicket=d.repeat?num(d.repeatTicket)||0:0;
    const margin=num(d.margin), firstRevenue=customers*ticket,repeatRevenue=repeatOrders*repeatTicket,revenue=firstRevenue+repeatRevenue;
    const contribution=margin===null?null:revenue*margin/100-budget;
    return {budget,leads,customers,ticket,repeatOrders,repeatTicket,margin,firstRevenue,repeatRevenue,revenue,contribution,
      cpl:d.mode==='lead'?ratio(budget,leads):null,cac:d.scope==='ads'?ratio(budget,customers):null,
      saleConversion:d.mode==='lead'?ratio(customers,leads):null,
      roas:d.scope==='ads'?ratio(firstRevenue,budget):null,
      romi:d.scope==='ads'&&margin!==null&&budget>0?(firstRevenue*margin/100-budget)/budget:null};
  }
  function makeScenarios(d,settings={}){
    const b=calculate(d),out=[];
    const add=(id,title,description,initial,min,max,step,unit,run)=>{
      const st=settings[id]||{},value=Math.min(max,Math.max(min,num(st.value)??initial)),cost=Math.max(0,num(st.cost)||0);
      const x=run(value),revenue=x.customers*x.ticket+(b.repeatOrders+(x.extraOrders||0))*b.repeatTicket;
      const delta=revenue-b.revenue,netDelta=b.margin===null?null:delta*b.margin/100-cost;
      out.push({id,title,description,value,min,max,step,unit,cost,revenue,delta,netDelta,customers:x.customers,ticket:x.ticket,extraOrders:x.extraOrders||0});
    };
    if(d.mode==='lead'&&b.leads>0){
      const current=b.saleConversion*100;
      add('sales','Конверсия заявки в покупку',`Сейчас ${current.toLocaleString('ru-RU',{maximumFractionDigits:1})}%. Количество заявок не меняется.`,Math.min(100,current+5),current,100,0.1,'%',v=>({customers:b.leads*v/100,ticket:b.ticket}));
    }
    add('ticket','Средний чек первой покупки','Число покупателей и повторные заказы остаются прежними.',b.ticket*1.1,b.ticket,Math.max(b.ticket*2,1),Math.max(b.ticket/100,0.01),'money',v=>({customers:b.customers,ticket:v}));
    if(d.scope==='ads'&&b.budget>0&&b.customers>0){
      add('acquisition',d.mode==='lead'?'Снижение стоимости заявки':'Снижение стоимости покупателя','При прежнем бюджете и конверсиях. Предполагаем, что качество трафика сохраняется.',10,0,50,1,'discount',v=>({customers:b.customers/(1-v/100),ticket:b.ticket}));
    }
    if(d.repeat||d.hasBase){
      const base=num(d.baseSize),returnTicket=num(d.returnTicket)??(b.repeatTicket>0?b.repeatTicket:b.ticket),limit=base!==null?base:Math.max(100,b.repeatOrders);
      add('repeat','Вернуть клиентов за повторной покупкой',`Средний чек возвращённого клиента: ${returnTicket.toLocaleString('ru-RU')}. ${base!==null?'Доступная база: '+base+' клиентов. Один дополнительный заказ на клиента.':'Размер базы не указан — достижимость числа заказов нужно проверить.'}`,Math.min(10,limit),0,limit,1,'orders',v=>({customers:b.customers,ticket:b.ticket,extraOrders:0}));
      const s=out[out.length-1];s.extraOrders=s.value;s.returnTicket=returnTicket;s.baseSize=base;s.revenue=b.revenue+s.value*returnTicket;s.delta=s.value*returnTicket;s.netDelta=b.margin===null?null:s.delta*b.margin/100-s.cost;
    }
    return out;
  }
  function validate(d,step){
    const errors={};
    const field=(key,label,required=true,integer=false,positive=false)=>{
      if(d.confidence?.[key]==='unknown')return;
      const v=num(d[key]);if(v===null){if(required)errors[key]='Укажите '+label;return;}
      if(!Number.isFinite(v)||v<0||v>1e12)errors[key]='Введите число от 0 до 1 000 000 000 000';
      else if(integer&&!Number.isInteger(v))errors[key]='Введите целое количество';
      else if(positive&&v<=0)errors[key]='Введите значение больше нуля';
    };
    if(step>=1){field('budget','расходы на рекламу');if(d.mode==='lead')field('leads','количество заявок',true,true);}
    if(step>=2){field('customers','число новых покупателей',true,true);if(d.ticketMode==='revenue')field('firstRevenue','выручку первых покупок',true,false,num(d.customers)>0);else field('ticket','средний чек',true,false,true);if(d.mode==='lead'&&d.confidence?.customers!=='unknown'&&d.confidence?.leads!=='unknown'&&num(d.customers)>num(d.leads))errors.customers='Покупателей не может быть больше заявок в этой воронке';if(d.ticketMode==='revenue'&&num(d.customers)===0&&d.confidence?.customers!=='unknown')errors.firstRevenue='Без покупателей средний чек из выручки не определить. Выберите ввод среднего чека и укажите ожидаемую цену первой покупки.';}
    if(step>=3){field('margin','маржинальность',false);if(num(d.margin)>100)errors.margin='Маржинальность должна быть от 0 до 100%';if(d.repeat){field('repeatOrders','число повторных заказов',true,true);field('repeatTicket','средний чек повторного заказа',true,false,true);}}
    if(step>=3&&d.marginMode==='amount'){
      delete errors.margin;const provided=num(d.marginBase)!==null||num(d.marginRemaining)!==null;
      field('marginBase','цену типичной продажи',provided,false,true);field('marginRemaining','остаток от продажи',provided);
      if(num(d.marginRemaining)>num(d.marginBase))errors.marginRemaining='Остаток не может быть больше цены продажи';
    }
    if(step>=3&&(d.repeat||d.hasBase)){field('baseSize','размер доступной базы',false,true);field('returnTicket','чек возвращённого клиента',false,false,true);}
    return errors;
  }
  const api={num,normalize,missing,calculate,makeScenarios,validate};root.GrowthMath=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
