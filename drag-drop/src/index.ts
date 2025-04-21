import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

// Type declarations for objects with userData
interface DraggableObject extends THREE.Object3D {
  userData: {
    draggable?: boolean;
    name?: string;
    baseHeight?: number;
    height?: number;
    yOffset?: number;
    totalHeight?: number;
    ground?: boolean;
  };
}

// CAMERA
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1500);
camera.position.set(-35, 70, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(-30, 50, -30);
dirLight.castShadow = true;
scene.add(dirLight);

// FLOOR
function createFloor() {
  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(100, 2, 100),
    new THREE.MeshPhongMaterial({ color: 0xf9c834 })
  ) as DraggableObject;
  floor.position.set(0, -1, 3);
  floor.receiveShadow = true;
  floor.userData.ground = true;
  scene.add(floor);
}

// OBJECT CREATION - Stores base height for stacking logic
function createObject(geometry: THREE.BufferGeometry, material: THREE.Material, position: THREE.Vector3, name: string): DraggableObject {
  const object = new THREE.Mesh(geometry, material) as DraggableObject;
  object.position.copy(position);
  object.castShadow = true;
  object.receiveShadow = true;
  object.userData.draggable = true;
  object.userData.name = name;

  // Compute bounding box for stacking
  const bbox = new THREE.Box3().setFromObject(object);
  object.userData.baseHeight = (bbox.max.y - bbox.min.y) / 2;

  scene.add(object);
  return object;
}

function createBox(): DraggableObject {
  return createObject(
    new THREE.BoxGeometry(6, 6, 6),
    new THREE.MeshPhongMaterial({ color: 0xdc143c }),
    new THREE.Vector3(15, 3, 15),
    'BOX'
  );
}

function createSphere(): DraggableObject {
  return createObject(
    new THREE.SphereGeometry(4, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0x43a1f4 }),
    new THREE.Vector3(15, 4, -15),
    'SPHERE'
  );
}

function createCylinder(): DraggableObject {
  return createObject(
    new THREE.CylinderGeometry(4, 4, 6, 32),
    new THREE.MeshPhongMaterial({ color: 0x90ee90 }),
    new THREE.Vector3(-15, 3, 15),
    'CYLINDER'
  );
}

function createWolf() {
  const fbxLoader = new FBXLoader();
  fbxLoader.load('./tshirt.FBX', (wolf: THREE.Group) => {
    // First add to scene to calculate proper bounding box
    scene.add(wolf);
    
    // Set scale and reset rotation
    wolf.scale.set(0.25, 0.25, 0.25);
    wolf.rotation.set(0, 0, 0);

    // Compute bounding box after adding to scene
    const bbox = new THREE.Box3().setFromObject(wolf);
    const size = bbox.getSize(new THREE.Vector3());
    
    // Position wolf so its feet touch the ground
    wolf.position.set(-15, 0, -15);

    // Enable shadows
    wolf.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Store important dimensions
    const draggableWolf = wolf as DraggableObject;
    draggableWolf.userData.draggable = true;
    draggableWolf.userData.name = 'WOLF';
    draggableWolf.userData.baseHeight = 0; // Height from center to bottom
    draggableWolf.userData.totalHeight = size.y; // Full height of wolf
  });
}

// DRAG & DROP
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let draggable: DraggableObject | null = null;
let offset = new THREE.Vector3();

function getTopParent(object: THREE.Object3D): DraggableObject {
  let current = object;
  while (current.parent && current.parent !== scene) {
    current = current.parent;
  }
  return current as DraggableObject;
}

window.addEventListener('pointerdown', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const topParent = getTopParent(intersects[0].object);
    if (topParent.userData.draggable) {
      draggable = topParent;
      controls.enabled = false;
      offset.copy(intersects[0].point).sub(draggable.position);
      offset.y = 0;
    }
  }
});

window.addEventListener('pointermove', (event) => {
  if (!draggable) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  for (let i = 0; i < intersects.length; i++) {
    const intersect = intersects[i];
    const obj = getTopParent(intersect.object);
    if (obj.userData.ground) {
      draggable.position.x = intersect.point.x - offset.x;
      draggable.position.z = intersect.point.z - offset.z;
      break;
    }
  }
});

window.addEventListener('pointerup', () => {
  if (!draggable) return;

  const bbox = new THREE.Box3().setFromObject(draggable);
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  raycaster.set(new THREE.Vector3(center.x, 1000, center.z), new THREE.Vector3(0, -1, 0));
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  const validIntersects = intersects.filter(intersect => {
    const obj = getTopParent(intersect.object);
    return obj !== draggable && !obj.userData.ground;
  });

  if (validIntersects.length > 0) {
    const highestIntersect = validIntersects.reduce((prev, current) => 
      prev.point.y > current.point.y ? prev : current
    );
    draggable.position.y = highestIntersect.point.y + (draggable.userData.baseHeight || 0);
  } else {
    draggable.position.y = draggable.userData.baseHeight || 0;
  }

  controls.enabled = true;
  draggable = null;
});

// Initialize scene
createFloor();
createBox();
createSphere();
createCylinder();
createWolf();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();