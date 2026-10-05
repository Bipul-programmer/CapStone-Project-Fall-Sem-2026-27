import React, { useState } from 'react';

export default function LetterMirrorGame({ question, onAnswer }) {
  const letters = question.payload?.letterGrid || ['b', 'd', 'b', 'p', 'q', 'b', 'd', 'b'];
  const [selectedIndices, setSelectedIndices] = useState(new Set());

  const toggleSelect = (idx) => {
    const updated = new Set(selectedIndices);
    if (updated.has(idx)) {
      updated.delete(idx);
    } else {
      updated.add(idx);
    }
    setSelectedIndices(updated);
  };

  const handleDone = () => {
    const targetIndices = question.payload?.targetIndices || [0, 2, 5, 7];
    const userSelected = Array.from(selectedIndices).sort();

    // Check if user selected any 'd' or 'p' or 'q' (reversal error)
    const reversalDetected = userSelected.some(idx => !targetIndices.includes(idx));
    
    // Check if user found all 'b's
    const missedTargets = targetIndices.some(idx => !selectedIndices.has(idx));
    const isCorrect = !reversalDetected && !missedTargets;

    onAnswer({
      userAnswer: userSelected.map(i => letters[i] + `[${i}]`).join(', ') || 'None selected',
      correctAnswer: targetIndices.map(i => letters[i] + `[${i}]`).join(', '),
      isCorrect,
      reversalDetected,
      motorJitterScore: 0,
      magnitudeDistance: 0
    });
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
      <p style={{ color: '#cbd5e1', marginBottom: 20, fontSize: '1.05rem' }}>
        Click on all boxes that display the letter <strong style={{ color: '#818cf8', fontSize: '1.4rem' }}>'b'</strong>.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 28
      }}>
        {letters.map((letter, idx) => {
          const isSelected = selectedIndices.has(idx);
          return (
            <button
              id={`letter-choice-${idx}`}
              key={idx}
              onClick={() => toggleSelect(idx)}
              style={{
                height: 90,
                fontSize: '2.5rem',
                fontWeight: 700,
                borderRadius: 16,
                background: isSelected ? 'rgba(99, 102, 241, 0.45)' : 'rgba(30, 41, 59, 0.8)',
                border: isSelected ? '3px solid #818cf8' : '2px solid rgba(255, 255, 255, 0.1)',
                color: isSelected ? '#ffffff' : '#e2e8f0',
                transform: isSelected ? 'scale(1.05)' : 'none',
                boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.5)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <button
        id="confirm-mirror-letters"
        className="btn-primary"
        onClick={handleDone}
        style={{ minWidth: 200 }}
      >
        Confirm Selection ({selectedIndices.size} selected)
      </button>
    </div>
  );
}
