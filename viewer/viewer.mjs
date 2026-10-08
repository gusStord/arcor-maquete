import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const stage=document.querySelector('.stage'),status=document.querySelector('#status');
const scene=new THREE.Scene();scene.background=new THREE.Color('#e9e3d8');
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;stage.prepend(renderer.domElement);
renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();window.showMaquetteError(new Error('WebGL context lost'));});
const envScene=new THREE.Scene();envScene.background=new THREE.Color(0xded5c5);const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(envScene,.04).texture;pmrem.dispose();scene.environmentIntensity=.8;
const camera=new THREE.PerspectiveCamera(40,1,.05,250),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=2;controls.maxDistance=65;
scene.add(new THREE.HemisphereLight(0xfff2d9,0x80684f,2.6));
const key=new THREE.DirectionalLight(0xffe7c7,3);key.position.set(-8,22,15);scene.add(key);const fill=new THREE.DirectionalLight(0xe7efff,2);fill.position.set(23,13,-15);scene.add(fill);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xd8d1c6,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.position.y=-.42;scene.add(floor);
const cv=([x,y,z])=>new THREE.Vector3(x,z,-y);
const chapters=[
 ['Geral','Um Natal feito em família','Um mesmo universo ganha forma, movimento, calor e vínculo.',[30,-28,29],[10,10,.5]],
 ['Entrada','Entrar no incompleto','O primeiro convite: vocês fazem, o Natal responde.',[14,-9,6],[9,5,1.2]],
 ['Tortuguita','Imaginar','A composição de formas deixa o primeiro sinal da família.',[8.7,3,5],[3.7,8,1]],
 ['Block','Fazer acontecer','Tentativa, ajuste e conquista se tornam movimento.',[10,9,5.5],[4,14.5,1]],
 ['Butter Toffees','Encontrar o outro','Dois gestos necessários. Um ritmo compartilhado.',[23,6,5.2],[16.2,11.8,1]],
 ['Clímax','Reconhecer','Forma, movimento e ritmo reaparecem na árvore coletiva.',[17,3,5.5],[11.7,10.5,1.5]],
 ['Bon o Bon','Passar adiante','A autoria ganha um destinatário. Para quem?', [20,-3,5],[15,4.5,1]],
 ['Planta','Um universo conectado','20 × 20 metros · quatro módulos por capítulo · passagens preservadas.',[10,9.99,34],[10,10,0]],
 ['Backstage','Cuidar da operação','Materiais, reposição e organização do apoio.',[21,14,5],[17,19.23,1]]
];
let goalPos=cv(chapters[0][3]),goalTarget=cv(chapters[0][4]),moving=false,current=0,touring=false,lastTour=0;
camera.position.copy(goalPos);controls.target.copy(goalTarget);
function select(i){current=i;goalPos=cv(chapters[i][3]);goalTarget=cv(chapters[i][4]);moving=true;document.querySelector('#chapter-title').textContent=chapters[i][1];document.querySelector('#chapter-copy').textContent=chapters[i][2];document.querySelectorAll('nav button').forEach((b,j)=>b.classList.toggle('active',i===j));}
chapters.forEach((c,i)=>{const b=document.createElement('button');b.innerHTML=`<span>${String(i).padStart(2,'0')}</span>${c[0]}`;b.onclick=()=>{stopTour();select(i)};document.querySelector('#chapters').append(b)});select(0);
function stopTour(){touring=false;document.querySelector('#tour').textContent='Iniciar visita'}
controls.addEventListener('start',()=>{moving=false;stopTour()});
document.querySelector('#reset').onclick=()=>{stopTour();select(0)};
document.querySelector('#tour').onclick=()=>{touring=!touring;lastTour=performance.now();document.querySelector('#tour').textContent=touring?'Pausar visita':'Iniciar visita';if(touring)select(1)};
document.querySelector('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{status.textContent='Tela cheia indisponível neste navegador.'}};
const routeGroup=new THREE.Group();routeGroup.visible=false;scene.add(routeGroup);
fetch('../validacao-256-rotas.json').then(r=>r.json()).then(data=>{const sample=data.routes[0];for(const leg of sample.legs){const geom=new THREE.BufferGeometry().setFromPoints(leg.points_m.map(([x,y])=>cv([x,y,.095])));const line=new THREE.Line(geom,new THREE.LineBasicMaterial({color:0x348578}));routeGroup.add(line)}}).catch(()=>status.textContent='Percurso indisponível. Maquete continua utilizável.');
document.querySelector('#route').onclick=()=>{routeGroup.visible=!routeGroup.visible;document.querySelector('#route').textContent=routeGroup.visible?'Ocultar percurso':'Mostrar percurso';status.textContent=routeGroup.visible?'Exemplo T1 → B1 → BT1 → clímax → BO1. Há trechos compartilhados.':'Maquete pronta · 16 módulos'};
let encounter=false,contributions=[];
document.querySelector('#light').onclick=()=>{encounter=!encounter;document.querySelector('#light').textContent=encounter?'Luz de apresentação':'Luz de encontro';scene.background.set(encounter?0x25201d:0xe9e3d8);key.intensity=encounter?.8:3;fill.intensity=encounter?.5:2};
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const loadingMessage=document.querySelector('#loading-message');
async function loadMaquette(){
 const response=await fetch('../ARCOR_MAQUETE_HUNYUAN.glb',{signal:AbortSignal.timeout(120000)});
 if(!response.ok)throw new Error(`Model HTTP ${response.status}`);
 const total=Number(response.headers.get('content-length')),reader=response.body.getReader(),chunks=[];let bytes=0;
 while(true){const {done,value}=await reader.read();if(done)break;chunks.push(value);bytes+=value.length;loadingMessage.textContent=total?`Carregando maquete: ${Math.min(100,Math.round(bytes/total*100))}%`:`Carregando maquete: ${(bytes/1048576).toFixed(1)} MB`;}
 loadingMessage.textContent='Preparando materiais e detalhes…';
 const data=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}
 const gltf=await loader.parseAsync(data.buffer,new URL('../',location.href).href);
 scene.add(gltf.scene);document.querySelector('#loading').hidden=true;status.textContent='Maquete pronta · 16 módulos';
 document.querySelectorAll('.tools button').forEach(b=>b.disabled=false);
}
document.querySelectorAll('.tools button').forEach(b=>b.disabled=true);
loadMaquette().catch(window.showMaquetteError);
function resize(){renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(stage);resize();
renderer.setAnimationLoop(t=>{if(touring&&t-lastTour>6000){select(current>=6?1:current+1);lastTour=t}if(moving){camera.position.lerp(goalPos,.055);controls.target.lerp(goalTarget,.055);if(camera.position.distanceTo(goalPos)<.015)moving=false}if(encounter){for(let i=0;i<contributions.length;i++){const o=contributions[i];o.scale.copy(o.userData.baseScale).multiplyScalar(.87+.13*Math.sin(t*.0014+i*.3))}}else for(const o of contributions)o.scale.copy(o.userData.baseScale);controls.update();renderer.render(scene,camera)});

const closeViews={1:[[13.8,-1,2.8],[10.98,2.4,.7]],2:[[4.6,5.2,2.9],[2.21,10.38,.9]],3:[[4.6,11,3],[2.4,17.3,.9]],4:[[17,6.6,2.8],[14.9,11.28,.95]],5:[[14.8,6.3,3.7],[11.7,10.5,1.55]],6:[[16,1.5,2.8],[13.5,4.3,.8]],8:[[19.5,16,2.9],[17,19.23,1.1]]};document.querySelector('#detail').onclick=()=>{stopTour();if(!closeViews[current])select(2);const v=closeViews[current];goalPos=cv(v[0]);goalTarget=cv(v[1]);moving=true};
