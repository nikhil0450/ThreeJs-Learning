import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

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
  );
  floor.position.set(0, -1, 3);
  floor.receiveShadow = true;
  floor.userData.ground = true;
  scene.add(floor);
}

// OBJECT CREATION
function createObject(geometry, material, position, name) {
  const object = new THREE.Mesh(geometry, material);
  object.position.copy(position);
  object.castShadow = true;
  object.receiveShadow = true;
  object.userData.draggable = true;
  object.userData.name = name;
  scene.add(object);
  return object;
}

function createBox() {
  return createObject(
    new THREE.BoxGeometry(6, 6, 6),
    new THREE.MeshPhongMaterial({ color: 0xdc143c }),
    new THREE.Vector3(15, 3, 15),
    'BOX'
  );
}

function createSphere() {
  return createObject(
    new THREE.SphereGeometry(4, 32, 32),
    new THREE.MeshPhongMaterial({ color: 0x43a1f4 }),
    new THREE.Vector3(15, 4, -15),
    'SPHERE'
  );
}

function createCylinder() {
  return createObject(
    new THREE.CylinderGeometry(4, 4, 6, 32),
    new THREE.MeshPhongMaterial({ color: 0x90ee90 }),
    new THREE.Vector3(-15, 3, 15),
    'CYLINDER'
  );
}

function createCastle() {
  const objLoader = new OBJLoader();
  objLoader.load('./castle.obj', (group) => {
    const castle = group.children[0];
    castle.position.set(-15, 0, -15);
    castle.scale.set(5, 5, 5);
    castle.castShadow = true;
    castle.receiveShadow = true;
    castle.userData.draggable = true;
    castle.userData.name = 'CASTLE';
    scene.add(castle);
  });
}

// DRAG & DROP
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let draggable: THREE.Object3D | null = null;

window.addEventListener('pointerdown', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0 && intersects[0].object.userData.draggable) {
    draggable = intersects[0].object;
    controls.enableRotate = false; // Disable rotation when dragging
  }
});

window.addEventListener('pointermove', (event) => {
  if (!draggable) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  for (let i = 0; i < intersects.length; i++) {
    if (intersects[i].object.userData.ground) {
      draggable.position.x = intersects[i].point.x;
      draggable.position.z = intersects[i].point.z;
      break;
    }
  }
});

window.addEventListener('pointerup', () => {
  if (draggable) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    let highestY = -Infinity;
    let targetObject: THREE.Object3D | null = null;

    for (const hit of intersects) {
      if (hit.object !== draggable && hit.object.userData.draggable) {
        const boundingBox = new THREE.Box3().setFromObject(hit.object);
        if (boundingBox.max.y > highestY) {
          highestY = boundingBox.max.y;
          targetObject = hit.object;
        }
      }
    }

    if (targetObject) {
      // STACKING ON OBJECT
      const targetBox = new THREE.Box3().setFromObject(targetObject);
      const draggableBox = new THREE.Box3().setFromObject(draggable);
      draggable.position.y = targetBox.max.y + draggableBox.getSize(new THREE.Vector3()).y / 2;
    } else {
      // Ensure we calculate the bounding box correctly, even for groups like the castle
      const boundingBox = new THREE.Box3();
      boundingBox.setFromObject(draggable);

      // Calculate correct height
      const objectHeight = boundingBox.getSize(new THREE.Vector3()).y;

      // Set position correctly to sit on the floor
      draggable.position.y = objectHeight / 2;

    }

    controls.enableRotate = true; // Re-enable rotation after drop
    draggable = null;
  }
});

// INITIALIZATION
createFloor();
createBox();
createSphere();
createCylinder();
createCastle();

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
