import { useEffect, useRef, useState } from 'react'
import { useFBX } from '@react-three/drei'
import * as THREE from 'three'

interface DraggableObject extends THREE.Group {
  userData: {
    draggable?: boolean
    name?: string
    baseHeight?: number
    totalHeight?: number
  }
}

export function useFBXModel(path: string, scale: number, position: THREE.Vector3) {
  const fbx = useFBX(path)
  const [model, setModel] = useState<DraggableObject | null>(null)
  const ref = useRef<DraggableObject>(null)

  useEffect(() => {
    if (!fbx) return

    const cloned = fbx.clone() as DraggableObject
    cloned.scale.set(scale, scale, scale)
    cloned.position.copy(position)

    // Enable shadows
    cloned.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    // Calculate dimensions
    const bbox = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    bbox.getSize(size)

    // Adjust position to sit on floor
    cloned.position.y = size.y / 2 * scale

    // Store metadata
    cloned.userData = {
      draggable: true,
      name: path.split('/').pop()?.replace('.fbx', '')?.toUpperCase() || 'MODEL',
      baseHeight: size.y / 2 * scale,
      totalHeight: size.y * scale
    }

    ref.current = cloned
    setModel(cloned)
  }, [fbx, scale, position, path])

  return { model, ref }
}