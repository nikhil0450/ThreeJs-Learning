import { useDrag } from 'react-dnd'

const PRIMITIVE_OBJECTS = ['Box', 'Sphere', 'Cylinder']
const CUSTOM_OBJECTS = ['Chair', 'Table', 'Lamp']

export default function ObjectsBar() {
  return (
    <div style={{
      width: '200px',
      padding: '16px',
      background: '#f8f8f8',
      height: '100%',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginTop: 0 }}>Primitives</h3>
      {PRIMITIVE_OBJECTS.map((name) => (
        <DraggableObject key={name} name={name} />
      ))}

      <h3>Custom Models</h3>
      {CUSTOM_OBJECTS.map((name) => (
        <DraggableObject key={name} name={name} />
      ))}
    </div>
  )
}

function DraggableObject({ name }: { name: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'object',
    item: { name },
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
      {name}
    </div>
  )
}