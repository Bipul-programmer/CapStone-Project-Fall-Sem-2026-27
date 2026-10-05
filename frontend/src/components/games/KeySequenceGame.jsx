import React, { useState } from 'react';

export default function KeySequenceGame({ question, onAnswer }) {
  const targetSeq = question.payload?.targetSequence || ['RED', 'BLUE', 'YELLOW', 'GREEN'];
  const [tappedSeq, setTappedSeq] = useState([]);
  const [hesitationTaps, setHesitationTaps] = useState(0);

  const colors = [
    { name: 'RED', bg: '#ef4444', label: 'Red' },
    { name: 'BLUE', bg: '#3b82f6', label: 'Blue' },
    { name: 'YELLOW', bg: '#eab308', label: 'Yellow' },
    { name: 'GREEN', bg: '#22c55e', label: 'Green' }
  ];

  const handleTap = (colorName) => {
    const nextIdx = tappedSeq.length;
    const isTargetMatch = targetSeq[nextIdx] === colorName;
    if (!isTargetMatch) {
      setHesitationTaps(prev => prev + 1);
    }

    const updated = [...tappedSeq, colorName];
    setTappedSeq(updated);

    if (updated.length === targetSeq.length) {
      // Completed sequence
      const isCorrect = updated.every((col, idx) => col === targetSeq[idx]);
      setTimeout(() => {
        onAnswer({
          userAnswer: updated.join(' ➜ '),
          correctAnswer: targetSeq.join(' ➜ '),
          isCorrect,
          motorJitterScore: hesitationTaps * 4.0,
          reversalDetected: false,
          magnitudeDistance: 0
        });
      }, 400);
    }
  };

  const handleReset = () => {
    setTappedSeq([]);
    setHesitationTaps(0);
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
      <div style={{
        marginBottom: 20,
        padding: 14,
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
      }}>
        <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Target Order:</span>
        {targetSeq.map((col, idx) => (
          <span
            key={idx}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              background: col === 'RED' ? '#ef4444' : col === 'BLUE' ? '#3b82f6' : col === 'YELLOW' ? '#eab308' : '#22c55e',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            {col}
          </span>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        marginBottom: 24
      }}>
        {colors.map((c) => (
          <button
            id={`color-key-${c.name.toLowerCase()}`}
            key={c.name}
            onClick={() => handleTap(c.name)}
            disabled={tappedSeq.length >= targetSeq.length}
            style={{
              height: 100,
              borderRadius: 18,
              background: c.bg,
              color: '#ffffff',
              fontSize: '1.4rem',
              fontWeight: 800,
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
              transition: 'transform 0.1s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-secondary" onClick={handleReset} style={{ fontSize: '0.85rem' }}>
          Reset
        </button>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Tapped: {tappedSeq.length > 0 ? tappedSeq.join(' ➜ ') : 'None yet'}
        </div>
      </div>
    </div>
  );
}
