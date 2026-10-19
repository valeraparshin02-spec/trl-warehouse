import * as T from './vendor/three.module.min.js';

export function createWorld(canvas){
const mobile=()=>innerWidth<=760;
const renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,mobile()?1.5:1.75));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=!mobile();renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color('#062d28');scene.fog=new T.FogExp2('#062d28',.022);
const camera=new T.PerspectiveCamera(39,innerWidth/innerHeight,.1,240);
scene.add(new T.HemisphereLight('#dfffee','#113b2e',1.8));const key=new T.DirectionalLight('#f5fff9',3.2);key.position.set(-8,18,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-22;key.shadow.camera.right=22;key.shadow.camera.top=22;key.shadow.camera.bottom=-22;key.shadow.camera.far=70;key.shadow.normalBias=.035;scene.add(key);const rim=new T.DirectionalLight('#56ffc5',3);rim.position.set(12,8,-12);scene.add(rim);const front=new T.DirectionalLight('#a1b5ff',.6);front.position.set(0,3,15);scene.add(front);
const materials={
white:new T.MeshStandardMaterial({color:'#d8e4df',roughness:.36,metalness:.36}),
steel:new T.MeshStandardMaterial({color:'#97aea3',roughness:.34,metalness:.65}),
green:new T.MeshStandardMaterial({color:'#23795d',roughness:.28,metalness:.42}),
dark:new T.MeshStandardMaterial({color:'#102c26',roughness:.6,metalness:.35}),
rubber:new T.MeshStandardMaterial({color:'#101a18',roughness:.94}),
glass:new T.MeshStandardMaterial({color:'#0b302e',roughness:.08,metalness:.75}),
light:new T.MeshBasicMaterial({color:'#a7ffce'}),
card:new T.MeshStandardMaterial({color:'#c4d3b9',roughness:.85}),
paper:new T.MeshStandardMaterial({color:'#fbfff5',roughness:.75}),
};
const unit=new T.BoxGeometry(1,1,1);
function box(g,w,h,d,x,y,z,mat=materials.white,edges=false){const m=new T.Mesh(unit,mat);m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);if(edges){const e=new T.LineSegments(new T.EdgesGeometry(unit),new T.LineBasicMaterial({color:'#9df0c5',transparent:true,opacity:.5}));m.add(e);}return m;}
function cyl(g,r,h,x,y,z,mat=materials.steel,segments=20){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,segments),mat);m.position.set(x,y,z);g.add(m);return m;}
function line(g,points,color='#6adca8',opacity=.6){const geo=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const m=new T.Line(geo,new T.LineBasicMaterial({color,transparent:true,opacity}));g.add(m);return m;}
function textTexture(text,color='#174d39',bg='#dce9e1',size=512){const c=document.createElement('canvas');c.width=size;c.height=size/2;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);x.fillStyle=color;x.font='bold 140px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,c.width/2,c.height/2);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;}
const logoMaterial=new T.MeshStandardMaterial({map:textTexture('ТРЛ'),roughness:.5,metalness:.15});
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const sx=shadowCanvas.getContext('2d'),grad=sx.createRadialGradient(64,64,3,64,64,64);grad.addColorStop(0,'rgba(0,15,9,.6)');grad.addColorStop(1,'rgba(0,15,9,0)');sx.fillStyle=grad;sx.fillRect(0,0,128,128);const shadowMat=new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false});
function shadow(g,w,d,x=0,z=0){const m=new T.Mesh(new T.PlaneGeometry(w,d),shadowMat);m.rotation.x=-Math.PI/2;m.position.set(x,.014,z);g.add(m);}
const ground=new T.Mesh(new T.PlaneGeometry(500,220),new T.MeshStandardMaterial({color:'#062c24',roughness:.8,metalness:.17}));ground.receiveShadow=true;ground.rotation.x=-Math.PI/2;ground.position.set(50,-.04,0);scene.add(ground);
const gridPoints=[];for(let x=-80;x<=240;x+=4){gridPoints.push(x,.005,-42,x,.005,30);}for(let z=-40;z<=32;z+=4){gridPoints.push(-80,.005,z,240,.005,z);}const gridGeo=new T.BufferGeometry();gridGeo.setAttribute('position',new T.Float32BufferAttribute(gridPoints,3));scene.add(new T.LineSegments(gridGeo,new T.LineBasicMaterial({color:'#79b59a',transparent:true,opacity:.09})));
// A continuous route ties the five physical scenes together.
for(const z of[-4.6,-4.3,4.3,4.6])line(scene,[[-100,.04,z],[235,.04,z]],z===-4.6||z===4.6?'#83efb5':'#237357',z===-4.6||z===4.6?.7:.5);
for(let x=-80;x<210;x+=3.5)box(scene,1.3,.012,.04,x,.02,0,new T.MeshBasicMaterial({color:'#b9e4cc',transparent:true,opacity:.15}));
const routePulses=[];for(let i=0;i<12;i++){const p=box(scene,3,.025,.05,-40+i*12,.05,i%2?4.5:-4.5,materials.light);routePulses.push(p);}
const wheelGeo=new T.CylinderGeometry(.64,.64,.42,28),rimGeo=new T.CylinderGeometry(.36,.36,.45,20),hubGeo=new T.CylinderGeometry(.14,.14,.47,12);
function wheel(g,x,z){const group=new T.Group();group.position.set(x,.68,z);const tire=new T.Mesh(wheelGeo,materials.rubber);tire.rotation.x=Math.PI/2;group.add(tire);const r=new T.Mesh(rimGeo,materials.steel);r.rotation.x=Math.PI/2;group.add(r);const h=new T.Mesh(hubGeo,materials.dark);h.rotation.x=Math.PI/2;group.add(h);for(let k=0;k<8;k++){const a=k*Math.PI/4;const bolt=new T.Mesh(new T.SphereGeometry(.035,5,4),materials.white);bolt.position.set(Math.sin(a)*.23,Math.cos(a)*.23,z<0?-.24:.24);group.add(bolt);}g.add(group);return group;}
function truck(){const g=new T.Group();const wheels=[];shadow(g,18,6);
box(g,13,.3,2.2,0,1,0,materials.dark);box(g,9.6,3.35,2.7,1.65,2.95,0,materials.white,true);box(g,9.7,.12,2.8,1.65,4.67,0,materials.steel);box(g,9.7,.12,2.8,1.65,1.23,0,materials.steel);
for(let x=-3;x<6.4;x+=.32){box(g,.035,3.22,.04,x,2.96,1.375,materials.steel);box(g,.035,3.22,.04,x,2.96,-1.375,materials.steel);}
for(let side of[-1,1]){const logo=new T.Mesh(new T.PlaneGeometry(3.6,1.8),logoMaterial);logo.position.set(1.6,3.05,side*1.401);if(side<0)logo.rotation.y=Math.PI;g.add(logo);box(g,9.3,.035,.03,1.6,1.5,side*1.42,materials.light);for(let x=-2.4;x<6;x+=1.5)box(g,.1,.08,.04,x,1.38,side*1.42,materials.light);}
box(g,.07,3.15,2.6,6.51,2.9,0,materials.steel);for(let z of[-.61,.61]){box(g,.07,2.95,.04,6.57,2.96,z,materials.dark);for(let y of[1.7,3,4.1])box(g,.12,.07,.18,6.61,y,z,materials.white);}
const shape=new T.Shape();shape.moveTo(-6.8,1.1);shape.lineTo(-6.8,2.65);shape.lineTo(-6.15,4.25);shape.quadraticCurveTo(-6.1,4.45,-5.85,4.45);shape.lineTo(-3.65,4.45);shape.lineTo(-3.4,4.1);shape.lineTo(-3.4,1.1);shape.closePath();const cab=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:2.45,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.06,bevelThickness:.06}),materials.green);cab.position.z=-1.225;g.add(cab);
for(const s of[-1,1]){const windowShape=new T.Shape();windowShape.moveTo(-6.42,2.85);windowShape.lineTo(-5.94,4);windowShape.lineTo(-3.83,4);windowShape.lineTo(-3.83,2.85);windowShape.closePath();const win=new T.Mesh(new T.ShapeGeometry(windowShape),new T.MeshStandardMaterial({color:'#0b282b',roughness:.1,metalness:.85,side:T.DoubleSide}));win.position.z=s*1.292;g.add(win);line(g,[[-3.75,1.35,s*1.3],[-3.75,4.08,s*1.3],[-5.9,4.08,s*1.3]],'#9cbfaf',.4);box(g,.35,.08,.06,-4,2.6,s*1.34,materials.steel);box(g,.75,.1,.4,-5.2,1.08,s*1.4,materials.steel);box(g,.16,.72,.13,-6.13,3,s*1.58,materials.dark);box(g,.32,.62,.16,-6.12,3.27,s*1.66,materials.steel);}
const wind=box(g,.12,1.38,2.2,-6.46,3.37,0,materials.glass);wind.rotation.z=-.36;
box(g,.13,.75,2.1,-6.88,1.91,0,materials.dark);for(let y=1.63;y<2.2;y+=.13)box(g,.15,.025,2,-6.96,y,0,materials.steel);box(g,.18,.22,2.48,-6.9,1.2,0,materials.steel);for(let z of[-.94,.94]){box(g,.16,.22,.42,-6.97,1.49,z,materials.light);box(g,.08,.06,.3,-6.98,1.73,z,materials.light);}
for(let x of[-5.5,-2.7,3.6,4.9])for(let z of[-1.36,1.36])wheels.push(wheel(g,x,z));
box(g,1.7,.6,1.6,-1.3,.65,0,materials.steel);g.userData.wheels=wheels;return g;}
const entry=truck();entry.position.set(0,0,0);scene.add(entry);
// Customs bay: an open gantry and a restrained document panel.
const customs=new T.Group();customs.position.x=35;scene.add(customs);const customsTruck=truck();customsTruck.position.x=-1;customs.add(customsTruck);
for(const z of[-3.25,3.25])box(customs,.28,6.5,.28,2,3.25,z,materials.steel,true);box(customs,.38,.32,6.8,2,6.5,0,materials.steel,true);box(customs,.05,.03,6,1.77,6.3,0,materials.light);
const scanPlane=new T.Mesh(new T.PlaneGeometry(6.2,5.6),new T.MeshBasicMaterial({color:'#68ffc1',transparent:true,opacity:.055,side:T.DoubleSide,depthWrite:false}));scanPlane.rotation.y=Math.PI/2;scanPlane.position.set(2,3.3,0);customs.add(scanPlane);
const docs=new T.Group();docs.position.set(-4,1.2,4.3);docs.rotation.set(-.13,-.3,0);customs.add(docs);box(docs,1.7,2.4,.1,0,1.2,0,materials.paper,true);for(let n=0;n<7;n++)box(docs,n===0?1.1:.8,.035,.02,-.1,2.05-n*.19,.07,n===0?materials.green:materials.steel);const seal=new T.Mesh(new T.TorusGeometry(.22,.016,6,30),materials.green);seal.position.set(.4,.55,.08);docs.add(seal);
// Warehouse: an open architectural section with shelves, pallets and handling equipment.
const warehouse=new T.Group();warehouse.position.x=70;scene.add(warehouse);shadow(warehouse,25,19);box(warehouse,19,.15,15,0,.03,0,materials.dark);
for(let x of[-9,0,9])for(let z of[-7,0,7]){box(warehouse,.13,8,.13,x,4,z,materials.steel,true);box(warehouse,.13,.15,14,x,8,0,materials.steel);}
for(let z of[-7,0,7])box(warehouse,18,.15,.13,0,8,z,materials.steel);
for(let z of[-7,7])line(warehouse,[[-9,0,z],[-9,8,z],[9,8,z],[9,0,z]],'#bfe6cf',.5);
for(let x of[-9,9]){line(warehouse,[[x,0,-7],[x,8,0],[x,0,7]],'#a3c9b3',.22);}
function pallet(g,x,y,z,scale=1){const p=new T.Group();p.position.set(x,y,z);p.scale.setScalar(scale);g.add(p);for(let z1 of[-.48,0,.48])box(p,1.7,.09,.17,0,.07,z1,materials.steel);for(let x1 of[-.65,0,.65])box(p,.13,.12,1.2,x1,.16,0,materials.card);for(let z1 of[-.48,-.24,0,.24,.48])box(p,1.7,.06,.17,0,.26,z1,materials.card);return p;}
function carton(g,x,y,z,w=1.35,h=1.15,d=1,mat=materials.card){const b=box(g,w,h,d,x,y+h/2,z,mat,true);box(g,.12,.01,d+.01,x,y+h+.012,z,materials.paper);return b;}
for(const z of[-4,0])for(const x of[-5.8,-2.6,.6,3.8]){for(let sx of[-1.45,1.45])box(warehouse,.09,6.5,.09,x+sx,3.25,z-.7,materials.steel);for(let sx of[-1.45,1.45])box(warehouse,.09,6.5,.09,x+sx,3.25,z+.7,materials.steel);for(let y of[.45,2.65,4.85]){box(warehouse,2.95,.13,1.6,x,y,z,materials.green);for(let side of[-.7,.7]){pallet(warehouse,x+side,y+.08,z,.7);carton(warehouse,x+side,y+.31,z,.95,1.3,1.05,(Math.round(x+y)%3===0)?materials.white:materials.card);}}}
const forklift=new T.Group();forklift.position.set(-3,0,4.3);warehouse.add(forklift);box(forklift,2.2,1,1.4,0,.8,0,materials.green,true);box(forklift,.7,1.2,1.4,-1,.9,0,materials.steel);for(let z of[-.65,.65]){box(forklift,.08,2.8,.08,.6,2.1,z,materials.steel);box(forklift,.08,1.8,.08,-.8,2.6,z,materials.steel);box(forklift,1.6,.08,.08,-.1,3.5,z,materials.steel);box(forklift,1.8,.08,.13,1.5,.45,z*.7,materials.steel);}box(forklift,1.7,.1,1.5,-.15,3.55,0,materials.dark);for(let x of[-.8,.7])for(let z of[-.75,.75]){const w=wheel(forklift,x,z);w.scale.setScalar(.58);w.position.y=.4;}const load=pallet(forklift,1.8,.43,0,.85);carton(forklift,1.8,.7,0,1.25,1.4,1.1,materials.white);
for(let x of[-7,7])line(warehouse,[[x,.14,-6],[x,.14,6]],'#c4ffd1',.6);
// Marking: separate product and label, industrial rollers and a scanning light.
const marking=new T.Group();marking.position.x=105;scene.add(marking);shadow(marking,18,9);const rollers=[];
for(let z of[-1.3,1.3]){box(marking,12,.3,.18,0,1.12,z,materials.steel,true);for(let x of[-4.7,4.7])box(marking,.15,1.2,.15,x,.55,z,materials.steel);}
for(let x=-5.8;x<=5.8;x+=.28){const r=cyl(marking,.105,2.45,x,1.25,0,materials.steel,12);r.rotation.x=Math.PI/2;rollers.push(r);}
const arch=new T.Group();marking.add(arch);for(let z of[-1.8,1.8])box(arch,.25,4.9,.25,-1.8,2.45,z,materials.steel,true);box(arch,.4,.26,3.85,-1.8,4.9,0,materials.steel,true);box(arch,.07,.04,3.3,-1.8,4.72,0,materials.light);box(arch,1.1,.85,.65,-1.8,4.25,0,materials.green,true);const applicator=box(arch,.52,.25,.5,-1.8,3.65,0,materials.dark);
const codeGroup=new T.Group();marking.add(codeGroup);const heroCarton=carton(codeGroup,.5,1.38,0,2.7,2.65,2.25,materials.white);box(codeGroup,2.72,.09,.04,.5,1.75,1.15,materials.green);
const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=384;const lc=labelCanvas.getContext('2d');lc.fillStyle='#f5f9eb';lc.fillRect(0,0,512,384);lc.fillStyle='#194c35';const cell=12;for(let row=0;row<16;row++)for(let col=0;col<16;col++){if(col===0||row===15||(row===0&&col%2===0)||(col===15&&row%2===0)||((row*7+col*13+row*col)%11<5)){lc.fillRect(32+col*cell,90+row*cell,cell,cell);}}
lc.font='bold 34px Arial';lc.fillText('ТРЛ',272,125);lc.font='17px Arial';lc.fillText('МАРКИРОВКА',272,160);for(let i=0;i<7;i++)lc.fillRect(274,192+i*12,110-(i%3)*23,3);lc.font='15px Arial';lc.fillText('УСЛОВНАЯ ЭТИКЕТКА',32,341);const codeTexture=new T.CanvasTexture(labelCanvas);codeTexture.colorSpace=T.SRGBColorSpace;const labelMat=new T.MeshStandardMaterial({map:codeTexture,roughness:.6,side:T.DoubleSide});const label=new T.Mesh(new T.PlaneGeometry(1.75,1.3),labelMat);label.position.set(.5,2.75,1.15);codeGroup.add(label);
const bottleGroup=new T.Group();bottleGroup.visible=false;marking.add(bottleGroup);const profile=[[0,0],[.45,0],[.55,.12],[.56,.3],[.56,2],[.53,2.2],[.22,2.55],[.18,2.65],[.18,3.15],[.21,3.17],[.21,3.27],[0,3.27]].map(([r,y])=>new T.Vector2(r,y));const bottle=new T.Mesh(new T.LatheGeometry(profile,40),new T.MeshStandardMaterial({color:'#275b3b',roughness:.13,metalness:.5}));bottle.position.set(.5,1.38,0);bottleGroup.add(bottle);const bottleLabel=new T.Mesh(new T.CylinderGeometry(.566,.566,1.25,40,1,true),new T.MeshStandardMaterial({color:'#e4e8d5',roughness:.8,side:T.DoubleSide}));bottleLabel.position.set(.5,2.6,0);bottleGroup.add(bottleLabel);const stamp=box(bottleGroup,.18,.9,.025,.5,4.05,.2,materials.paper);const cap=cyl(bottleGroup,.215,.28,.5,4.63,0,materials.steel,24);const sealText=new T.Mesh(new T.PlaneGeometry(.7,.35),new T.MeshStandardMaterial({map:textTexture('ФСМ','#1c5438','#dce8c4'),roughness:.8}));sealText.position.set(.5,2.67,.57);bottleGroup.add(sealText);
const scan=new T.Mesh(new T.PlaneGeometry(3.3,.025),new T.MeshBasicMaterial({color:'#82ffd1',transparent:true,opacity:.8,side:T.DoubleSide}));scan.position.set(.5,2.6,1.3);marking.add(scan);const scanGlow=new T.Mesh(new T.PlaneGeometry(3.3,.25),new T.MeshBasicMaterial({color:'#55ffac',transparent:true,opacity:.06,side:T.DoubleSide,depthWrite:false}));scan.add(scanGlow);
for(let x of[-4.6,4.4]){const prod=new T.Group();prod.position.set(x,1.38,0);marking.add(prod);carton(prod,0,0,0,1.5,1.55,1.5,materials.card);}
line(marking,[[.5,4.3,1.2],[2,5.2,1.2],[4.2,5.2,1.2]],'#93e3b4',.35);
const exitTruck=truck();exitTruck.position.x=140;scene.add(exitTruck);
// Sparse warehouse outlines at the horizon create depth without invented buildings.
for(let i=0;i<7;i++){const b=new T.Group();b.position.set(i*32-20,0,-35);scene.add(b);const w=18,h=7,d=12;line(b,[[-w/2,0,d/2],[-w/2,h,d/2],[w/2,h,d/2],[w/2,0,d/2]],'#7ba78c',.12);line(b,[[-w/2,h,d/2],[-w/2,h,-d/2],[w/2,h,-d/2],[w/2,h,d/2]],'#7ba78c',.12);}
const focus=new T.Vector3(),p=new T.Vector3();let lastStage=-1,mode='code';
const views=[{pos:[12,8,19],aim:[2.5,2,0]}, {pos:[47,7,16],aim:[37.5,2.8,0]}, {pos:[84,12,20],aim:[72,3.5,0]}, {pos:[114,6.5,13.5],aim:[107,2.6,0]}, {pos:[110,6,14],aim:[107,2.8,0]}, {pos:[152,7.5,18],aim:[142.5,2.3,0]}];
function render(stage,time,stopped){const i=Math.min(4,Math.floor(stage)),f=stage-i;const a=views[i],b=views[i+1];p.set(...a.pos).lerp(new T.Vector3(...b.pos),f);focus.set(...a.aim).lerp(new T.Vector3(...b.aim),f);
if(mobile()){focus.x-=1.8;focus.y+=3.5;camera.fov=53;p.y+=3;p.z+=5;}else camera.fov=39;
const heroCompact=mobile()?Math.max(0,Math.min(1,(820-innerHeight)/140))*Math.max(0,1-stage):0;
const distanceScale=mobile()?(1.68+1.2*heroCompact+.35*Math.max(0,1-Math.abs(stage-2))):(1.23+.22*Math.max(0,1-Math.abs(stage-2)));p.sub(focus).multiplyScalar(distanceScale).add(focus);camera.position.copy(p);camera.lookAt(focus);camera.updateProjectionMatrix();
// Off-axis projection leaves deliberate negative space for the copy.
if(!mobile()){camera.setViewOffset(innerWidth*1.27,innerHeight,innerWidth*.27,0,innerWidth,innerHeight);}else{camera.clearViewOffset();camera.setViewOffset(innerWidth,innerHeight*(1.22+.35*heroCompact),0,0,innerWidth,innerHeight);}
entry.position.x=stopped?0:Math.sin(time*.23)*.18;customsTruck.position.x=-1;exitTruck.position.x=140+(stage>4.8&&!stopped?Math.sin(time*.2)*.2:0);
for(const t of[entry,customsTruck,exitTruck]){for(const w of t.userData.wheels)w.rotation.z=stopped?0:time*.15;}
routePulses.forEach((m,j)=>{m.position.x=((j*19+time*3)%260)-60;});
scanPlane.position.x=2+(stopped?0:Math.sin(time*.7)*3.5);
forklift.position.x=-3+(stopped?0:Math.sin(time*.4)*1.2);
const cycle=time%6;const approach=Math.max(0,Math.min(1,(cycle-.4)/1.4));const peel=stopped?0:1-approach*approach*(3-2*approach);label.position.z=1.15+peel*.65;label.rotation.y=-peel*.2;label.position.x=.5+peel*.17;scan.visible=stopped||(cycle>2.1&&cycle<4.3);scan.position.y=3.7-(stopped?1.2:Math.max(0,Math.min(1,(cycle-2.1)/2.2))*2.7);scan.position.z=mode==='fsm'?.65:1.3;scan.scale.x=mode==='fsm'?.4:1;stamp.position.z=.21+peel*.3;applicator.position.y=3.65-(stopped?0:Math.max(0,Math.sin(time*1.2))*.23);
key.position.x=focus.x-8;key.target.position.copy(focus);if(!key.target.parent)scene.add(key.target);rim.position.x=focus.x+12;rim.target.position.copy(focus);if(!rim.target.parent)scene.add(rim.target);
const current=Math.round(stage);const near=(n)=>Math.abs(stage-n)<1.3;entry.visible=near(0);customs.visible=near(1);warehouse.visible=near(2);marking.visible=near(3)||near(4);exitTruck.visible=near(5);
renderer.render(scene,camera);if(lastStage!==current){canvas.dataset.stage=String(current);lastStage=current;}
}
function resize(){renderer.setPixelRatio(Math.min(devicePixelRatio,mobile()?1.5:1.75));renderer.shadowMap.enabled=!mobile();renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}window.addEventListener('resize',resize);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.body.classList.remove('webgl-ready');});canvas.addEventListener('webglcontextrestored',()=>{document.body.classList.add('webgl-ready');});
return{render,setMode(next){mode=next;codeGroup.visible=next==='code';bottleGroup.visible=next==='fsm';}};
}
