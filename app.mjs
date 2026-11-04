import {initial,step,thermal} from './control.mjs';
const el=id=>document.getElementById(id), $=s=>document.querySelector(s);
const sections=[...document.querySelectorAll('.chapter')], stages=[...document.querySelectorAll('[data-stage]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const labels=['01 · El sensor toma una muestra.','02 · El módulo interpreta los datos.','03 · La placa baja al gabinete.','04 · La tapa encaja; el lazo queda cerrado.'];
let current=0, queued=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(v,b));
const poses=[[-78,-113,-140,0], [0,-50,-126,0], [0,0,-93,18], [0,0,0,28]];
function scroll(){
  queued=false; const vh=innerHeight, y=scrollY, total=document.documentElement.scrollHeight-vh;
  $('.progress').style.transform='scaleX('+clamp(y/(total||1),0,1)+')';
  current=sections.reduce((n,s,i)=>s.getBoundingClientRect().top<vh*.43?i:n,0);
  el('chapter-index').textContent=String(current+1).padStart(2,'0')+' / '+String(sections.length).padStart(2,'0');
  el('prev').disabled=current===0; el('next').disabled=current===sections.length-1;
  document.querySelectorAll('nav a').forEach(a=>a.hash==='#'+sections[current].id?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
  const centers=stages.map(s=>{const r=s.getBoundingClientRect();return r.top+r.height*.35;});
  const pivot=vh*.58;
  let q=0;
  for(let i=0;i<centers.length-1;i++) if(pivot>=centers[i]) q=i+clamp((pivot-centers[i])/(centers[i+1]-centers[i]),0,1);
  q=clamp(q,0,3); if(reduced.matches)q=Math.round(q);
  const from=Math.floor(q), to=Math.min(3,from+1), f=q-from;
  const [sy,cy,ly,by]=poses[from].map((v,i)=>v+(poses[to][i]-v)*f);
  el('sensor').setAttribute('transform','translate(0 '+(sy+by)+')');
  el('chip').setAttribute('transform','translate(0 '+(cy+by)+')');
  el('base').setAttribute('transform','translate(0 '+by+')');
  el('lid').setAttribute('transform','translate(0 '+(ly+by)+')');
  el('assembly-label').textContent=labels[Math.round(q)];
}
function queue(){if(!queued){queued=true;requestAnimationFrame(scroll);}}
addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);reduced.addEventListener('change',queue);
function move(d){sections[clamp(current+d,0,sections.length-1)].scrollIntoView();}
el('prev').onclick=()=>move(-1);el('next').onclick=()=>move(1);
el('mode').onclick=()=>{const on=document.body.classList.toggle('presenting');el('mode').setAttribute('aria-pressed',on);el('mode').textContent=on?'Salir de exposición':'Modo exposición';$('.present-controls').hidden=!on;queue();};
addEventListener('keydown',e=>{if(!document.body.classList.contains('presenting')||e.target.closest('input,button,select,textarea,summary,a'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}if(e.key==='Escape')el('mode').click();});
let s,t,sec,bad,network,received,history,events,timer;
const fmt=t=>t===null?'—':t.toFixed(1).replace('.',',')+' °C';
function log(text){events.unshift('t='+sec+' s · '+text);events=events.slice(0,6);}
function tick(sim=false){
  sec++;
  t=sim?thermal(t,s.fan):Number(el('temp').value);
  const value=bad?null:t, previous=s;
  s=step(s,value);
  if(s.fault&&!previous.fault)log('Lectura inválida: extractor forzado a encendido.');
  if(!s.fault&&previous.fault)log('Tres muestras válidas: se restablece el control.');
  if(s.fan!==previous.fan)log('Orden: extractor '+(s.fan?'encendido.':'apagado.'));
  if(network)received={sec,value};
  history.push({sec,value});history=history.slice(-100);
  render();
}
const svgNS='http://www.w3.org/2000/svg';
function plot(){
  const lo=Math.max(0,sec-99),hi=Math.max(20,sec), x=v=>49+626*(v-lo)/(hi-lo), y=v=>190-(v-20)*170/35;
  const grid=el('grid');grid.replaceChildren();
  function append(parent,tag,attrs,content){const n=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);if(content!==undefined)n.textContent=content;parent.append(n);}
  for(const v of [20,25,34,38,45,55]){const strong=v===34||v===38;append(grid,'line',{x1:49,x2:675,y1:y(v),y2:y(v),stroke:strong?(v===38?'#ff846a':'#a7e7d0'):'#39394e','stroke-dasharray':strong?'5 5':'2 8'});append(grid,'text',{x:9,y:y(v)+4},v+'°');}
  for(let i=0;i<5;i++){const v=Math.round(lo+(hi-lo)*i/4);append(grid,'text',{x:x(v),y:211,'text-anchor':'middle'},v);}
  let d='', pen=false; const points=el('points');points.replaceChildren();
  for(const p of history){if(p.value===null){pen=false;append(points,'line',{x1:x(p.sec),x2:x(p.sec),y1:184,y2:197,stroke:'#ff846a','stroke-width':2});continue;}d+=(pen?'L':'M')+x(p.sec)+' '+y(p.value)+' ';pen=true;}
  const last=history.at(-1);if(last?.value!=null)append(points,'circle',{cx:x(last.sec),cy:y(last.value),r:4,fill:'#ff906f'});
  el('trace').setAttribute('d',d);
}
function render(){
  el('slider-value').textContent=fmt(Number(el('temp').value));
  el('local').textContent=history.at(-1).value===null?'INVÁLIDA':fmt(history.at(-1).value);
  el('fan').textContent=s.fan?'ENCENDIDO':'APAGADO';
  el('remote').textContent=network?(received?.sec===sec?'En línea · '+fmt(received.value):'Esperando muestra'):received?'Sin red · '+(received.value===null?'última inválida':fmt(received.value))+' · hace '+(sec-received.sec)+' s':'Sin red';
  const message=s.fault?'FALLO · Extracción forzada. Recuperación: '+s.streak+'/3 muestras válidas consecutivas.':'CONTROL LOCAL · '+(s.fan?'Extracción activa.':'Extracción en espera.')+(network?'':' La web está desconectada; el controlador sigue activo.');
  if(el('state').textContent!==message)el('state').textContent=message;
  el('bad').setAttribute('aria-pressed',bad);el('bad').textContent=bad?'Restaurar sensor':'Fallo de sensor';
  el('net').setAttribute('aria-pressed',!network);el('net').textContent=network?'Cortar red':'Restaurar red';
  el('auto').setAttribute('aria-pressed',Boolean(timer));el('auto').textContent=timer?'Pausar simulación':'Simular calor';
  el('sample').disabled=Boolean(timer);el('temp').disabled=Boolean(timer);
  el('events').replaceChildren(...events.map(e=>{const n=document.createElement('li');n.textContent=e;return n;}));
  plot();
}
function reset(){clearInterval(timer);timer=null;s=initial();t=36;sec=0;bad=false;network=true;received={sec:0,value:t};history=[{sec,value:t}];events=[];el('temp').value=36;log('Arranque: extractor encendido por defecto.');render();}
el('temp').oninput=()=>{el('slider-value').textContent=fmt(Number(el('temp').value));};
el('sample').onclick=()=>tick();
el('auto').onclick=()=>{if(timer){clearInterval(timer);timer=null;el('temp').value=t;}else{t=Number(el('temp').value);timer=setInterval(()=>tick(true),140);}render();};
el('bad').onclick=()=>{bad=!bad;if(bad)tick(Boolean(timer));else{log('Sensor restaurado; se esperan conversiones válidas.');render();}};
el('net').onclick=()=>{network=!network;if(network)received=null;log(network?'Enlace recuperado; se espera la próxima muestra.':'Enlace perdido; el control local continúa.');render();};
el('reset').onclick=reset;
reset();queue();
