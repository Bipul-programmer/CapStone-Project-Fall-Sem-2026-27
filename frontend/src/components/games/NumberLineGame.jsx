import React, { useState } from 'react';

export default function NumberLineGame({ question, onAnswer }) {
  const [val, setVal] = useState(10); // default midpoint
  const minVal = question.payload?.minVal ?? 0;
  const maxVal = question.payload?.maxVal ?? 20;
  const target = question.payload?.targetNumber ?? 14;

  const handleConfirm = () => {
    const diff = Math.abs(val - target);
    const isCorrect = diff <= 2; // within reasonable clinical tolerance

    onAnswer({
      userAnswer: `Placed pin at ${val} (Offset: ${diff})`,
      correctAnswer: `Position ${target} on scale [${minVal}-${maxVal}]`,
      isCorrect,
      magnitudeDistance: diff,
      motorJitterScore: 0,
      reversalDetected: false
    });
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
      <p style={{ color: '#cbd5e1', marginBottom: 24, fontSize: '1.05rem' }}>
        Slide the car pin to where the number <strong style={{ color: '#fbbf24', fontSize: '1.6rem' }}>{target}</strong> belongs on the track:
      </p>

      {/* Visual Number Line Track */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 20,
        padding: '30px 24px 20px',
        marginBottom: 28,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Current Car Indicator */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          padding: '8px 16px',
          borderRadius: 12,
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '1.4rem',
          marginBottom: 16,
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
        }}>
          🚗 Selected: {val}
        </div>

        {/* Range Slider */}
        <input
          id="number-line-slider"
          type="range"
          min={minVal}
          max={maxVal}
          step="1"
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          style={{
            width: '100%',
            height: 12,
            borderRadius: 8,
            accentColor: '#f59e0b',
            cursor: 'pointer'
          }}
        />

        {/* Scale labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 12,
          color: '#94a3b8',
          fontWeight: 700,
          fontSize: '1.1rem'
        }}>
          <span>{minVal}</span>
          <span style={{ color: '#64748b' }}>{(minVal + maxVal) / 2}</span>
          <span>{maxVal}</span>
        </div>
      </div>

      <button
        id="confirm-number-line"
        className="btn-primary"
        onClick={handleConfirm}
        style={{ minWidth: 200 }}
      >
        Lock in Position ({val})
      </button>
    </div>
  );
}
