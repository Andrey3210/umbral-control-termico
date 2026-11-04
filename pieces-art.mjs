const p=(x,y)=>[x,y];
const tri=(a,b,c,k)=>({v:[a,b,c],k});
const q=(a,b,c,d,k)=>[tri(a,b,c,k),tri(a,c,d,k+1)];
const rect=(x,y,w,h,k)=>q(p(x,y),p(x+w,y),p(x+w,y+h),p(x,y+h),k);
const shift=(m,x,y)=>m.map(({v,k})=>({v:v.map(([a,b])=>[a+x,b+y]),k}));
const box=(x,y,w,d,h,k=0)=>{
 const a=p(x,y),b=p(x+w,y+d*.42),c=p(x+w+d,y),d0=p(x+d,y-d*.42);
 const a1=p(a[0],a[1]+h),b1=p(b[0],b[1]+h),c1=p(c[0],c[1]+h);
 return [...q(a,d0,c,b,k),...q(a,b,b1,a1,k+2),...q(b,c,c1,b1,k+4)];
};
const fan=(x,y,r,k=0)=>{
 const at=(deg,f)=>p(x+Math.cos(deg*Math.PI/180)*r*f,y+Math.sin(deg*Math.PI/180)*r*f);
 const out=[];
 for(let i=0;i<8;i++){
  const a=i*45;
  out.push(...q(at(a,1),at(a+45,1),at(a+45,.82),at(a,.82),k+i%2));
  if(i%2===0)out.push(...q(at(a,.15),at(a-18,.7),at(a+28,.72),at(a+45,.32),k+3+i%3));
 }
 for(let i=0;i<4;i++)out.push(tri(p(x,y),at(i*90,.19),at((i+1)*90,.19),k+5));
 return out;
};
const flame=(x,y,s)=>[
 tri(p(-27,18),p(-36,-6),p(-12,-27),4),tri(p(-27,18),p(-12,-27),p(0,22),1),
 tri(p(-12,-27),p(6,-45),p(5,-11),0),tri(p(-12,-27),p(5,-11),p(0,22),2),
 tri(p(5,-11),p(20,-27),p(26,5),3),tri(p(5,-11),p(26,5),p(0,22),4),
 tri(p(26,5),p(17,23),p(0,22),5),tri(p(-10,18),p(1,-2),p(7,20),0),
].map(({v,k})=>({v:v.map(([a,b])=>[a*s+x,b*s+y]),k}));
const chip=(x,y,s=1)=>{
 const b=box(29,45,33,14,10,0);
 for(let i=0;i<5;i++){const t=33+i*6;b.push(...q(p(t,48+i*2.4),p(t+3,49+i*2.4),p(t+3,66+i*2.4),p(t,65+i*2.4),4));}
 for(let i=0;i<4;i++){const t=63+i*3;b.push(tri(p(t,60-i*1.4),p(t+8,56-i*1.4),p(t+7,62-i*1.4),5));}
 b.push(...q(p(37,45),p(45,40),p(61,46),p(52,51),2));
 return b.map(({v,k})=>({v:v.map(([a,b])=>[(a-52)*s+x,(b-53)*s+y]),k}));
};
const board=()=>[...box(19,52,44,19,5,2),
 ...q(p(27,51),p(39,46),p(68,57),p(62,61),0),
 ...q(p(37,55),p(41,53),p(61,61),p(56,64),1),
 ...q(p(46,59),p(51,57),p(67,64),p(63,66),4),
 ...box(60,57,10,5,4,0)];
const cubicle=()=>[...box(22,27,37,22,45,0),
 ...q(p(27,34),p(53,45),p(53,77),p(27,67),4),
 ...q(p(32,41),p(48,48),p(48,57),p(32,50),1),
 ...q(p(32,55),p(48,62),p(48,69),p(32,62),2),
 ...q(p(62,46),p(76,40),p(76,65),p(62,71),4),
 ...q(p(64,49),p(74,45),p(74,48),p(64,52),1),
 ...q(p(64,56),p(74,52),p(74,55),p(64,59),2),
 ...q(p(64,63),p(74,59),p(74,62),p(64,66),3)];
