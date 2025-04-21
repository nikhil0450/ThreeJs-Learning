// src/hooks/useFBXModel.ts
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/Addons.js';

export function useFBXModel(path: string, position: THREE.Vector3) {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const ref = useRef<THREE.Group>(null);

  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(path, (fbx) => {
      // Scale model to fit within a consistent size
      const box = new THREE.Box3().setFromObject(fbx);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 1.5;
      const scale = targetSize / maxDim;
      fbx.scale.setScalar(scale);

      // Get bounding box again after scaling
      const scaledBox = new THREE.Box3().setFromObject(fbx);
      const height = scaledBox.max.y - scaledBox.min.y;

      // Move model so it sits on the ground (base aligned to y=0)
      fbx.position.setY(-scaledBox.min.y);

      // Wrap model in a group for positioning
      const wrapper = new THREE.Group();
      wrapper.position.copy(position);
      wrapper.add(fbx);

      wrapper.userData = {
        draggable: true,
        type: 'fbx',
        baseHeight: height,
        totalHeight: height,
      };

      ref.current = wrapper;
      setModel(wrapper);
    });
  }, [path, position]);

  return { model, ref };
}
