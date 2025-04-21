// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { useDrag } from 'react-dnd';

const textures = []; // Empty for now or add textures

const objects = ['Box', 'Sphere', 'Cylinder', 'Tshirt', 'Table', 'House'];

const Sidebar = () => {
  const [showObjects, setShowObjects] = useState(true);

  return (
    <div style={{ width: '200px', padding: '10px', background: '#eee' }}>
      <h3>Objects</h3>
      {showObjects && (
        <>
          {objects.map((obj) => (
            <DraggableObject key={obj} name={obj} />
          ))}
        </>
      )}
    </div>
  );
};

export default Sidebar;

function DraggableObject({ name }: { name: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'object',
    item: { name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        padding: '8px',
        background: '#ddd',
        borderRadius: '4px',
        marginBottom: '8px',
        textAlign: 'center',
      }}
    >
      {name}
    </div>
  );
}