const sensor=()=>[...box(32,43,23,12,12,0),...box(39,39,14,7,5,2),...rect(26,54,9,4,4),...rect(54,61,10,4,4),...rect(27,62,9,4,4),...rect(53,69,10,4,4)];
const arrow=(x,y,w,k,up=false)=>{
 const pts=[[0,6],[w-9,6],[w-9,0],[w,10],[w-9,20],[w-9,14],[0,14]].map(([a,b])=>p(x+(up?b:a),y+(up?-a:b)));
 return [...q(pts[0],pts[1],pts[5],pts[6],k),tri(pts[2],pts[3],pts[4],k+2)];
};
const monitor=(broken=false)=>[
 ...q(p(20,24),p(81,24),p(81,66),p(20,66),0),...rect(25,29,51,32,2),...rect(43,67,14,8,4),...rect(34,75,32,5,0),
 ...[0,1,2,3].flatMap((a)=>rect(31+a*10,49-a*3,5,9+a*3,4+a%2)),
 ...(broken?[tri(p(52,24),p(58,24),p(43,62),5),tri(p(54,24),p(50,49),p(43,62),1)]:[])
];
const shield=()=>[
 tri(p(50,19),p(73,29),p(50,48),1),tri(p(50,19),p(26,29),p(50,48),0),
 tri(p(26,29),p(30,60),p(50,48),2),tri(p(73,29),p(68,60),p(50,48),3),
 tri(p(30,60),p(50,81),p(50,48),4),tri(p(68,60),p(50,81),p(50,48),5),
 ...q(p(34,49),p(39,43),p(48,52),p(44,58),0),
 ...q(p(44,58),p(48,52),p(64,37),p(68,43),0)];
const range=()=>[
 ...rect(19,46,17,9,3),...rect(36,46,27,9,0),...rect(63,46,18,9,2),
 ...rect(35,38,2,24,4),...rect(63,38,2,24,4),
 tri(p(16,50),p(21,43),p(21,57),3),tri(p(84,50),p(79,43),p(79,57),2)
];
const warning=()=>[tri(p(71,24),p(87,57),p(55,57),0),
 tri(p(71,24),p(87,57),p(71,57),1),...rect(70,36,2,10,4),...rect(70,49,2,3,4)];
const clipboard=()=>[...rect(28,23,43,57,4),...rect(31,26,37,51,0),...rect(42,19,16,10,3),
 ...[0,1,2].flatMap(i=>{const y=36+i*11;return [
 ...rect(46,y+2,16,2,3),tri(p(35,y+3),p(38,y+1),p(40,y+6),3),tri(p(38,y+6),p(44,y),p(40,y+7),3)
 ];})];
const wires=()=>[...box(13,45,14,7,10,0),...box(42,46,11,6,10,1),...arrow(32,47,11,3),...arrow(62,47,12,4),...fan(81,54,10,2).slice(0,24)];
const place=(m,s,x,y)=>m.map(({v,k})=>({v:v.map(([a,b])=>[(a-50)*s+x,(b-50)*s+y]),k}));
const packed=()=>[...board(),...chip(47,51,.54),...box(22,27,37,22,8,0)];
export const mesh={
 cabinet:cubicle(), heat:[...cubicle(),...flame(47,32,.55)],
 sensor:[...sensor(),...arrow(63,40,17,3)],
 processor:chip(49,48,1.15),
 actuator:fan(50,50,33,0),
 layers:[...board(),...chip(47,37,.55),...box(22,25,37,22,5,0)],
 packed:packed(), rule:range(),
 fall:[...shift(sensor(),-12,2),...warning()],
 link:wires(), offline:monitor(true), verify:clipboard(), appendix:[...place(monitor(),.9,50,50),...arrow(67,25,16,3)],
};
export const palettes={
 peach:['#f7d5a0','#f3a465','#c85c42','#9b403e','#512e37','#e48b58','#aa4e41','#422c42'],
 green:['#ebedb4','#a8c978','#5d995e','#357b68','#245d58','#e6c477','#4f8060','#304f49'],
 rose:['#ffd6b5','#ef9d9b','#c95967','#9d3d62','#53395c','#f2b784','#ab5673','#4c3153'],
 sky:['#f7e7b6','#a7ced7','#67a4b4','#437f98','#2c536f','#e1b47a','#5b8ea3','#344867'],
};
export const themes=['peach','rose','green','sky','green','peach','rose','peach','rose','rose','sky','sky','green','peach'];
export const forms=['cabinet','heat','sensor','processor','actuator','layers','rule','rule','fall','fall','link','offline','verify','appendix'];
export const pieceCount=48;
if(Object.values(mesh).some(m=>m.length>pieceCount))throw Error('La malla excede el número de piezas');
export function polygons(name){
 const source=mesh[name];
 return Array.from({length:pieceCount},(_,i)=>source[i]??{v:[[50+(i%7-3)*2,48+(i%5)],[50+(i%7-3)*2,48+(i%5)],[50+(i%7-3)*2,48+(i%5)]],k:i%8});
}
export function exhibit(container){
 const annotations=makeAnnotations(container);
 const parts=Array.from({length:pieceCount},(_,i)=>{
  const e=document.createElement('span');e.className='shard';e.style.setProperty('--delay',String((i*37)%225)+'ms');return e;
 });
 container.append(...parts);
 return function morph(name,palette){
  annotations(name);
  const color=palettes[palette];polygons(name).forEach(({v,k},i)=>{
    const node=parts[i];
    node.style.clipPath='polygon('+v.map(([x,y])=>x.toFixed(2)+'% '+y.toFixed(2)+'%').join(',')+')';
    node.style.backgroundColor=color[k%color.length];
  });
 };
}


