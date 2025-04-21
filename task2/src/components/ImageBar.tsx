import { useDrag } from 'react-dnd'

const TEXTURES = [
  { name: 'Wood', src: '/textures/wood.jpg' },
  { name: 'Metal', src: '/textures/metal.jpg' },
  { name: 'Fabric', src: '/textures/fabric.jpg' },
  { name: 'Marble', src: '/textures/marble.jpg' }
]

export default function ImageBar() {
  return (
    <div style={{
      width: '200px',
      padding: '16px',
      background: '#f0f0f0',
      height: '100%',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginTop: 0 }}>Textures</h3>
      {TEXTURES.map((texture) => (
        <DraggableTexture key={texture.name} texture={texture} />
      ))}
    </div>
  )
}

function DraggableTexture({ texture }: { texture: { name: string; src: string } }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'texture',
    item: { src: texture.src },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }))

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '8px',
        margin: '8px 0',
        background: '#fff',
        borderRadius: '4px',
        cursor: 'grab',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{texture.name}</div>
      <img 
        src={texture.src} 
        alt={texture.name}
        style={{ width: '100%', height: 'auto', marginTop: '8px' }}
      />
    </div>
  )
}