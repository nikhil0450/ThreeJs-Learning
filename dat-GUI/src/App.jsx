import { useEffect } from 'react';
import * as THREE from 'three';
import SceneInit from './lib/SceneInit';
import { GUI } from 'dat.gui';

function App() {
  useEffect(() => {
    const test = new SceneInit('myThreeJsCanvas');
    test.initialize();
    test.animate();

    // Red cube
    const boxGeometry = new THREE.BoxGeometry(1,1,1,1,1);
    const boxMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    test.scene.add(boxMesh);

    // Initialising GUI 
    const gui = new GUI();

    gui.add(boxMesh.rotation, 'x', 0, 10).name('Rotate X Axis');
    gui.add(boxMesh.rotation, 'y', 0, Math.PI).name('Rotate Y Axis');
    gui.add(boxMesh.rotation, 'z', 0, Math.PI).name('Rotate Z Axis');
    gui.add(boxMesh.scale, 'x', 0, 2).name('Scale X Axis');
    gui.add(boxMesh.scale, 'y', 0, 2).name('Scale Y Axis');
    gui.add(boxMesh.scale, 'z', 0, 2).name('Scale Z Axis');

    // Updating Material
    const materialParams = {
      boxMeshColor: boxMesh.material.color.getHex()
    }
    gui.add(boxMesh.material, 'wireframe')
    gui.addColor(materialParams, 'boxMeshColor').onChange((value)=> boxMesh.material.color.set(value))
  }, []);

  return (
    <div>
      <canvas id="myThreeJsCanvas" />
    </div>
  );
}

export default App;