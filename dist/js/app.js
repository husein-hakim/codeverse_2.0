(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const config = window.CODEVERSE_CONFIG || {};
const media = matchMedia('(prefers-reduced-motion: reduce)');
let manualMotionOff = false;
let currentBeat = -1;
const reduced = () => media.matches || manualMotionOff;
document.documentElement.classList.add('js');
const loader = $('.loading');
const finishLoad = () => loader.classList.add('done');
Promise.race([Promise.all([document.fonts.ready, $('.hero-image').decode().catch(()=>{})]), new Promise(r=>setTimeout(r,1600))]).then(finishLoad);
let toastTimer;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(()=>$('#toast').classList.remove('visible'),4200); }
const times = {
 open: Date.parse('2026-09-29T00:00:00+05:30'),
 close: Date.parse('2026-10-07T00:00:00+05:30'),
 start: Date.parse('2026-10-09T08:00:00+05:30'),
 end: Date.parse('2026-10-09T18:00:00+05:30')
};
function registrationState(now = Date.now(), seats = config.seatsRemaining) {
 if (now >= times.end) return 'over';
 if (now >= times.start) return 'live';
 if (seats === 0) return 'full';
 if (now < times.open) return 'before';
 if (now < times.close) return 'open';
 return 'closed';
}
function countdown(target, now) { const s = Math.max(0,Math.floor((target-now)/1000)); return `${Math.floor(s/86400)}d ${String(Math.floor(s%86400/3600)).padStart(2,'0')}h ${String(Math.floor(s%3600/60)).padStart(2,'0')}m`; }
function updateRegistration() {
 const now=Date.now(), state=registrationState(now);
 const label = {before:'Opens 29 Sep',open:'Join the crew',full:'Every seat is taken',closed:'Registration closed',live:'Registration closed',over:'Registration closed'}[state];
 const status = {before:`Registration opens 29 Sep · in ${countdown(times.open,now)}`,open:`Registration open · closes in ${countdown(times.close,now)}${Number.isInteger(config.seatsRemaining)&&config.seatsRemaining>0&&config.seatsRemaining<=45?` · ${config.seatsRemaining} of 45 seats left`:''}`,full:'All 45 crews are in · see you on 9 Oct',closed:'Registration closed · see you on 9 Oct',live:'Live now · Dwarkadas J. Sanghvi College of Engineering',over:'The heist is over · thanks for playing'}[state];
 $('#registration-status').textContent=status;
 $$('[data-join]').forEach(a=>{
  a.replaceChildren(document.createTextNode(state==='open'&&a.closest('.final-cta')?'Join the crew on Unstop ':`${label} `)); const arrow=document.createElement('span');arrow.textContent='↗';a.append(arrow);
  const validUrl = /^https:\/\/(www\.)?unstop\.com\//.test(config.unstopUrl || '');
  a.href=state==='open'&&validUrl?config.unstopUrl:'#registration';
  if(state==='open'&&validUrl){a.target='_blank';a.rel='noopener';}else{a.removeAttribute('target');a.removeAttribute('rel');}
  a.dataset.state=state;
 });
 $('#registration-note').textContent=state==='before'?'Registration opens 29 September on Unstop.':state==='open'&&!config.unstopUrl?'The Unstop registration link is coming soon. Questions? Contact Adish Shah.':state==='open'?'Form your crew of three on Unstop.':status;
 const eventDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
 const clock=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(now));
 $$('.timeline li').forEach(li=>{li.querySelector('.now-tag')?.remove();if(eventDate==='2026-10-09'&&clock>=li.dataset.start&&clock<li.dataset.end){const tag=document.createElement('b');tag.className='now-tag';tag.textContent='NOW';li.querySelector('span').append(tag);}});
}
updateRegistration(); setInterval(updateRegistration,30000);
$$('[data-join]').forEach(a=>a.addEventListener('click',()=>{if(a.dataset.state==='open'&&!config.unstopUrl)toast('The Unstop link is coming soon. Contact Adish Shah for details.');}));
window.CodeVerse={registrationState,times};
const beats=[
 ['Madrid · 09.10 · Operation CodeVerse','Today, the training ends.\nToday, you go in.'],
 ['The Professor presents','Forty-five crews of three.\nOne mint.'],
 ['Phase 01 · Entry','Two phases. Ten hours.\nNo second chances.'],
 ['Phase 02 · The Loot','₹25,000. Inside the vault.\nWaiting for the right crew.'],
 ['The heist begins 09 October','The Professor is recruiting.']
];
function beat(index) {
 if(reduced() || index===currentBeat) return;
 currentBeat=index;$('#hero-kicker').textContent=beats[index][0];$('#hero-line').replaceChildren();
 beats[index][1].split('\n').forEach((line,i)=>{if(i)$('#hero-line').append(document.createElement('br'));$('#hero-line').append(document.createTextNode(line));});
 $('#beat-number').textContent=String(index+1).padStart(2,'0');$$('.beat-track i').forEach((e,i)=>e.classList.toggle('active',i<=index));
 $('.beat-panel').classList.remove('changing');$('#hero-kicker').classList.remove('changing');
 requestAnimationFrame(()=>{$('.beat-panel').classList.add('changing');$('#hero-kicker').classList.add('changing');});
}
beat(0);
let storyObserver;
function observeStory(){
 storyObserver?.disconnect();
 const margin=Math.round(innerHeight*.45);
 storyObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)beat(Number(e.target.dataset.beat));},{rootMargin:`-${margin}px 0px -${margin}px 0px`,threshold:0});
 $$('[data-beat]').forEach(e=>storyObserver.observe(e));
}
observeStory();
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(observeStory,150);},{passive:true});
function updateMotion(){
 document.body.classList.toggle('motion-off',reduced());$('#motion-toggle').textContent=`Motion: ${reduced()?'off':'on'}`;$('#motion-toggle').setAttribute('aria-pressed',String(reduced()));
 if(reduced()){ $('#hero-kicker').textContent=beats[0][0];$('#hero-line').textContent='Forty-five crews of three. One mint.';$$('[data-reveal]').forEach(e=>e.classList.add('visible')); }
 else {currentBeat=-1;beat(0);}
}
$('#motion-toggle').addEventListener('click',()=>{manualMotionOff=!manualMotionOff;updateMotion();if(media.matches&&!manualMotionOff)toast('Reduced motion is enabled in your device settings.');});media.addEventListener('change',updateMotion);updateMotion();
const revealObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('visible');e.target.querySelectorAll('[data-count]').forEach(counter=>{if(reduced())return;const target=Number(counter.dataset.count),start=performance.now();function tick(now){const p=Math.min((now-start)/650,1);counter.textContent=Math.round((1-Math.pow(1-p,3))*target);if(p<1)requestAnimationFrame(tick);}requestAnimationFrame(tick);});revealObserver.unobserve(e.target);});},{threshold:.08,rootMargin:'0px 0px -30px 0px'});$$('[data-reveal]').forEach(e=>revealObserver.observe(e));
const menu=$('.menu-toggle');function closeMenu(){menu.setAttribute('aria-expanded','false');$('#mobile-menu').hidden=true;menu.setAttribute('aria-label','Open navigation');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));$('#mobile-menu').hidden=open;menu.setAttribute('aria-label',open?'Open navigation':'Close navigation');});$$('#mobile-menu a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();}});
function download(blob,filename){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
const eventDetails={title:'CodeVerse 2.0 · The Heist',location:'Dwarkadas J. Sanghvi College of Engineering, Bhaktivedanta Swami Marg, Vile Parle (West), Mumbai',description:'Forty-five crews of three. One mint. ₹25,000 in prizes. Registration desk opens at 08:00.'};
$('#google-calendar').href=`https://calendar.google.com/calendar/render?${new URLSearchParams({action:'TEMPLATE',text:eventDetails.title,dates:'20261009T023000Z/20261009T123000Z',details:eventDetails.description,location:eventDetails.location,ctz:'Asia/Kolkata'})}`;
$('#download-calendar').addEventListener('click',()=>{const escape=s=>s.replace(/\\/g,'\\\\').replace(/,/g,'\\,').replace(/;/g,'\\;').replace(/\n/g,'\\n');const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CodeAI//CodeVerse 2.0//EN','BEGIN:VEVENT','UID:codeverse-20261009@djscodeai','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART:20261009T023000Z','DTEND:20261009T123000Z','SUMMARY:'+escape(eventDetails.title),'LOCATION:'+escape(eventDetails.location),'DESCRIPTION:'+escape(eventDetails.description),'END:VEVENT','END:VCALENDAR'];download(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}),'codeverse-the-heist.ics');});
const codenames=['Tokyo','Berlin','Nairobi','Rio','Denver','Helsinki','Oslo','Moscow','Lisbon','Palermo','Bogota','Manila','Stockholm','Marseille'];
let identity=null;
function random(max){const data=new Uint32Array(1);crypto.getRandomValues(data);return data[0]%max;}
function assign(){const name=$('#crew-name').value.trim();if(!name){$('#crew-name').setCustomValidity('Enter your name to receive a crew ID.');$('#crew-name').reportValidity();return;}$('#crew-name').setCustomValidity('');let available=codenames.filter(c=>c!==identity?.codename);identity={name,codename:available[random(available.length)],id:'CV2-1009-'+String(random(10000)).padStart(4,'0')};$('#id-name').textContent=name;$('#id-number').textContent='ID: '+identity.id;$('#id-codename').textContent=identity.codename.toUpperCase();$('#crew-confirmation').textContent=`Welcome to the crew, ${identity.codename}.`;$$('.id-actions button').forEach(b=>b.disabled=false);if(!reduced())$('#crew-card').animate([{opacity:.5,transform:'rotate(3deg) translateY(8px)'},{opacity:1,transform:'rotate(3deg) translateY(0)'}],{duration:450,easing:'cubic-bezier(.16,1,.3,1)'});}
$('#crew-name').addEventListener('input',()=>$('#crew-name').setCustomValidity(''));$('#codename-form').addEventListener('submit',e=>{e.preventDefault();assign();});$('#roll-again').addEventListener('click',assign);
async function idBlob(){if(!identity)return null;await document.fonts.ready;const c=document.createElement('canvas');c.width=1200;c.height=740;const ctx=c.getContext('2d');ctx.fillStyle='#dedfd5';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#23251e';ctx.font='24px "IBM Plex Mono",monospace';ctx.fillText('CREW FILE',60,65);ctx.fillText('09.10',1030,65);ctx.fillRect(60,90,1080,2);ctx.font='18px "IBM Plex Mono",monospace';ctx.fillText('OPERATION CODEVERSE',60,130);ctx.fillStyle='#252821';ctx.fillRect(60,180,200,200);ctx.fillStyle='#dedfd5';ctx.font='bold 65px monospace';ctx.fillText('</>',92,300);ctx.fillStyle='#6b7162';ctx.font='18px monospace';ctx.fillText('NAME',300,210);ctx.fillStyle='#23251e';let size=45;do{ctx.font=`600 ${size--}px "DM Sans",sans-serif`;}while(ctx.measureText(identity.name).width>790&&size>16);ctx.fillText(identity.name,300,280);ctx.font='22px monospace';ctx.fillText('ID: '+identity.id,300,340);ctx.fillStyle='#6b7162';ctx.font='18px monospace';ctx.fillText('CODENAME',60,435);ctx.fillStyle='#23251e';ctx.font='700 120px "Barlow Condensed",sans-serif';ctx.fillText(identity.codename.toUpperCase(),60,560);ctx.fillRect(60,610,1080,1);ctx.font='18px monospace';ctx.fillText('09.10.2026 · DJSCE MUMBAI',60,650);ctx.fillText('@DJSCODEAI',920,650);ctx.fillStyle='#ad292d';ctx.font='20px monospace';ctx.fillText('CLASSIFIED',960,705);for(let x=60;x<450;x+=random(7)+5)ctx.fillRect(x,680,random(3)+1,32);return new Promise(resolve=>c.toBlob(resolve,'image/png'));}
$('#download-id').addEventListener('click',async()=>{try{const blob=await idBlob();if(blob)download(blob,`${identity.codename.toLowerCase()}-crew-id.png`);}catch{toast('Unable to create your card. Please try again.');}});
const shareLine='Join our crew for CodeVerse 2.0, a Money Heist themed event on 9 October at DJSCE. Teams of 3. ₹99.';
async function share(text,withCard=false){try{const blob=withCard?await idBlob():null;const file=blob?new File([blob],`${identity.codename}-crew-id.png`,{type:'image/png'}):null;const data={title:eventDetails.title,text,url:location.href.split('#')[0]};if(file&&navigator.canShare?.({files:[file]}))data.files=[file];if(navigator.share){await navigator.share(data);return;}if(navigator.clipboard){await navigator.clipboard.writeText(text+'\n'+data.url);toast('Copied. Send it to your crew.');}else{toast('Sharing is unavailable in this browser. Download your card to send it.');}}catch(e){if(e.name!=='AbortError')toast('Sharing is unavailable. Try downloading your crew ID.');}}
$('#share-id').addEventListener('click',()=>share(`${identity.codename}, reporting for duty. ${shareLine}`,true));$('.share-event').addEventListener('click',()=>share(shareLine));
for(const [key,heading] of [['sponsors','The Financiers'],['organizers','The Crew']]){const items=config[key]||[];if(!items.length)continue;const section=$('#'+key);section.hidden=false;section.setAttribute('data-reveal','');revealObserver.observe(section);items.forEach(item=>{const card=document.createElement('article');if(item.photo||item.logo){const img=document.createElement('img');img.src=item.photo||item.logo;img.alt=item.name||'';img.loading='lazy';card.append(img);}const title=document.createElement('h3');title.textContent=item.codename||item.name;card.append(title);if(item.role){const p=document.createElement('p');p.textContent=item.name+' · '+item.role;card.append(p);}if(item.url&&/^https?:\/\//.test(item.url)){const a=document.createElement('a');a.href=item.url;a.textContent=item.name+' ↗';a.target='_blank';a.rel='noopener';card.append(a);}section.querySelector('.optional-grid').append(card);});}
let audio=null,oscillators=[],soundOn=false;
$('#sound-toggle').addEventListener('click',async()=>{try{if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();if(!soundOn){await audio.resume();const gain=audio.createGain();gain.gain.value=.018;gain.connect(audio.destination);oscillators=[55,82.41,110].map(f=>{const o=audio.createOscillator();o.type='sine';o.frequency.value=f;o.connect(gain);o.start();return o;});soundOn=true;}else{oscillators.forEach(o=>o.stop());oscillators=[];soundOn=false;}$('#sound-toggle').textContent=`♪ Sound: ${soundOn?'on':'off'}`;$('#sound-toggle').setAttribute('aria-pressed',String(soundOn));}catch{toast('Sound is unavailable in this browser.');}});
document.addEventListener('visibilitychange',()=>{if(audio){if(document.hidden)audio.suspend();else if(soundOn)audio.resume();}});
})();
