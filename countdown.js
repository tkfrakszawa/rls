(function(root){
const zone='Europe/Warsaw';
function dayKey(now){const p=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(k=>p.find(x=>x.type===k).value).join('-')}
function localTime(date,time='00:00'){const base=Date.parse(date+'T'+time+':00Z');let utc=base;for(let i=0;i<2;i++){const p=new Intl.DateTimeFormat('en-GB',{timeZone:zone,timeZoneName:'longOffset'}).formatToParts(new Date(utc));let offset=p.find(x=>x.type==='timeZoneName').value.match(/GMT([+-])(\d{2}):(\d{2})/);const minutes=offset?(Number(offset[2])*60+Number(offset[3]))*(offset[1]==='+'?1:-1):0;utc=base-minutes*60000}return utc}
function midnight(date){return localTime(date)}
function nextRound(matches,now=new Date(),dateFallback=false){
 const today=dayKey(now),rounds=[...new Map(matches.map(m=>[m.date+'-'+m.round,{date:m.date,round:m.round}])).values()].sort((a,b)=>a.date.localeCompare(b.date)||a.round-b.round);
 const next=rounds.find(r=>r.date>=today&&matches.some(m=>m.date===r.date&&m.round===r.round&&!m.score));if(!next)return null;
 const games=matches.filter(m=>m.date===next.date&&m.round===next.round).sort((a,b)=>(a.order||0)-(b.order||0));
 const valid=t=>/^([01]\d|2[0-3]):[0-5]\d$/.test(t||'');
 const time=valid(games[0]?.time)?games.filter(m=>valid(m.time)).map(m=>m.time).sort()[0]:null;
 const dateOnly=!time&&dateFallback;
 const start=time?localTime(next.date,time):dateOnly?midnight(next.date):null;
 return {...next,time,dateOnly,today:next.date===today,started:!dateOnly&&start!==null&&now.getTime()>=start,seconds:start===null?null:Math.max(0,Math.ceil((start-now.getTime())/1000))};
}
root.RLSClock={nextRound,dayKey,midnight,localTime};if(typeof module!=='undefined')module.exports=root.RLSClock;
})(globalThis);
let homeKey='';
function renderCountdown(){
 if(!data)return;
 const matches=data[league],next=RLSClock.nextRound(matches,new Date(),league==='women'),el=document.querySelector('#countdown');
 if(!next){el.innerHTML=`<div><p class="eyebrow">${matches.length?'RUNDA ZASADNICZA':'RLS KOBIET'}</p><strong>${matches.length?'Wszystkie terminy kolejek już za nami':'Czekamy na terminarz'}</strong><p class="note">${matches.length?'Sprawdź wyniki i fazę finałową.':'Odliczanie pojawi się po ogłoszeniu dat rozgrywek.'}</p></div>`}
 else{
  const dateDay=next.dateOnly&&next.today;
  const s=next.seconds,parts=s===null?[]:[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60];
  const entry=data.roundInfo?.[league]?.[next.round]?.entryTime;
  el.innerHTML=`<div><p class="eyebrow">${dateDay?'DZISIAJ GRAMY':next.started?'TRWA DZIEŃ MECZOWY':next.time?'DO PIERWSZEGO MECZU':next.dateOnly?'DO DNIA ROZGRYWEK':'NAJBLIŻSZA KOLEJKA'} · ${next.round}. KOLEJKA</p><strong>${new Date(next.date+'T12:00:00Z').toLocaleDateString('pl-PL',{timeZone:'Europe/Warsaw',weekday:'long',day:'numeric',month:'long',year:'numeric'})}</strong><p class="note">${next.time?`Pierwszy mecz o ${esc(next.time)}`:next.dateOnly?'Odliczanie do daty kolejki. Godziny meczów podamy wkrótce.':'Godzina pierwszego meczu zostanie ogłoszona — wtedy uruchomimy odliczanie.'}${entry?` · Wejście na halę ${esc(entry)}`:''}</p></div>${dateDay?'<strong class="today-badge">DZIEŃ MECZOWY</strong>':next.started?'<strong class="today-badge">KOLEJKA ROZPOCZĘTA</strong>':s===null?'':'<div class="clock-digits" role="timer" aria-live="off">'+parts.map((n,i)=>`<div><b>${String(n).padStart(2,'0')}</b><span>${['DNI','GODZ','MIN','SEK'][i]}</span></div>`).join('')+'</div>'}`;
 }
 const key=league+RLSClock.dayKey(new Date())+JSON.stringify(matches);if(key!==homeKey){homeKey=key;renderHomeDashboard(matches)}
}
