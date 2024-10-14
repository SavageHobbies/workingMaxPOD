import React from 'react';
import './GeneratedMockups.css';

function GeneratedMockups({ mockups }) {
  return (
    <div className="generated-mockups">
      <h2>Generated Mockups</h2>
      <div className="mockup-grid">
        {mockups.map((mockup) => (
          <div key={mockup.id} className="mockup-item">
            <img src={mockup.thumbnailUrl} alt={`Mockup ${mockup.id}`} className="mockup-image" />
            <p>Template: {mockup.templateName}</p>
            <p>Design: {mockup.designName}</p>
            <button onClick={() => console.log('Select mockup', mockup.id)}>Select</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GeneratedMockups;
