import React, { useState } from 'react';

export default function DotConnectGame({ question, onAnswer }) {
  const points = question.payload?.points || [
    { id: 1, x: 230, y: 40, label: '1' },
    { id: 2, x: 380, y: 130, label: '2' },
    { id: 3, x: 320, y: 250, label: '3' },
    { id: 4, x: 140, y: 250, label: '4' },
    { id: 5, x: 80, y: 130, label: '5' }
  ];

  const [connectedOrder, setConnectedOrder] = useState([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [errorCount, setErrorCount] = useState(0);

  const handlePointClick = (pt) => {
    if (connectedOrder.includes(pt.id)) return; // Already tapped

    if (pt.id === nextExpected) {
      const newOrder = [...connectedOrder, pt.id];
      setConnectedOrder(newOrder);
      setNextExpected(nextExpected + 1);

      if (newOrder.length === points.length) {
        // All connected!
        setTimeout(() => {
          onAnswer({
            userAnswer: `Connected sequence: ${newOrder.join('➜')}`,
            correctAnswer: 'Sequence 1➜2➜3➜4➜5',
            isCorrect: errorCount === 0,
            motorJitterScore: errorCount * 5.0,
            reversalDetected: false,
            magnitudeDistance: 0
          });
        }, 500);
      }
    } else {
      // Out of order tap (motor targeting / sequential error)
      setErrorCount(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setConnectedOrder([]);
    setNextExpected(1);
    setErrorCount(0);
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
      <p style={{ color: '#cbd5e1', marginBottom: 12, fontSize: '0.95rem' }}>
        Click the star dots in sequential order: <strong style={{ color: '#38bdf8' }}>1 ➜ 2 ➜ 3 ➜ 4 ➜ 5</strong>:
      </p>

      {/* SVG Canvas for connecting lines */}
      <div style={{
        position: 'relative',
        width: 460,
        height: 300,
        margin: '0 auto',
        background: 'rgba(15, 23, 42, 0.7)',
        borderRadius: 20,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <svg width="460" height="300" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Draw connecting lines */}
          {connectedOrder.map((ptId, idx) => {
            if (idx === 0) return null;
            const prevPt = points.find(p => p.id === connectedOrder[idx - 1]);
            const currPt = points.find(p => p.id === ptId);
            return (
              <line
                key={idx}
                x1={prevPt.x}
                y1={prevPt.y}
                x2={currPt.x}
                y2={currPt.y}
                stroke="#34d399"
                strokeWidth="4"
                strokeDasharray="4 2"
              />
            );
          })}
        </svg>

        {/* Render interactive dots */}
        {points.map((pt) => {
          const isConnected = connectedOrder.includes(pt.id);
          const isNext = pt.id === nextExpected;

          return (
            <button
              id={`dot-btn-${pt.id}`}
              key={pt.id}
              onClick={() => handlePointClick(pt)}
              style={{
                position: 'absolute',
                left: pt.x - 24,
                top: pt.y - 24,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: isConnected
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : isNext
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : 'rgba(30, 41, 59, 0.9)',
                border: isNext ? '3px solid #a5b4fc' : '2px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isNext ? '0 0 20px #6366f1' : '0 4px 8px rgba(0,0,0,0.3)',
                transform: isNext ? 'scale(1.15)' : 'none',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
            >
              {pt.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <button className="btn-secondary" onClick={handleReset} style={{ fontSize: '0.85rem' }}>
          Reset Dots
        </button>
        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Tapped: <strong style={{ color: '#34d399' }}>{connectedOrder.length} / 5</strong>
          {errorCount > 0 && <span style={{ color: '#f87171', marginLeft: 8 }}>({errorCount} mis-targets)</span>}
        </span>
      </div>
    </div>
  );
}
