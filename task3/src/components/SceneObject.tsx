// src/components/SceneObject.tsx
import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFBXModel } from './useFBXModel';

const MODEL_PATHS: Record<string, string> = {
  Tshirt: '/models/tshirt.FBX',
  Table: '/models/table.fbx',
  House: '/models/fbxHouse.fbx',
};

interface Props {
  id: string;
  type: string;
  position: THREE.Vector3;
  texture: string | null;
}

const SceneObject = React.forwardRef<THREE.Mesh | THREE.Group, Props>(
  ({ id, type, position, texture }, ref) => {
    const [appliedTexture, setAppliedTexture] = useState<string | null>(texture);

    if (MODEL_PATHS[type]) {
      const { model, ref: groupRef } = useFBXModel(MODEL_PATHS[type], position);

      useEffect(() => {
        if (ref && groupRef.current) {
          if (typeof ref === 'function') ref(groupRef.current);
          else (ref as any).current = groupRef.current;
        }

        if (appliedTexture && model) {
          const loader = new THREE.TextureLoader();
          loader.load(appliedTexture, (texture) => {
            model.traverse((child) => {
              if ((child as any).isMesh) {
                (child as any).material = new THREE.MeshStandardMaterial({
                  map: texture,
                  color: 0xffffff,
                });
              }
            });
          });
        }
      }, [model, appliedTexture, ref]);

      return model ? <primitive object={model} /> : null;
    }

    return (
      <mesh
        ref={ref as any}
        castShadow
        receiveShadow
        position={[position.x, position.y, position.z]}
        userData={{
          draggable: true,
          name: type,
          baseHeight: type === 'Sphere' ? 0.5 : 0.5,
          totalHeight: type === 'Sphere' ? 1 : 1,
          type: 'primitive',
        }}
      >
        {type === 'Box' ? (
          <boxGeometry args={[1, 1, 1]} />
        ) : type === 'Sphere' ? (
          <sphereGeometry args={[0.5, 32, 32]} />
        ) : (
          <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
        )}
        <meshStandardMaterial
          color="white"
          {...(appliedTexture
            ? { map: new THREE.TextureLoader().load(appliedTexture) }
            : {})}
        />
      </mesh>
    );
  }
);

export default SceneObject;
