import React from 'react';
import { useDrag } from 'react-dnd';

const items = [
  { type: 'box' },
  { type: 'sphere' },
  { type: 'cylinder' }
];

export default function ObjectBar() {
  return (
    <div style={{ width: 150, background: '#eee', padding: 10 }}>
      <h4>Objects</h4>
      {items.map((item, i) => (
        <DraggableItem key={i} type={item.type} />
      ))}
    </div>
  );
}

function DraggableItem({ type }: { type: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'object',
    item: { type },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        border: '1px solid #aaa',
        padding: '8px',
        marginBottom: '8px',
        cursor: 'move'
      }}
    >
      {type.toUpperCase()}
    </div>
  );
}