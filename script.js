import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const $=id=>document.getElementById(id);
const menu=$('startScreen'),hud=$('hud'),pauseScreen=$('pauseScreen'),canvas=$('gameCanvas'),toast=$('toast');
let mode='creative',playing=false,paused=false,selectedBlock='grass',yaw=0,pitch=0,velocityY=0,grounded=false,health=100,food=100,lastFoodTick=0,toastTimer;
const keys={},touchMove={forward:false,back:false,left:false,right:false};
const scene=new THREE.Scene();scene.background=new THREE.Color(0x83c9ff);scene.fog=new THREE.Fog(0x83c9ff,25,90);
const camera=new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.1,300);camera.position.set(0,7,9);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
scene.add(new THREE.HemisphereLight(0xe5f7ff,0x56633a,2.1));const sun=new THREE.DirectionalLight(0xfff2d5,2.2);sun.position.set(20,35,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const mats={grass:new THREE.MeshLambertMaterial({color:0x65b943}),dirt:new THREE.MeshLambertMaterial({color:0x8c5938}),stone:new THREE.MeshLambertMaterial({color:0x888e91}),wood:new THREE.MeshLambertMaterial({color:0x98602f}),leaves:new THREE.MeshLambertMaterial({color:0x32833b}),sand:new THREE.MeshLambertMaterial({color:0xdac27b})};
const cube=new THREE.BoxGeometry(1,1,1),blocks=new Map(),meshes=[];let terrain=new Map();
const id=(x,y,z)=>x+','+y+','+z;
function addBlock(x,y,z,type='grass'){x=Math.round(x);y=Math.round(y);z=Math.round(z);const k=id(x,y,z);if(blocks.has(k))return false;const m=new THREE.Mesh(cube,mats[type]||mats.grass);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;m.userData={x,y,z,type};scene.add(m);blocks.set(k,m);meshes.push(m);return true}
function removeBlock(m){if(!m||!m.userData)return;const b=m.userData;scene.remove(m);blocks.delete(id(b.x,b.y,b.z));const i=meshes.indexOf(m);if(i>=0)meshes.splice(i,1);return b}
function heightAt(x,z){return terrain.get(Math.round(x)+','+Math.round(z))??2}
function buildWorld(){for(let x=-20;x<=20;x++)for(let z=-20;z<=20;z++){const h=Math.max(1,Math.floor(2+Math.sin(x*.24)*1.2+Math.cos(z*.29)*1.1+Math.sin((x+z)*.15)));terrain.set(x+','+z,h);for(let y=0;y<=h;y++)addBlock(x,y,z,y===h?(h<=2?'sand':'grass'):(y<h-2?'stone':'dirt'));if(Math.random()<.035&&Math.abs(x)>3&&Math.abs(z)>3&&h>2){for(let y=h+1;y<=h+3;y++)addBlock(x,y,z,'wood');for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let dy=2;dy<=4;dy++)if(Math.abs(dx)+Math.abs(dz)+(dy===4?1:0)<5&&Math.random()>.12)addBlock(x+dx,h+dy,z+dz,'leaves')}}}
buildWorld();
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1700)}
function updateStats(){ $('healthValue').textContent=health;$('foodValue').textContent=food;$('survivalStats').classList.toggle('hidden',mode!=='survival')}
function setMode(m){mode=m;document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===m))}
document.querySelectorAll('.mode').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
function begin(){menu.classList.add('hidden');pauseScreen.classList.add('hidden');hud.classList.remove('hidden');playing=true;paused=false;$('modeLabel').textContent=mode.toUpperCase()+' MODE';updateStats();if(mode==='survival')showToast('Stay alert and explore!');else showToast('Creative mode: build anything!');if(matchMedia('(pointer:fine)').matches)canvas.requestPointerLock?.()}
$('playButton').addEventListener('click',begin);
function pause(){if(!playing)return;paused=true;playing=false;pauseScreen.classList.remove('hidden');if(document.pointerLockElement)document.exitPointerLock()}
$('pauseButton').addEventListener('click',pause);
$('resumeButton').addEventListener('click',()=>{pauseScreen.classList.add('hidden');playing=true;paused=false;if(matchMedia('(pointer:fine)').matches)canvas.requestPointerLock?.()});
$('restartButton').addEventListener('click',()=>{health=100;food=100;camera.position.set(0,heightAt(0,0)+2.2,0);yaw=0;pitch=0;begin();showToast('Fresh adventure started!')});
$('menuButton').addEventListener('click',()=>{pauseScreen.classList.add('hidden');hud.classList.add('hidden');menu.classList.remove('hidden');playing=false;paused=false});
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement===canvas){playing=true;paused=false}});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement!==canvas||!playing)return;yaw-=e.movementX*.0022;pitch-=e.movementY*.0022;pitch=Math.max(-1.45,Math.min(1.45,pitch));camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0)});
let touchX=null,touchY=null;
canvas.addEventListener('touchstart',e=>{if(!playing)return;const t=e.touches[0];touchX=t.clientX;touchY=t.clientY},{passive:true});
canvas.addEventListener('touchmove',e=>{if(!playing||touchX===null)return;const t=e.touches[0];yaw-=(t.clientX-touchX)*.006;pitch-=(t.clientY-touchY)*.006;pitch=Math.max(-1.4,Math.min(1.4,pitch));camera.rotation.order='YXZ';camera.rotation.set(pitch,yaw,0);touchX=t.clientX;touchY=t.clientY},{passive:true});
canvas.addEventListener('touchend',()=>{touchX=touchY=null},{passive:true});
document.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Space'&&grounded&&playing){velocityY=8;grounded=false}if(/^Digit[1-6]$/.test(e.code))selectBlock(['grass','dirt','stone','wood','leaves','sand'][Number(e.code.slice(-1))-1]);if(e.code==='Escape'&&playing&&document.pointerLockElement!==canvas)pause()});
document.addEventListener('keyup',e=>keys[e.code]=false);
function selectBlock(type){selectedBlock=type;document.querySelectorAll('.slot').forEach(b=>b.classList.toggle('selected',b.dataset.block===type));}
document.querySelectorAll('.slot').forEach(b=>b.addEventListener('click',()=>selectBlock(b.dataset.block)));
document.querySelectorAll('[data-move]').forEach(b=>{const d=b.dataset.move;const on=e=>{e.preventDefault();touchMove[d]=true};const off=e=>{e.preventDefault();touchMove[d]=false};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off)});
$('jumpButton').addEventListener('pointerdown',e=>{e.preventDefault();if(grounded&&playing){velocityY=8;grounded=false}});
const raycaster=new THREE.Raycaster();function targetBlock(){raycaster.setFromCamera(new THREE.Vector2(0,0),camera);return raycaster.intersectObjects(meshes,false)[0]}
function mine(){if(!playing)return;const hit=targetBlock();if(!hit||hit.distance>6){showToast('Aim at a block within reach');return}removeBlock(hit.object);if(mode==='survival')food=Math.max(0,food-1);updateStats();showToast('Block mined!')}
function build(){if(!playing)return;const hit=targetBlock();if(!hit||hit.distance>6){showToast('Aim at a block face first');return}const normal=hit.face.normal.clone().transformDirection(hit.object.matrixWorld),p=hit.object.position.clone().add(normal),x=Math.round(p.x),y=Math.round(p.y),z=Math.round(p.z);if(Math.abs(x-camera.position.x)<.8&&Math.abs(z-camera.position.z)<.8&&Math.abs(y-(camera.position.y-1))<1.7){showToast('You cannot build inside yourself');return}if(addBlock(x,y,z,selectedBlock))showToast(selectedBlock+' block placed');else showToast('That space is occupied')}
canvas.addEventListener('mousedown',e=>{if(!playing)return;if(document.pointerLockElement!==canvas&&matchMedia('(pointer:fine)').matches){canvas.requestPointerLock?.();return}if(e.button===0)mine();if(e.button===2)build()});canvas.addEventListener('contextmenu',e=>e.preventDefault());
$('mineButton').addEventListener('click',mine);$('buildButton').addEventListener('click',build);
let soundOn=false,audioCtx;function beep(freq=440){if(!soundOn)return;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=freq;g.gain.value=.035;o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.07)}catch{}}
$('soundButton').addEventListener('click',()=>{soundOn=!soundOn;$('soundButton').textContent=soundOn?'♫':'♪';showToast(soundOn?'Sound on':'Sound off');beep()});
function updatePlayer(dt,now){if(!playing)return;const move=new THREE.Vector3();if(keys.KeyW||keys.ArrowUp||touchMove.forward)move.z-=1;if(keys.KeyS||keys.ArrowDown||touchMove.back)move.z+=1;if(keys.KeyA||keys.ArrowLeft||touchMove.left)move.x-=1;if(keys.KeyD||keys.ArrowRight||touchMove.right)move.x+=1;if(move.lengthSq()){move.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);const speed=(keys.ShiftLeft?8:5.5)*dt;camera.position.x+=move.x*speed;camera.position.z+=move.z*speed}camera.position.x=Math.max(-19,Math.min(19,camera.position.x));camera.position.z=Math.max(-19,Math.min(19,camera.position.z));velocityY-=22*dt;camera.position.y+=velocityY*dt;const ground=heightAt(camera.position.x,camera.position.z)+1.65;if(camera.position.y<ground){camera.position.y=ground;velocityY=0;grounded=true}else grounded=false;if(mode==='survival'&&now-lastFoodTick>6000){lastFoodTick=now;food=Math.max(0,food-1);if(food===0)health=Math.max(0,health-1);updateStats();if(health===0){pause();showToast('You ran out of energy! Start a new world.')}}$('positionLabel').textContent='X '+Math.round(camera.position.x)+' · Z '+Math.round(camera.position.z)}
let last=performance.now();function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;updatePlayer(dt,now);sun.position.x=Math.sin(now*.00005)*24+10;renderer.render(scene,camera)}requestAnimationFrame(animate);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75))});
window.addEventListener('error',e=>{const box=$('errorMessage');box.textContent='Something went wrong: '+e.message+' — try refreshing with an internet connection.';box.classList.remove('hidden')});
window.addEventListener('unhandledrejection',e=>{const box=$('errorMessage');box.textContent='Could not load the 3D game. Check your internet connection and refresh.';box.classList.remove('hidden')});
camera.rotation.order='YXZ';camera.rotation.set(0,0,0);