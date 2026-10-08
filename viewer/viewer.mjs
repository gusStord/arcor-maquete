import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const stage=document.querySelector('.stage'),status=document.querySelector('#status');
const scene=new THREE.Scene();scene.background=new THREE.Color('#e9e3d8');
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.prepend(renderer.domElement);
renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();window.showMaquetteError(new Error('WebGL context lost'));});
const envScene=new THREE.Scene();envScene.background=new THREE.Color(0xded5c5);const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(envScene,.04).texture;pmrem.dispose();scene.environmentIntensity=.55;
const camera=new THREE.PerspectiveCamera(40,1,.05,250),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=2;controls.maxDistance=65;
const ambient=new THREE.HemisphereLight(0xfff2d9,0x80684f,1.4);scene.add(ambient);
const key=new THREE.DirectionalLight(0xffe7c7,2);key.position.set(-3,25,4);key.target.position.set(10,0,-10);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:.5,far:70});key.shadow.normalBias=.025;scene.add(key,key.target);const fill=new THREE.DirectionalLight(0xe7efff,.8);fill.position.set(23,13,-15);scene.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xd8d1c6,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-.42;floor.receiveShadow=true;scene.add(floor);
const cv=([x,y,z])=>new THREE.Vector3(x,z,-y);
const chapters=[
 {name:'Geral',brand:'Arcor',verb:'Conectar',icon:'✦',accent:'#a86427',soft:'#f3e3cf',title:'Um Natal feito em família',copy:'Um mesmo universo ganha forma, movimento, calor e vínculo.',pos:[26,-20,24],target:[10,10,.5]},
 {name:'Entrada',brand:'Arcor',verb:'Começar',icon:'↗',accent:'#9b5b35',soft:'#efe0d3',title:'Entrar no incompleto',copy:'O primeiro convite: vocês fazem, o Natal responde.',pos:[14,-9,6],target:[9,5,1.2]},
 {name:'Tortuguita',brand:'Tortuguita',verb:'Imaginar',icon:'◒',accent:'#2f8b66',soft:'#ddefe7',title:'Imaginar',copy:'A composição de formas deixa o primeiro sinal da família.',pos:[8.7,3,5],target:[3.7,8,1]},
 {name:'Block',brand:'Block',verb:'Fazer acontecer',icon:'▦',accent:'#365f9b',soft:'#dfe8f4',title:'Fazer acontecer',copy:'Tentativa, ajuste e conquista se tornam movimento.',pos:[10,9,5.5],target:[4,14.5,1]},
 {name:'Butter Toffees',brand:'Butter Toffees',verb:'Encontrar o outro',icon:'∞',accent:'#b9782f',soft:'#f3e3cb',title:'Encontrar o outro',copy:'Dois gestos necessários. Um ritmo compartilhado.',pos:[23,6,5.2],target:[16.2,11.8,1]},
 {name:'Clímax',brand:'Arcor',verb:'Reconhecer',icon:'✶',accent:'#9c5d8a',soft:'#f0dfec',title:'Reconhecer',copy:'Forma, movimento e ritmo reaparecem na árvore coletiva.',pos:[17,3,5.5],target:[11.7,10.5,1.5]},
 {name:'Bon o Bon',brand:'Bon o Bon',verb:'Passar adiante',icon:'◆',accent:'#bb4e4a',soft:'#f4dfdc',title:'Passar adiante',copy:'A autoria ganha um destinatário. Para quem?',pos:[20,-3,5],target:[15,4.5,1]},
 {name:'Planta',brand:'Arcor',verb:'Conectar',icon:'⌗',accent:'#6f7468',soft:'#e7e9e3',title:'Um universo conectado',copy:'20 × 20 metros · quatro módulos por capítulo · passagens do estudo original.',pos:[10,9.99,34],target:[10,10,0]},
 {name:'Backstage',brand:'Operação',verb:'Sustentar',icon:'◇',accent:'#746459',soft:'#eae3dc',title:'Cuidar da operação',copy:'Materiais, reposição e organização do apoio.',pos:[21,14,5],target:[17,19.23,1]}
];
let goalPos=cv(chapters[0].pos),goalTarget=cv(chapters[0].target),moving=false,current=0,touring=false,lastTour=0;
camera.position.copy(goalPos);controls.target.copy(goalTarget);
function select(i){
 current=i;const c=chapters[i];goalPos=cv(c.pos);goalTarget=cv(c.target);moving=true;
 document.querySelector('#chapter-title').textContent=c.title;
 document.querySelector('#chapter-copy').textContent=c.copy;
 document.querySelector('#chapter-brand').textContent=c.brand;
 document.querySelector('#chapter-verb').textContent=c.verb;
 document.querySelector('#chapter-icon').textContent=c.icon;
 document.querySelector('#caption').style.setProperty('--caption-accent',c.accent);
 document.querySelectorAll('nav button').forEach((b,j)=>b.classList.toggle('active',i===j));
}
chapters.forEach((c,i)=>{
 const b=document.createElement('button');b.className='chapter-card';
 b.style.setProperty('--card-accent',c.accent);b.style.setProperty('--card-soft',c.soft);
 b.innerHTML=`<span class="chapter-icon">${c.icon}</span><span class="chapter-text"><span class="chapter-brand-name">${c.brand}</span><span class="chapter-verb">${c.verb}</span></span><span class="chapter-number">${String(i).padStart(2,'0')}</span>`;
 b.setAttribute('aria-label',`${c.brand}: ${c.verb}`);
 b.onclick=()=>{stopTour();select(i)};document.querySelector('#chapters').append(b)
});select(0);
function stopTour(){touring=false;document.querySelector('#tour').textContent='Iniciar visita'}
controls.addEventListener('start',()=>{moving=false;stopTour()});
document.querySelector('#reset').onclick=()=>{stopTour();select(0)};
document.querySelector('#tour').onclick=()=>{touring=!touring;lastTour=performance.now();document.querySelector('#tour').textContent=touring?'Pausar visita':'Iniciar visita';if(touring)select(1)};
document.querySelector('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{status.textContent='Tela cheia indisponível neste navegador.'}};
const routeGroup=new THREE.Group();routeGroup.visible=false;scene.add(routeGroup);
const brandGroup=new THREE.Group();scene.add(brandGroup);
function makeBrandMarker(label,icon,color,pos){
 const group=new THREE.Group();group.position.copy(cv(pos));
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.55,10),new THREE.MeshStandardMaterial({color:0x5b493b,roughness:.75}));stem.position.y=.28;
 const disc=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.08,32),new THREE.MeshStandardMaterial({color:new THREE.Color(color),roughness:.55,metalness:.05}));disc.rotation.x=Math.PI/2;disc.position.y=.61;
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,512,160);ctx.font='700 58px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fffaf2';ctx.fillText(icon+'  '+label,256,80);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const mat=new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false});const sp=new THREE.Sprite(mat);sp.scale.set(3.6,1.12,1);sp.position.y=1.35;sp.renderOrder=10;
 group.add(stem,disc,sp);brandGroup.add(group);
}
makeBrandMarker('TORTUGUITA','◒','#2f8b66',[3.7,8,0]);
makeBrandMarker('BLOCK','▦','#365f9b',[4,14.5,0]);
makeBrandMarker('BUTTER TOFFEES','∞','#b9782f',[16.2,11.8,0]);
makeBrandMarker('BON O BON','◆','#bb4e4a',[15,4.5,0]);
document.querySelector('#brands').onclick=()=>{brandGroup.visible=!brandGroup.visible;document.querySelector('#brands').textContent=brandGroup.visible?'Ocultar marcas':'Mostrar marcas';};

