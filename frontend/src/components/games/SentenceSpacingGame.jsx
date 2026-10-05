import React, { useState } from 'react';

export default function SentenceSpacingGame({ question, onAnswer }) {
  const initialPool = question.payload?.scrambledWords || ['brown', 'The', 'happy', 'dog', 'is'];
  const [availableWords, setAvailableWords] = useState(initialPool);
  const [placedWords, setPlacedWords] = useState([]);

  const addWord = (word, index) => {
    setPlacedWords([...placedWords, word]);
    setAvailableWords(availableWords.filter((_, i) => i !== index));
  };

  const removeWord = (word, index) => {
    setAvailableWords([...availableWords, word]);
    setPlacedWords(placedWords.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setAvailableWords(initialPool);
    setPlacedWords([]);
  };

  const handleConfirm = () => {
    const constructed = placedWords.join(' ');
    const target = question.payload?.correctSentence || 'The brown dog is happy';
    const isCorrect = constructed.trim().toLowerCase() === target.trim().toLowerCase();

    onAnswer({
      userAnswer: constructed || 'Empty sentence',
      correctAnswer: target,
      isCorrect,
      reversalDetected: false,
      motorJitterScore: isCorrect ? 0 : 15.0,
      magnitudeDistance: 0
    });
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto' }}>
      <p style={{ color: '#cbd5e1', marginBottom: 16, fontSize: '1rem' }}>
        Tap the words below in order to build the sentence on the notebook line:
      </p>

      {/* Ruled Notebook Line Area */}
      <div style={{
        minHeight: 90,
        background: 'rgba(30, 41, 59, 0.6)',
        borderRadius: 16,
        padding: '16px 20px',
        borderBottom: '4px solid #6366f1',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        position: 'relative'
      }}>
        {placedWords.length === 0 ? (
          <span style={{ color: '#64748b', fontStyle: 'italic' }}>Words will line up here as you tap them...</span>
        ) : (
          placedWords.map((word, idx) => (
            <button
              id={`placed-word-${idx}`}
              key={idx}
              onClick={() => removeWord(word, idx)}
              style={{
                background: 'rgba(99, 102, 241, 0.3)',
                border: '1px solid #818cf8',
                borderRadius: 10,
                color: '#ffffff',
                padding: '8px 16px',
                fontSize: '1.2rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {word} <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>✕</span>
            </button>
          ))
        )}
      </div>

      {/* Available Word Bank */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
        marginBottom: 28
      }}>
        {availableWords.map((word, idx) => (
          <button
            id={`pool-word-${idx}`}
            key={idx}
            onClick={() => addWord(word, idx)}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 12,
              padding: '12px 20px',
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#cbd5e1',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
              transition: 'all 0.15s ease'
            }}
          >
            {word}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
        <button className="btn-secondary" onClick={handleReset}>
          Reset Words
        </button>
        <button
          id="confirm-sentence"
          className="btn-primary"
          onClick={handleConfirm}
          disabled={placedWords.length === 0}
        >
          Confirm Sentence ({placedWords.length}/{initialPool.length})
        </button>
      </div>
    </div>
  );
}
