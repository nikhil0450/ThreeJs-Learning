// src/components/ReplicatorPanel.tsx
import React from 'react';

interface Props {
  onReplicate: (dir: 'left' | 'right' | 'forward' | 'backward' | 'up' | 'down') => void;
}

const ReplicatorPanel: React.FC<Props> = ({ onReplicate }) => {
  return (
    <div style={{ width: 200, padding: 10, background: '#f0f0f0' }}>
      <h3>Replicate</h3>
      {['left', 'right', 'forward', 'backward', 'up', 'down'].map((dir) => (
        <button key={dir} onClick={() => onReplicate(dir as any)} style={{ display: 'block', margin: '5px 0' }}>
          {dir}
        </button>
      ))}
    </div>
  );
};

export default ReplicatorPanel;
