import {initial,step} from './control.mjs';
export const demos={
 limits:[[34,'34 °C: alcanza el umbral inferior. El extractor se apaga.'],[36,'36 °C: dentro de la banda; conserva APAGADO.'],[38,'38 °C: alcanza el umbral superior. El extractor se enciende.'],[36,'36 °C: el mismo valor, pero ahora conserva ENCENDIDO.'],[34,'Al volver a 34 °C se apaga. La temperatura no es la única entrada: importa la orden anterior.']],
 fault:[[34,'Estado previo: extractor apagado.'],[null,'El sensor deja de responder. La orden segura se activa en esta primera muestra inválida.'],[33,'Muestra válida 1/3. El extractor sigue encendido.'],[null,'Una lectura inválida reinicia el conteo.'],[33,'Muestra válida 1/3.'],[33,'Muestra válida 2/3.'],[33,'Tercera muestra válida: vuelve el control normal. A 33 °C se apaga.']],
 network:[[34,'El monitor recibe 34 °C. Se ordena apagar el extractor.',true],[36,'Se interrumpe la red. La web conserva la última lectura recibida.',false],[38,'Sin red, el controlador alcanza 38 °C y ordena encender.',false],[37,'El extractor sigue encendido dentro de la banda.',false],[36,'El controlador sigue tomando muestras; la web no recibe cambios.',false],[35,'Cinco segundos sin recibir datos: la web marca la última lectura como obsoleta.',false],[34,'La red vuelve y llega una muestra nueva. El controlador apaga a 34 °C.',true]]
};
export function simulate(script){
 let s=initial(), rx=null;
 return script.map(([t,note,online=true],sec)=>{
  s=step(s,t);
  if(online)rx={t,sec};
  return {t,note,sec,online,rx,age:rx?sec-rx.sec:null,...s};
 });
}
if(typeof document!=='undefined') mount();
function mount(){
const id=k=>document.getElementById(k), viewport=id('viewport');
const scenes=[...document.querySelectorAll('.scene')], prev=id('prev'), next=id('next');
let index=-1,timers=[],generation=0;
const later=(cb,ms)=>{const g=generation;timers.push(setTimeout(()=>{if(g===generation)cb();},ms));};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function fit(){
 const p=matchMedia('(orientation: portrait)').matches;
 const scale=Math.min(viewport.clientWidth/(p?760:1440),viewport.clientHeight/(p?1100:810));
 document.documentElement.style.setProperty('--u',String(scale));
}
function go(nextIndex){
 const i=clamp(nextIndex,0,scenes.length-1);
 if(i===index)return;
 const backward=i<index;
 generation++;timers.forEach(clearTimeout);timers=[];
 if(index>=0)scenes[index].hidden=true;
 index=i;
 const scene=scenes[i];scene.classList.toggle('back',backward);scene.hidden=false;
 prev.disabled=i===0;next.disabled=i===scenes.length-1;
 id('scene-title').textContent=scene.dataset.title;
 id('counter').textContent=String(i+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0');
 id('progress').style.transform='scaleX('+((i+1)/scenes.length)+')';
 if(scene.dataset.stage!==undefined)assembly(scene,+scene.dataset.stage);
 if(scene.dataset.demo)demo(scene,scene.dataset.demo);
}
const pos=[[-67,-104,-75,0],[0,-76,-75,0],[0,0,-75,0],[0,0,0,28]];
function assembly(scene,n){
 const sv=scene.querySelector('.assembly svg');
 const names=['sensor','chip','lid','base'];
 const parts=names.map(name=>sv.querySelector('[data-part='+name+']'));
 function pose(p){parts.forEach((el,j)=>{el.style.transform='translateY('+(p[j]+(j<3?p[3]:0))+'px)';});}
 parts.forEach(el=>el.style.transition='none');pose(n===0?[-108,-104,-75,0]:pos[n-1]);sv.getBoundingClientRect();
 if(reduced.matches){pose(pos[n]);return;}
 later(()=>{parts.forEach(el=>el.style.transition='');pose(pos[n]);},520);
}
const fmt=v=>v===null?'INVÁLIDA':String(v).replace('.',',')+' °C';
function demo(scene,name){
 const data=simulate(demos[name]), screen=scene.querySelector('.screen');
 const svg=scene.querySelector('.plot'), grid=svg.querySelector('.grid'), pts=svg.querySelector('.points'), trace=svg.querySelector('.trace');
 const read=k=>scene.querySelector('[data-read='+k+']');
 const x=i=>52+(625/(data.length-1))*i, y=t=>135-(t-31)*10;
 function add(parent,tag,attrs,value){
   const node=document.createElementNS('http://www.w3.org/2000/svg',tag);
   for(const [key,v] of Object.entries(attrs))node.setAttribute(key,v);
   if(value!==undefined)node.textContent=value;
   parent.append(node);return node;
 }
 grid.replaceChildren();pts.replaceChildren();trace.setAttribute('d','');
 [32,34,36,38,40].forEach(t=>{
   add(grid,'line',{x1:50,x2:677,y1:y(t),y2:y(t),stroke:t===38?'#ff9a7c88':t===34?'#a0f2cf88':'#ffffff23','stroke-dasharray':'4 5'});
   add(grid,'text',{x:11,y:y(t)+4},t+'°');
 });
 data.forEach((r,i)=>add(grid,'text',{x:x(i),y:162,'text-anchor':'middle'},r.sec+' s'));
 function render(i){
   const d=data[i];screen.dataset.fan=d.fan;screen.dataset.fault=d.fault;
   read('local').textContent=fmt(d.t);
   read('fan').textContent=d.fan?(d.fault?'ENCENDIDO · SEGURO':'ENCENDIDO'):'APAGADO';
   read('remote').textContent=d.online?fmt(d.t):d.age>=5?'OBSOLETA · '+fmt(d.rx.t):'Última · '+fmt(d.rx.t);
   read('time').textContent='t = '+d.sec+' s';read('note').textContent=d.note;
   let path='',pen=false;pts.replaceChildren();
   for(let j=0;j<=i;j++){
     const t=data[j].t, xx=x(j);
     if(t===null){pen=false;add(pts,'path',{d:'M '+(xx-4)+' 130 l 8 8 m -8 0 l 8 -8',stroke:'#ff9a7c','stroke-width':2});continue;}
     path+=(pen?' L ':' M ')+xx+' '+y(t);pen=true;
     add(pts,'circle',{cx:xx,cy:y(t),r:j===i?5:3,fill:j===i?'#fff0cf':'#ff9a7c'});
   }
   trace.setAttribute('d',path);
 }
 render(0);
 data.slice(1).forEach((_,i)=>later(()=>render(i+1),1400*(i+1)+420));
}
prev.addEventListener('click',()=>go(index-1));
next.addEventListener('click',()=>go(index+1));
addEventListener('keydown',event=>{
 if(event.altKey||event.ctrlKey||event.metaKey||!['ArrowLeft','ArrowRight'].includes(event.key))return;
 event.preventDefault();
 if(!event.repeat)go(index+(event.key==='ArrowRight'?1:-1));
});
addEventListener('resize',fit);
fit();go(0);
}
