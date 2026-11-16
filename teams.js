const teamMarks={'RS Gold Team Sieniawa':['RG',43],'Same ASSY':['SA',290],'Akademia TKF':['AT',35],'Oldboys':['OB',40],'Sparta Wydrze':['SW',8],'Street Warriors':['SW',205],'NoName':['NN',270],'Young Boys':['YB',145],'Zmarnowany Potencjał':['ZP',25],'„Na Ketonalu” Żołynia':['NK',330],'Orły':['O',200],'Lucky Losers':['LL',160],'Renga SST Sportur Gmina Łańcut':['RS',235],'Pod Rozbrykanym Kucykiem':['RK',285]};
function teamBadge(name){if((name==='Akademia TKF'||name==='Akademia TKF II'))return '<img class="team-badge tkf-badge" src="assets/tkf.ec4d3da6d0.webp" alt="" loading="lazy">';const [initials,hue]=teamMarks[name]||['RLS',0];return `<span class="team-badge crest" style="--team-hue:${hue}" aria-hidden="true"><span class="crest-star">✦</span><b>${initials}</b><span class="crest-line"></span></span>`}
function teamLabel(name){return `<span class="team-label">${teamBadge(name)}<strong>${esc(name)}</strong></span>`}
function matchCard(m){return `<article class="fixture-card match-row">${m.title?`<p class="stage-label">${esc(m.title)}${m.target?` · do ${m.target} wygranych setów`:" · liczba setów do ustalenia"}</p>`:''}<div class="match-teams"><span class="team-label home-team"><strong>${esc(m.a)}</strong>${teamBadge(m.a)}</span><div class="match-score"><b>${m.score?m.score.join(' : '):esc(m.time||'TBD')}</b>${m.sets?.length?`<div class="inline-sets" aria-label="Wyniki setów">${m.sets.map((s,i)=>`<span title="Set ${i+1}">${s.join(':')}</span>`).join('')}</div>`:''}${m.score?`<small>${m.time?esc(m.time)+' · ':''}KONIEC</small>`:'<small>GODZINA</small>'}</div><span class="team-label away-team">${teamBadge(m.b)}<strong>${esc(m.b)}</strong></span></div></article>`}

function roundGroups(matches){
 const groups=new Map();
 for(const m of matches){if(!groups.has(m.round))groups.set(m.round,[]);groups.get(m.round).push(m)}
 return [...groups].sort((a,b)=>a[0]-b[0]).map(([round,games])=>{
 const dates=[...new Set(games.map(m=>m.date))].sort();
 const entryTime=data.roundInfo?.[league]?.[round]?.entryTime;
 const dateLabel=dates.map(date=>`<time datetime="${date}">${new Date(date+'T12:00:00Z').toLocaleDateString('pl-PL',{timeZone:'Europe/Warsaw',weekday:'long',day:'numeric',month:'long',year:'numeric'})}</time>`).join(' · ');
 const html=`<section class="round-group"><div class="round-heading"><h3>Kolejka ${round}</h3><div>${dateLabel}</div></div><p class="round-venue"><span aria-hidden="true">⌖</span> Hala sportowa przy ZSPiP nr 1 · Rakszawa 325</p>${entryTime?`<p class="hall-entry">Wejście na halę <strong>${esc(entryTime)}</strong></p>`:''}<div class="fixture-grid">${games.sort((a,b)=>a.order-b.order).map(matchCard).join('')}</div></section>`;
 return ['schedule','results'].includes(tab)?collapsibleRound(html,`${tab}-${league}-round-${round}`):html;
 }).join('')
}
function sundaySchedule(men,women,allDates){
 const dates=[...new Set([...men.map(m=>m.date),...(allDates?women.map(m=>m.date):[])])].sort();
 const intro='<p class="sunday-key"><span class="women-key">RLS kobiet — pierwsze mecze</span><span class="men-key">RLS mężczyzn</span></p>';
 return intro+dates.map(date=>{
  const male=men.filter(m=>m.date===date).sort((a,b)=>a.order-b.order);
  const female=women.filter(m=>m.date===date).sort((a,b)=>a.order-b.order);
  const entry=data.roundInfo?.men?.[male[0]?.round]?.entryTime||data.roundInfo?.women?.[female[0]?.round]?.entryTime;
  const dateText=new Date(date+'T12:00:00Z').toLocaleDateString('pl-PL',{timeZone:'Europe/Warsaw',weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const block=(games,isWomen)=>games.length?`<div class="sunday-league ${isWomen?'sunday-women':'sunday-men'}"><h4>${isWomen?'RLS kobiet':'RLS mężczyzn'} · Kolejka ${games[0].round}</h4><div class="fixture-grid">${games.map(m=>scheduleBreakBefore(m,isWomen?'women':'men')+matchCard(m)).join('')}</div></div>`:'';
  const html=`<section class="round-group sunday-group"><div class="round-heading"><h3>Kolejka ${male[0]?.round??female[0]?.round}</h3><div><time datetime="${date}">${dateText}</time></div></div><p class="round-venue"><span aria-hidden="true">⌖</span> Hala sportowa przy ZSPiP nr 1 · Rakszawa 325</p>${entry?`<p class="hall-entry">Wejście na halę <strong>${esc(entry)}</strong></p>`:''}${block(female,true)}${block(male,false)}</section>`;
  return collapsibleRound(html,`schedule-men-date-${date}`);
 }).join('');
}

const expandedRounds=new Set();
function collapsibleRound(html,key){
 return html.replace('<section class="round-group',`<details data-round-key="${key}" ${expandedRounds.has(key)?'open':''} class="round-disclosure round-group`)
 .replace('<div class="round-heading">','<summary class="round-heading">')
 .replace('</div><p class="round-venue">','<span class="round-toggle"><span class="when-open">Zwiń mecze</span><span class="when-closed">Rozwiń mecze</span><svg class="round-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></summary><div class="round-body"><p class="round-venue">')
 .replace(/<\/section>$/,'</div></details>');
}
document.addEventListener('toggle',event=>{
 const element=event.target;
 if(!element.matches?.('details[data-round-key]')||!element.isConnected)return;
 if(element.open)expandedRounds.add(element.dataset.roundKey);else expandedRounds.delete(element.dataset.roundKey);
},true);

function scheduleBreakBefore(match,matchLeague){
 const pause=data.roundInfo?.[matchLeague]?.[match.round]?.breakBefore;
 return pause&&pause.matchId===match.id?`<aside class="schedule-break" aria-label="Przerwa w rozgrywkach"><strong>${esc(pause.title)}</strong><p>${esc(pause.text)}</p></aside>`:'';
}
