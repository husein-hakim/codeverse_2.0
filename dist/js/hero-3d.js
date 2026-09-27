import * as THREE from './vendor/three.module.js';

// One ScrollTrigger playhead owns camera, door, text planes, and poster transforms.
// No wheel interception, scroll snapping, time-driven drift, or permanent RAF loop.
export async function mountVaultStory(root) {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) throw new Error('Scroll renderer is unavailable');
  gsap.registerPlugin(ScrollTrigger);
  const stage = root.querySelector('.hero-stage');
  const host = root.querySelector('.vault-canvas');
  const poster = root.querySelector('.hero-image');
  const plate = root.querySelector('.hero-brandplate');
  const openingKicker = root.querySelector('.hero-opening-kicker');
  const chapters = [...root.querySelectorAll('[data-story-chapter]')];
  const number = root.querySelector('#beat-number');
  const tracks = [...root.querySelectorAll('.beat-track i')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const resources = new Set();
  let renderer, scene, camera, hinge, wheel, trigger, timeline;
  let active = false, disposed = false, failed = false, inView = true;
  let resizeTimer, lastBeat = -1, narrow = innerWidth < 768;
  const clock = { progress: 0 };
  const own = (resource) => {resources.add(resource);return resource;};
  const lerp = THREE.MathUtils.lerp;
  const clamp = THREE.MathUtils.clamp;
  const smooth = (p) => p * p * (3 - 2 * p);
  const reduced = () => preference.matches || document.body.classList.contains('motion-off');
  const posterReady = () => Promise.race([poster.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,1400))]);

  function clearCopy() {
    for (const el of [plate,openingKicker,poster,...chapters]) {
      el.style.removeProperty('transform');
      el.style.removeProperty('opacity');
      el.style.removeProperty('will-change');
    }
    host.style.removeProperty('opacity');
  }
  function stop() {
    active = false;
    trigger?.kill(); timeline?.kill(); trigger = timeline = null;
    root.classList.remove('hero-enhanced');
    clearCopy();
    root.dataset.sceneMode = 'static';
    ScrollTrigger.refresh();
  }
  async function fallback(reason) {
    if (failed || disposed) return;
    failed = true;
    stop();
    await posterReady();
    root.dataset.sceneState = 'fallback';
    root.dataset.sceneReason = reason;
  }
  function releaseRenderer() {
    resources.forEach(resource=>resource.dispose?.());resources.clear();
    renderer?.dispose(); renderer?.domElement.remove();
    renderer = null;
  }
  function metalTexture() {
    const canvas = document.createElement('canvas'); canvas.width=canvas.height=256;
    const context=canvas.getContext('2d');
    context.fillStyle='#8b8e8f';context.fillRect(0,0,256,256);
    // Fine machining texture, deterministic so idle and scroll frames are comparable.
    for(let y=0;y<256;y++){
      const value=128+((y*37)%45);context.fillStyle=`rgba(${value},${value},${value},.34)`;
      context.fillRect(0,y,256,1);
    }
    const texture=own(new THREE.CanvasTexture(canvas));
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,3);
    texture.colorSpace=THREE.SRGBColorSpace;return texture;
  }
  function createScene() {
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,narrow?1.25:1.65));
    renderer.setClearColor(0x101111,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.2;
    host.append(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden','true');
    renderer.domElement.addEventListener('webglcontextlost',contextLost);
    renderer.domElement.addEventListener('webglcontextrestored',contextRestored);
    scene=new THREE.Scene();scene.fog=new THREE.Fog(0x111313,20,43);
    camera=new THREE.PerspectiveCamera(42,1,.12,70);
    const brushed=metalTexture();
    const steel=own(new THREE.MeshStandardMaterial({color:0x858e91,metalness:.72,roughness:.34,map:brushed}));
    const polished=own(new THREE.MeshStandardMaterial({color:0xb2b8b7,metalness:.85,roughness:.22}));
    const graphite=own(new THREE.MeshStandardMaterial({color:0x282e2e,metalness:.5,roughness:.55}));
    const roomMat=own(new THREE.MeshStandardMaterial({color:0x242a29,metalness:.25,roughness:.85}));
    const red=own(new THREE.MeshStandardMaterial({color:0x631418,metalness:.35,roughness:.45}));
    const strip=own(new THREE.MeshStandardMaterial({color:0xcfd8d7,emissive:0xa5b4b5,emissiveIntensity:2.2,roughness:.3}));
    const banknotes=own(new THREE.MeshStandardMaterial({color:0x899184,roughness:1}));
    const band=own(new THREE.MeshStandardMaterial({color:0xc4c4b3,roughness:.85}));
    function mesh(geometry,material,parent=scene){const obj=new THREE.Mesh(own(geometry),material);parent.add(obj);return obj;}
    function box(w,h,d,x,y,z,material=roomMat,parent=scene){const obj=mesh(new THREE.BoxGeometry(w,h,d),material,parent);obj.position.set(x,y,z);return obj;}
    function torus(radius,tube,z,material=steel,parent=scene){const obj=mesh(new THREE.TorusGeometry(radius,tube,12,96),material,parent);obj.position.set(3,0,z);return obj;}
    // Vault throat: visible front bevel, inside wall, rear lip, and separate machined rings.
    torus(3.24,.26,0);torus(3.03,.10,.24,polished);torus(3.4,.07,-.13,graphite);torus(3.12,.12,-.78);
    const tunnel=mesh(new THREE.CylinderGeometry(3.08,3.08,.85,96,1,true),graphite);tunnel.rotation.x=Math.PI/2;tunnel.position.set(3,0,-.35);
    const boltGeometry=own(new THREE.CylinderGeometry(.105,.105,.13,6));
    const bolts=own(new THREE.InstancedMesh(boltGeometry,polished,24));
    const placement=new THREE.Object3D();
    for(let i=0;i<24;i++){const angle=i*Math.PI/12;placement.rotation.set(Math.PI/2,0,0);placement.position.set(3+Math.cos(angle)*3.25,Math.sin(angle)*3.25,.28);placement.updateMatrix();bolts.setMatrixAt(i,placement.matrix);}
    scene.add(bolts);
    // A real hinged door, not a flat plane scaled to simulate one.
    hinge=new THREE.Group();hinge.position.set(6.22,0,.12);scene.add(hinge);
    const door=new THREE.Group();door.position.x=-3.22;hinge.add(door);
    const disk=mesh(new THREE.CylinderGeometry(2.96,2.96,.5,96),steel,door);disk.rotation.x=Math.PI/2;
    const ring=mesh(new THREE.TorusGeometry(2.82,.07,10,96),polished,door);ring.position.z=.29;
    const inner=mesh(new THREE.CylinderGeometry(2.61,2.61,.08,96),graphite,door);inner.rotation.x=Math.PI/2;inner.position.z=.3;
    const center=mesh(new THREE.CylinderGeometry(.48,.48,.27,48),polished,door);center.rotation.x=Math.PI/2;center.position.z=.45;
    wheel=new THREE.Group();wheel.position.z=.62;door.add(wheel);
    mesh(new THREE.TorusGeometry(.72,.075,10,48),polished,wheel);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      const latch=box(.95,.12,.12,Math.cos(a)*2.18,Math.sin(a)*2.18,.45,steel,door);latch.rotation.z=a;
      const rail=box(.98,.11,.08,Math.cos(a)*1.2,Math.sin(a)*1.2,.45,polished,door);rail.rotation.z=a;
      if(i%2===0){const spoke=box(.65,.07,.06,Math.cos(a)*.32,Math.sin(a)*.32,0,polished,wheel);spoke.rotation.z=a;}
    }
    for(const y of [-2,2]){const joint=mesh(new THREE.CylinderGeometry(.19,.19,.7,20),polished);joint.position.set(6.24,y,0);}
    // The chamber beyond is actual world-space geometry. Camera passes through the opening.
    box(10,.25,29,3,-3.5,-13);box(10,.2,29,3,3.55,-13);
    box(.3,7.1,29,-2.1,0,-13);box(.3,7.1,29,8.1,0,-13);box(10,7.1,.3,3,0,-27);
    for(const z of [-4,-9,-14,-19,-24]){
      box(8,.055,.17,3,3.35,z,strip);
      for(const x of [-1.91,7.91]){box(.06,6.4,.13,x,0,z,graphite);box(.025,.045,2.3,x,-2.6,z,red);}
    }
    // Stacked inventory and currency bands remain subdued; no floating prop clutter.
    const crates=own(new THREE.InstancedMesh(own(new THREE.BoxGeometry(1.7,.65,1.2)),graphite,6));
    const notes=own(new THREE.InstancedMesh(own(new THREE.BoxGeometry(.46,.12,.9)),banknotes,54));
    const bands=own(new THREE.InstancedMesh(own(new THREE.BoxGeometry(.09,.125,.92)),band,54));
    placement.rotation.set(0,0,0);let noteIndex=0,crateIndex=0;
    for(let side=0;side<2;side++)for(let row=0;row<3;row++){
      const x=side?6.3:-.3,z=-10-row*6;
      placement.position.set(x,-3.03,z);placement.updateMatrix();crates.setMatrixAt(crateIndex++,placement.matrix);
      for(let col=0;col<3;col++)for(let layer=0;layer<3;layer++){
        placement.position.set(x+(col-1)*.52,-2.62+layer*.13,z);placement.updateMatrix();
        notes.setMatrixAt(noteIndex,placement.matrix);bands.setMatrixAt(noteIndex++,placement.matrix);
      }
    }
    scene.add(crates,notes,bands);
    scene.add(new THREE.HemisphereLight(0xbfc7c5,0x080909,2));
    const key=new THREE.DirectionalLight(0xf5f2e8,3.5);key.position.set(-3,6,10);scene.add(key);
    const rim=new THREE.DirectionalLight(0xaeb9be,2);rim.position.set(7,2,-5);scene.add(rim);
    const redLight=new THREE.PointLight(0xe12b32,26,12,2);redLight.position.set(7,-2,3);scene.add(redLight);
    for(const z of [-5,-13,-22]){const light=new THREE.PointLight(0xc7d2d4,38,15,2);light.position.set(3,2.8,z);scene.add(light);}
    resizeRenderer();
  }
  const fullPath=[
    {camera:[-.7,.35,14.2],target:[1.6,0,-3],door:-.28,wheel:0},
    {camera:[.9,.2,11.5],target:[2.8,0,-4],door:-1.05,wheel:.65},
    {camera:[3,.08,6.5],target:[3,0,-10],door:-1.48,wheel:1.0},
    {camera:[3,.03,-2.5],target:[3,.1,-14],door:-1.48,wheel:1.0},
    {camera:[3,.12,-9.5],target:[3,.1,-23],door:-1.48,wheel:1.0}
  ];
  function pose(progress) {
    const segment=Math.min(Math.floor(progress*4),3);
    // A pause at each waypoint makes the type readable. Travel has a smooth acceleration.
    const part=clamp(progress*4-segment,0,1);
    const travel=smooth(clamp((part-.28)/.58,0,1));
    const a=fullPath[segment],b=fullPath[segment+1];
    const mobileOffset=narrow?2.3:0;
    const position=a.camera.map((value,i)=>lerp(value,b.camera[i],travel)+(i===2?mobileOffset:0));
    const target=a.target.map((value,i)=>lerp(value,b.target[i],travel));
    camera.position.fromArray(position);camera.lookAt(...target);
    hinge.rotation.y=lerp(a.door,b.door,travel);
    wheel.rotation.z=lerp(a.wheel,b.wheel,travel);
  }
  function chapterWeight(progress,index){
    const position=progress*4;
    const segment=Math.min(Math.floor(position),3);
    const part=position-segment;
    // Separate the outgoing and incoming type planes: no double-exposed headings.
    if(index===segment) return 1-smooth(clamp((part-.28)/.14,0,1));
    if(index===segment+1) return smooth(clamp((part-.42)/.10,0,1));
    return 0;
  }
  function paintCopy(progress){
    let beatIndex=0,best=-1;
    chapters.forEach((chapter,index)=>{
      const distance=progress*4-index,weight=chapterWeight(progress,index);
      if(weight>best){best=weight;beatIndex=index;}
      const outgoing=distance>0;
      const amount=1-weight;
      chapter.style.opacity=String(weight);
      chapter.style.transform=`translate3d(${amount*(outgoing?-22:38)}px,${amount*(outgoing?-10:14)}px,${amount*(outgoing?150:-220)}px) rotateY(${amount*(outgoing?-3:5)}deg)`;
    });
    const brandWeight=1-smooth(clamp((progress-.32)/.035,0,1));
    plate.style.opacity=String(brandWeight);
    plate.style.transform=`translate3d(${-36*(1-brandWeight)}px,0,${-260*(1-brandWeight)}px) rotateY(${-4*(1-brandWeight)}deg)`;
    openingKicker.style.opacity=String(1-smooth(clamp((progress-.08)/.06,0,1)));
    poster.style.opacity=String(lerp(.95,.13,smooth(clamp(progress*1.5,0,1))));
    poster.style.transform=`scale(${1+progress*.08})`;
    if(beatIndex!==lastBeat){lastBeat=beatIndex;root.dataset.activeChapter=String(beatIndex+1);number.textContent=String(beatIndex+1).padStart(2,'0');tracks.forEach((el,i)=>el.classList.toggle('active',i<=beatIndex));}
  }
  function render(){
    if(!renderer||disposed||document.hidden||!inView)return;
    try{pose(clock.progress);renderer.render(scene,camera);if(active)paintCopy(clock.progress);root.dataset.cameraZ=camera.position.z.toFixed(2);root.dataset.scrollProgress=clock.progress.toFixed(4);}
    catch{fallback('render');}
  }
  function resizeRenderer(){
    if(!renderer)return;
    const rect=stage.getBoundingClientRect();
    const width=Math.max(1,rect.width),height=Math.max(640,innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio,narrow?1.25:1.65));
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
  }
  async function start(){
    if(disposed||failed||active)return;
    if(reduced()){
      await posterReady();root.dataset.sceneState='fallback';root.dataset.sceneMode='static';return;
    }
    try{
      narrow=innerWidth<768;
      if(!renderer)createScene();
      clock.progress=0;pose(0);renderer.render(scene,camera);
      if(renderer.info.render.calls===0)throw new Error('Empty scene');
      root.classList.add('hero-enhanced');
      active=true;root.dataset.sceneState='ready';root.dataset.sceneMode='3d';
      resizeRenderer();
      timeline=gsap.to(clock,{progress:1,duration:1,ease:'none',paused:true,onUpdate:render});
      trigger=ScrollTrigger.create({trigger:root,start:'top top',end:'bottom bottom',animation:timeline,scrub:narrow?.16:.32,invalidateOnRefresh:true,onRefresh:render,onToggle:render});
      root.querySelectorAll('.story-chapter').forEach(el=>el.style.willChange='transform, opacity');
      render();ScrollTrigger.refresh();
    }catch{releaseRenderer();await fallback('initialization');}
  }
  function contextLost(event){event.preventDefault();fallback('webgl-context');}
  function contextRestored(){if(disposed)return;releaseRenderer();failed=false;root.dataset.sceneState='loading';start();}
  function resize(){clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{narrow=innerWidth<768;resizeRenderer();trigger?.refresh();render();},180);}
  function visibility(){if(!document.hidden)render();}
  function motionChanged(){
    if(reduced()){stop();root.dataset.sceneState='fallback';root.dataset.sceneMode='static';}
    else start();
  }
  const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView){if(active)chapters.forEach(el=>el.style.willChange='transform, opacity');render();}else chapters.forEach(el=>el.style.removeProperty('will-change'));},{threshold:0});
  observer.observe(root);
  addEventListener('resize',resize,{passive:true});
  addEventListener('codeverse:motionchange',motionChanged);
  document.addEventListener('visibilitychange',visibility);
  function dispose(){
    if(disposed)return;stop();disposed=true;observer.disconnect();clearTimeout(resizeTimer);
    removeEventListener('resize',resize);removeEventListener('codeverse:motionchange',motionChanged);document.removeEventListener('visibilitychange',visibility);
    releaseRenderer();
  }
  addEventListener('pagehide',event=>{if(!event.persisted)dispose();});
  window.CodeVerseVault={get state(){return root.dataset.sceneState;},get progress(){return clock.progress;},dispose};
  await start();
}
