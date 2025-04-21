// src/ThreeCanvas.tsx
import React, { useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useDrop } from 'react-dnd';
import * as THREE from 'three';
import SceneObject from './SceneObject';

interface ObjectType {
  id: string;
  type: string;
  position: THREE.Vector3;
  texture: string | null;
}

interface Props {
  objects: ObjectType[];
  setObjects: React.Dispatch<React.SetStateAction<ObjectType[]>>;
  selectedId: string | null;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
}

const ThreeCanvas: React.FC<Props> = ({
  objects,
  setObjects,
  selectedId,
  setSelectedId,
}) => {
  const floorRef = useRef<THREE.Mesh>(null);
  const meshRefs = useRef<Record<string, THREE.Mesh | THREE.Group>>({});
  const canvasRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.Camera>();

  // Drop handler
  const [, drop] = useDrop(() => ({
    accept: ['object'],
    drop: (item: any, monitor) => {
      const type = monitor.getItemType();
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !canvasRef.current || !cameraRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((clientOffset.x - rect.left) / rect.width) * 2 - 1;
      const y = -((clientOffset.y - rect.top) / rect.height) * 2 + 1;

      const mouse = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObject(floorRef.current!);
      if (intersects.length === 0) return;

      const point = intersects[0].point;
      const newObj = {
        id: `${item.name}_${Date.now()}`,
        type: item.name,
        position: new THREE.Vector3(point.x, 0.5, point.z),
        texture: null,
      };

      setObjects((prev) => [...prev, newObj]);
    },
  }));

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds || !cameraRef.current) return;

    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

    const mouse = new THREE.Vector2(x, y);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    for (const [id, ref] of Object.entries(meshRefs.current)) {
      const intersects = raycaster.intersectObject(ref, true);
      if (intersects.length > 0) {
        setSelectedId(id);
        return;
      }
    }

    setSelectedId(null);
  };

  return (
    <div
      ref={(node) => {
        drop(node);
        canvasRef.current = node;
      }}
      style={{ flex: 1, height: '100vh', position: 'relative' }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
        onPointerDown={handlePointerDown}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <OrbitControls />

        <mesh
          ref={floorRef}
          position={[0, 0, 0]}
          receiveShadow
          userData={{ ground: true }}
        >
          <boxGeometry args={[20, 0.01, 20]} />
          <meshStandardMaterial color="goldenrod" />
        </mesh>

        {objects.map((obj) => (
          <SceneObject
            key={obj.id}
            {...obj}
            ref={(ref) => {
              if (ref) meshRefs.current[obj.id] = ref;
            }}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default ThreeCanvas;
