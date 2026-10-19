/* Interaction layer also works when WebGL is unavailable. */
(() => {
const body=document.body, journey=document.querySelector('.journey'), chapters=[...document.querySelectorAll('.chapter')], copies=chapters.map(x=>x.querySelector('.chapter-copy'));
const reduced=matchMedia('(prefers-reduced-motion: reduce)'), menu=document.querySelector('.menu-button'), mobileMenu=document.querySelector('#mobile-menu'), pause=document.querySelector('#motion-toggle');
let stopped=reduced.matches, scene=null, active=-1, rendered=0, target=0, lastTime=0, isVisible=true, time=0, sceneDirty=true, lastDraw=-1;
body.classList.add('enhanced');
function pauseUI(){body.classList.toggle('motion-off',stopped);document.documentElement.classList.toggle('motion-off',stopped);sceneDirty=true;pause.setAttribute('aria-pressed',String(stopped));pause.querySelector('.motion-word').textContent=stopped?'Включить движение':'Остановить движение';pause.firstElementChild.textContent=stopped?'▷':'Ⅱ';}
pauseUI();pause.addEventListener('click',()=>{stopped=!stopped;pauseUI();});
reduced.addEventListener('change',()=>{stopped=reduced.matches;pauseUI();});
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');mobileMenu.hidden=!open;});
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileMenu.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){mobileMenu.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню');}});
const nav=[...document.querySelectorAll('.route-index a')], captions=['Прибытие груза','Таможенное оформление','Хранение и обработка','Маркировка «Честный знак»','Оклейка алкоголя ФСМ','Выдача груза'];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
function onScroll(){const y=window.scrollY;const h=chapters[0].offsetHeight;const raw=clamp((y-journey.offsetTop)/h,0,chapters.length-1);const whole=Math.floor(raw);target=whole+smooth((raw-whole-.22)/.6);isVisible=y<journey.offsetHeight-90;document.querySelector('#header').classList.toggle('on-paper',y>journey.offsetHeight-100&&y<document.querySelector('#contacts').offsetTop-80);document.querySelector('.journey-controls').style.visibility=isVisible?'visible':'hidden';body.classList.toggle('hero-in-view',isVisible&&raw<.8);}
window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',()=>{sceneDirty=true;onScroll();});onScroll();rendered=target;
function tick(now){requestAnimationFrame(tick);if(document.hidden)return;const dt=Math.min((now-lastTime)/1000,.05)||.016;lastTime=now;
rendered=stopped?Math.round(target):rendered+(target-rendered)*(1-Math.exp(-dt*9));if(!stopped&&isVisible)time+=dt;
const current=Math.round(rendered);if(current!==active){active=current;nav.forEach((a,i)=>{a.classList.toggle('active',i===active);if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});document.querySelector('.scene-label').textContent=captions[active];}
copies.forEach((c,i)=>{const d=rendered-i;const a=isVisible?1-smooth((Math.abs(d)-.10)/.58):0;c.style.opacity=a;c.style.visibility=a>.005?'visible':'hidden';c.style.transform=stopped?'none':`translateY(${-d*65}px)`;c.inert=a<.45;c.setAttribute('aria-hidden',String(a<.45));});
if(scene)scene.setMode(rendered<3.5?'code':'fsm');
if(scene&&isVisible&&(!stopped||sceneDirty||lastDraw!==rendered)){scene.render(rendered,time,stopped);lastDraw=rendered;sceneDirty=false;}
}
requestAnimationFrame(tick);
const filters=[...document.querySelectorAll('[data-filter]')], rows=[...document.querySelectorAll('.tariff-row')];
filters.forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.filter;filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;rows.forEach(row=>{row.hidden=category!=='all'&&row.dataset.category!==category;if(!row.hidden){row.style.setProperty('--row-order',count++);if(!stopped&&!reduced.matches)row.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,delay:(count-1)*35,fill:'both'});}});document.querySelector('#price-count').textContent=count===1?'1 услуга':count<5?count+' услуги':count+' услуг';}));
import('./world.js').then(m=>{scene=m.createWorld(document.querySelector('#world'));scene.setMode(rendered<3.5?'code':'fsm');sceneDirty=true;body.classList.add('webgl-ready');}).catch(e=>{body.classList.add('webgl-fallback');console.warn('3D unavailable. Text, navigation and schematic fallback remain available.',e.message);});
})();
