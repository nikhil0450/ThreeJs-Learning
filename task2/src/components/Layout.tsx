import ImageBar from './ImageBar'
import ObjectsBar from './ObjectsBar'
import ThreeCanvas from './ThreeCanvas'

export default function Layout() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <div style={{ width: '200px', borderRight: '1px solid #ddd' }}>
        <ImageBar />
      </div>
      
      <div style={{ flex: 1 }}>
        <ThreeCanvas />
      </div>
      
      <div style={{ width: '200px', borderLeft: '1px solid #ddd' }}>
        <ObjectsBar />
      </div>
    </div>
  )
}