const annotationsByForm={
 cabinet:{caption:'Gabinete de pruebas',lines:[['Módulos en prueba',37,57,13,65],['Rejilla',67,56,88,68]]},
 heat:{caption:'Gabinete de pruebas',lines:[['Calor de los módulos',47,28,78,15],['Rejilla',68,58,88,70]]},
 sensor:{caption:'TMP117 · sensor digital',lines:[['Encapsulado',47,42,21,30],['Terminales',56,63,78,72]]},
 processor:{caption:'ESP32 · procesador',lines:[['Procesador',49,43,22,28],['Pines',56,62,79,78]]},
 actuator:{caption:'Extractor axial · 12 V',lines:[['Aspas',42,40,18,27],['Eje',50,50,84,54],['Aro',73,67,86,78]]},
 layers:{caption:'Montaje en capas',lines:[['Tapa',51,29,76,19],['Chip',48,39,20,37],['Placa',53,61,84,72]]},
 packed:{caption:'Chip instalado en la placa',lines:[['Tapa',58,28,83,21],['Chip',47,51,18,43],['Placa',54,63,85,70]]},
 rule:{caption:'Banda de histéresis',lines:[['34 °C',36,57,30,70],['38 °C',64,57,70,70],['Conserva la orden',50,46,50,30]]},
 fall:{caption:'Lectura inválida',lines:[['Sensor',36,49,16,31],['Alarma',73,49,86,68]]},
 link:{caption:'Lazo local: sensor, control y extracción',lines:[['Sensor',21,53,15,33],['ESP32',49,54,49,75],['Extractor',80,54,85,33]]},
 offline:{caption:'Monitor web sin datos nuevos',lines:[['Última lectura',41,43,15,15],['Enlace interrumpido',55,35,81,15]]},
 verify:{caption:'Lista de comprobación',lines:[['Casos de prueba',56,53,85,60]]},
 appendix:{caption:'Telemetría y modelo térmico',lines:[['Historial',49,49,20,15]]}
};
function makeAnnotations(container){
 const ns='http://www.w3.org/2000/svg', svg=document.createElementNS(ns,'svg');
 svg.setAttribute('viewBox','0 0 100 100');svg.setAttribute('class','diagram-labels');svg.setAttribute('aria-hidden','true');
 container.append(svg);
 let last;
 return name=>{
  if(last===name)return;
  last=name;
  const {caption,lines}=annotationsByForm[name];
  const layer=document.createElementNS(ns,'g');
  const draw=(tag,attrs,value)=>{
   const node=document.createElementNS(ns,tag);
   for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);
   if(value)node.textContent=value;
   layer.append(node);
  };
  for(const [label,x,y,tx,ty] of lines){
   const middle=tx===x?x:x+(tx-x)*.56;
   draw('path',{d:'M '+x+' '+y+' L '+middle+' '+ty+' H '+tx,class:'leader'});
   draw('circle',{cx:x,cy:y,r:.6,class:'leader-dot'});
   draw('text',{x:tx,y:ty-2.2,'text-anchor':tx<24?'start':tx>76?'end':'middle',class:'leader-text'},label);
  }
  draw('text',{x:50,y:92,'text-anchor':'middle',class:'figure-caption'},caption);
  svg.replaceChildren(layer);
 };
}
