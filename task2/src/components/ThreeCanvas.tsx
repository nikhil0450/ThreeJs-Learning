import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import { useDrop } from 'react-dnd'
import { useState, useRef, useEffect } from 'react'
import * as THREE from 'three'
import React from 'react'
import { useFBXModel } from '../hooks/useFBXModel'

const MODEL_PATHS = {
  Chair: '/models/tshirt.FBX',
  Table: '/models/table.fbx',
  Lamp: '/models/Wolf.fbx'
}

const MODEL_HEIGHTS = {
  Box: 1,
  Sphere: 0.5,
  Cylinder: 1,
  Chair: 1.2,
  Table: 1.5,
  Lamp: 1.8
}

export default function ThreeCanvas() {
  const [objects, setObjects] = useState<any[]>([])
  const meshRefs = useRef<{ [id: string]: THREE.Object3D }>({})
  const floorRef = useRef<THREE.Mesh>(null)
  const { camera, scene } = useThree()

  const [, drop] = useDrop(() => ({
    accept: ['object', 'texture'],
    drop: (item: any, monitor) => {
      const type = monitor.getItemType()
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return

      // Convert mouse position to Three.js coordinates
      const mouse = new THREE.Vector2(
        (clientOffset.x / window.innerWidth) * 2 - 1,
        -(clientOffset.y / window.innerHeight) * 2 + 1
      )

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)

      // Check for intersections
      const intersects = raycaster.intersectObject(floorRef.current!)
      if (intersects.length === 0) return

      const point = intersects[0].point

      if (type === 'object') {
        const id = `${item.name}_${Date.now()}`

        // Check for object stacking
        const objectIntersects = raycaster.intersectObjects(
          Object.values(meshRefs.current).filter(Boolean),
          true
        )

        let yPosition = 0
        if (objectIntersects.length > 0) {
          const topIntersect = objectIntersects.reduce((prev, curr) => 
            prev.point.y > curr.point.y ? prev : curr
          )
          yPosition = topIntersect.point.y + (MODEL_HEIGHTS[item.name] || 0)
        }

        setObjects(prev => [...prev, {
          id,
          type: item.name,
          position: new THREE.Vector3(point.x, yPosition, point.z),
          texture: null
        }])
      }

      if (type === 'texture') {
        const objectIntersects = raycaster.intersectObjects(
          Object.values(meshRefs.current).filter(Boolean),
          true
        )
        if (objectIntersects.length > 0) {
          const topIntersect = objectIntersects[0]
          const objectId = getTopParent(topIntersect.object).userData?.id
          if (objectId) {
            setObjects(prev => prev.map(obj => 
              obj.id === objectId ? { ...obj, texture: item.src } : obj
            ))
          }
        }
      }
    }
  }))

  const getTopParent = (object: THREE.Object3D): THREE.Object3D => {
    let current = object
    while (current.parent && current.parent !== scene) {
      current = current.parent
    }
    return current
  }

  return (
    <div ref={drop} style={{ flex: 1, height: '100%' }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <OrbitControls makeDefault />

        {/* Floor */}
        <mesh
          ref={floorRef}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.5, 0]}
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#f0f0f0" />
        </mesh>

        {/* Objects */}
        {objects.map((obj) => (
          <SceneObject
            key={obj.id}
            id={obj.id}
            type={obj.type}
            position={obj.position}
            texture={obj.texture}
            ref={(ref) => {
              if (ref) {
                ref.userData.id = obj.id
                meshRefs.current[obj.id] = ref
              }
            }}
          />
        ))}
      </Canvas>
    </div>
  )
}

const SceneObject = React.forwardRef<
  THREE.Object3D,
  { id: string; type: string; position: THREE.Vector3; texture: string | null }
>(({ type, position, texture }, ref) => {
  const tex = texture ? useTexture(texture) : null

  // Handle FBX models
  if (MODEL_PATHS[type as keyof typeof MODEL_PATHS]) {
    const { model } = useFBXModel(
      MODEL_PATHS[type as keyof typeof MODEL_PATHS],
      0.5,
      position
    )
    return model ? <primitive object={model} ref={ref} /> : null
  }

  // Handle primitive objects
  let geometry
  switch (type) {
    case 'Box':
      geometry = <boxGeometry args={[1, 1, 1]} />
      break
    case 'Sphere':
      geometry = <sphereGeometry args={[0.5, 32, 32]} />
      break
    case 'Cylinder':
      geometry = <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
      break
    default:
      return null
  }

  return (
    <mesh
      position={position}
      ref={ref}
      castShadow
      receiveShadow
    >
      {geometry}
      <meshStandardMaterial map={tex || undefined} color={tex ? 'white' : '#888'} />
    </mesh>
  )
})