fetch('../validacao-256-rotas.json').then(r=>r.json()).then(data=>{const sample=data.routes[0];for(const leg of sample.legs){const geom=new THREE.BufferGeometry().setFromPoints(leg.points_m.map(([x,y])=>cv([x,y,.095])));const line=new THREE.Line(geom,new THREE.LineBasicMaterial({color:0x348578}));routeGroup.add(line)}}).catch(()=>status.textContent='Percurso indisponível. Maquete continua utilizável.');
document.querySelector('#route').onclick=()=>{routeGroup.visible=!routeGroup.visible;document.querySelector('#route').textContent=routeGroup.visible?'Ocultar percurso':'Mostrar percurso';status.textContent=routeGroup.visible?'Exemplo T1 → B1 → BT1 → clímax → BO1. Há trechos compartilhados.':'Maquete pronta · 16 módulos'};
let encounter=false,contributions=[];
document.querySelector('#light').onclick=()=>{encounter=!encounter;document.querySelector('#light').textContent=encounter?'Luz de apresentação':'Luz de encontro';scene.background.set(encounter?0x25201d:0xe9e3d8);key.intensity=encounter?.65:2;fill.intensity=encounter?.3:.8;ambient.intensity=encounter?.45:1.4};
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const loadingMessage=document.querySelector('#loading-message');
async function loadMaquette(){
 const response=await fetch('../ARCOR_MAQUETE_HUNYUAN.glb?v=ambientada-2',{signal:AbortSignal.timeout(120000)});
 if(!response.ok)throw new Error(`Model HTTP ${response.status}`);
 const total=Number(response.headers.get('content-length')),reader=response.body.getReader(),chunks=[];let bytes=0;
 while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);bytes+=value.length;loadingMessage.textContent=total?`Carregando maquete: ${Math.min(100,Math.round(bytes/total*100))}%`:`Carregando maquete: ${(bytes/1048576).toFixed(1)} MB`;}
 loadingMessage.textContent='Preparando materiais e detalhes…';
 const data=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}
 const gltf=await loader.parseAsync(data.buffer,new URL('../',location.href).href);
 gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});scene.add(gltf.scene);document.querySelector('#loading').hidden=true;status.textContent='Maquete pronta · 16 módulos';
 document.querySelectorAll('.tools button').forEach(b=>b.disabled=false);
}
document.querySelectorAll('.tools button').forEach(b=>b.disabled=true);
loadMaquette().catch(window.showMaquetteError);
function resize(){renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(stage);resize();
renderer.setAnimationLoop(t=>{if(touring&&t-lastTour>6000){select(current>=6?1:current+1);lastTour=t}if(moving){camera.position.lerp(goalPos,.055);controls.target.lerp(goalTarget,.055);if(camera.position.distanceTo(goalPos)<.015)moving=false}if(encounter){for(let i=0;i<contributions.length;i++){const o=contributions[i];o.scale.copy(o.userData.baseScale).multiplyScalar(.87+.13*Math.sin(t*.0014+i*.3))}}else for(const o of contributions)o.scale.copy(o.userData.baseScale);controls.update();renderer.render(scene,camera)});

const closeViews={1:[[13.8,-1,2.8],[10.98,2.4,.7]],2:[[4.6,5.2,2.9],[2.21,10.38,.9]],3:[[4.6,11,3],[2.4,17.3,.9]],4:[[17,6.6,2.8],[14.9,11.28,.95]],5:[[14.8,6.3,3.7],[11.7,10.5,1.55]],6:[[16,1.5,2.8],[13.5,4.3,.8]],8:[[19.5,16,2.9],[17,19.23,1.1]]};document.querySelector('#detail').onclick=()=>{stopTour();if(!closeViews[current])select(2);const v=closeViews[current];goalPos=cv(v[0]);goalTarget=cv(v[1]);moving=true};
