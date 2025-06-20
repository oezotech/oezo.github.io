import * as THREE from 'https://unpkg.com/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.getElementById('webgl');
const logo = document.getElementById('logo');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
scene.add(camera);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(0, 0, 5);
camera.add(directionalLight);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

const loader = new GLTFLoader();
let initialDistance = 0;

loader.load('assets/vr_headset.glb', (gltf) => {
  const model = gltf.scene;
  scene.add(model);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  const size = box.getSize(new THREE.Vector3());
  const modelHeight = size.y;
  const fov = camera.fov * Math.PI / 180;
  const targetFraction = 0.6;
  initialDistance = (modelHeight / 2) / Math.tan(fov / 2) / targetFraction;

  camera.position.set(0, 0, initialDistance);
  camera.lookAt(0, 0, 0);

  startAnimationTimeline();
}, undefined, (err) => console.error(err));

let startTime = null;
function animate(ts) {
  if (!startTime) startTime = ts;
  const elapsed = ts - startTime;

  if (elapsed >= 3000 && elapsed < 4000) {
    const t = (elapsed - 3000) / 1000;
    const rot = t * Math.PI;
    scene.traverse((o) => { if (o.isMesh) o.rotation.y = rot; });
  } else if (elapsed >= 4000 && elapsed < 7000) {
    const t = (elapsed - 4000) / 3000;
    const finalDist = initialDistance * 0.1;
    camera.position.z = initialDistance - (initialDistance - finalDist) * t;
    camera.lookAt(0, 0, 0);
  } else if (elapsed >= 7000) {
    camera.position.z = initialDistance * 0.1;
    camera.lookAt(0, 0, 0);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function startAnimationTimeline() {
  setTimeout(() => logo.style.opacity = '1', 100);
  setTimeout(() => canvas.style.opacity = '1', 1000);
  setTimeout(() => logo.style.opacity = '0', 2000);
  setTimeout(() => requestAnimationFrame(animate), 3000);
}
