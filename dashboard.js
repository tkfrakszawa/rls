let dashboardTab='upcoming';
function renderHomeDashboard(matches){
 const {next, games: upcoming} = upcomingDay(matches);
 const played=matches.filter(m=>m.score).sort((a,b)=>b.date.localeCompare(a.date)||b.round-a.round);
 const last=played[0];const recent=last?matches.filter(m=>m.round===last.round&&m.score).sort((a,b)=>a.order-b.order):[];
 const complete=last&&matches.filter(m=>m.round===last.round).every(m=>m.score);
 const teams=RLS.standings(matches);
 const date=d=>new Date(d+'T12:00:00Z').toLocaleDateString('pl-PL',{day:'numeric',month:'long',timeZone:'Europe/Warsaw'});
 const empty=text=>`<p class="dashboard-empty">${text}</p>`;
 const miniMatch=m=>`<article class="mini-match"><span class="mini-team">${teamBadge(m.a)}<strong>${esc(m.a)}</strong></span><div class="mini-score"><b>${m.score?m.score.join(':'):esc(m.time||'TBD')}</b>${m.sets?.length?`<small>${m.sets.map(s=>s.join(':')).join(' · ')}</small>`:''}</div><span class="mini-team">${teamBadge(m.b)}<strong>${esc(m.b)}</strong></span></article>`;
 const showDivisions = league === 'men' && upcoming.some(game => game.division === 'women');
 const groups = [];
 for (const {match, division} of upcoming) {
   let group = groups[groups.length - 1];
   if (!group || group.division !== division || group.round !== match.round) {
     group = {division, round: match.round, rows: []};
     groups.push(group);
   }
   group.rows.push(scheduleBreakBefore(match, division) + miniMatch(match));
 }
 const upcomingCards = groups.map(({division, round, rows}) => {
   const cards = rows.join('');
   if (!showDivisions) return cards;
   const title = division === 'women' ? 'RLS kobiet' : 'RLS mężczyzn';
   return `<section class="sunday-league sunday-${division}"><h4>${title} · Kolejka ${round}</h4><div class="dashboard-fixtures">${cards}</div></section>`;
 }).join('');
 document.querySelector('#home-matches').innerHTML=`<nav class="dashboard-tabs" aria-label="Podsumowanie ligi">${[['upcoming','Terminarz'],['recent','Wyniki'],['standings','Tabela']].map(([id,label])=>`<button data-dashboard="${id}" aria-pressed="${id===dashboardTab}">${label}</button>`).join('')}</nav><div class="home-dashboard" data-selected="${dashboardTab}"><section class="dashboard-panel" data-panel="upcoming"><div class="dashboard-heading"><h2>Najbliższa kolejka</h2><button data-home-open="schedule" aria-label="Pełny terminarz">↗</button></div><p class="dashboard-subtitle">${next?`Kolejka ${next.round} · ${date(next.date)}`:'Terminarz'}</p>${next&&data.roundInfo?.[league]?.[next.round]?.entryTime?`<p class="dashboard-entry">Wejście na halę ${esc(data.roundInfo[league][next.round].entryTime)}</p>`:''}<div class="dashboard-scroll" tabindex="0" aria-label="Mecze najbliższej kolejki">${upcoming.length?upcomingCards:empty(matches.length?'Brak kolejnych zaplanowanych meczów.':'Terminarz pojawi się wkrótce.')}</div><button class="dashboard-more" data-home-open="schedule">Pełny terminarz →</button></section><section class="dashboard-panel" data-panel="recent"><div class="dashboard-heading"><h2>Ostatnie wyniki</h2><button data-home-open="results" aria-label="Wszystkie wyniki">↗</button></div><p class="dashboard-subtitle">${last?`Kolejka ${last.round} · ${date(last.date)}${complete?'':' · wyniki częściowe'}`:'Czekamy na pierwsze wyniki'}</p><div class="dashboard-scroll" tabindex="0" aria-label="Wyniki ostatniej kolejki">${recent.length?recent.map(miniMatch).join(''):empty('Po rozegraniu meczów wyniki pojawią się tutaj.')}</div><button class="dashboard-more" data-home-open="results">Wszystkie wyniki →</button></section><section class="dashboard-panel" data-panel="standings"><div class="dashboard-heading"><h2>Tabela</h2><button data-home-open="table" aria-label="Pełna tabela">↗</button></div><div class="dashboard-scroll" tabindex="0" aria-label="Skrócona tabela ligi">${teams.length?`<table class="mini-table"><thead><tr><th scope="col">#</th><th scope="col">Drużyna</th><th scope="col" title="Zwycięstwa — pierwsze kryterium">W</th><th scope="col" title="Punkty — drugie kryterium">Pkt</th></tr></thead><tbody>${teams.map((r,i)=>`<tr class="${league==='men'&&i<4?'finals-position':''}"><td>${i+1}</td><td>${esc(r.name)}</td><td>${r.w}</td><td>${r.p}</td></tr>`).join('')}</tbody></table>`:empty('Lista drużyn pojawi się wkrótce.')}</div>${league==='men'?'<p class="finals-legend"><span></span> Miejsca 1–4 · faza finałowa</p>':''}<button class="dashboard-more" data-home-open="table">Pełna tabela →</button></section></div>`;
}
document.addEventListener('click',event=>{const toggle=event.target.closest('[data-dashboard]');if(toggle){dashboardTab=toggle.dataset.dashboard;document.querySelector('.home-dashboard').dataset.selected=dashboardTab;document.querySelectorAll('[data-dashboard]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dashboard===dashboardTab)))}const link=event.target.closest('[data-home-open]');if(link){tab=link.dataset.homeOpen;render();window.scrollTo(0,0)}});
