// src/App.tsx
import React, { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ThreeCanvas from './components/ThreeCanvas';
import ReplicatorPanel from './components/ReplicatorPanel';
import * as THREE from 'three';

function App() {
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleReplicate = (dir: string) => {
    const selectedObj = objects.find(o => o.id === selectedId);
    if (!selectedObj) return;

    const pos = selectedObj.position.clone();
    const offset = 1.1;

    switch (dir) {
      case 'left': pos.x -= offset; break;
      case 'right': pos.x += offset; break;
      case 'forward': pos.z -= offset; break;
      case 'backward': pos.z += offset; break;
      case 'up': pos.y += offset; break;
      case 'down': pos.y -= offset; break;
    }

    if (Math.abs(pos.x) > 10 || Math.abs(pos.z) > 10 || pos.y < 0 || pos.y > 40) return;

    setObjects([...objects, {
      ...selectedObj,
      id: `${selectedObj.type}_${Date.now()}`,
      position: pos
    }]);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <ThreeCanvas
        objects={objects}
        setObjects={setObjects}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />
      <ReplicatorPanel onReplicate={handleReplicate} />
    </div>
  );
}

export default App;
