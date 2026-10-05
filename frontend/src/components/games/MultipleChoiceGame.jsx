import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles } from 'lucide-react';
import { speakPrompt } from '../../utils/speech';

export default function MultipleChoiceGame({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [flashVisible, setFlashVisible] = useState(true);
  const [subitizeTimer, setSubitizeTimer] = useState(1.5);

  const isSubitize = question.type === 'FLASH_SUBITIZE';
  const isPhonicBlend = question.type === 'PHONIC_BLEND';
  const isMissingVowel = question.type === 'MISSING_VOWEL';
  const isMagnitude = question.type === 'MAGNITUDE_BALANCE';
  const isSequenceGap = question.type === 'SEQUENCE_GAP';
  const isVisualArithmetic = question.type === 'VISUAL_ARITHMETIC';

  // Subitizing timer: hide dots after 1.5 seconds
  useEffect(() => {
    if (isSubitize) {
      setFlashVisible(true);
      const timer = setTimeout(() => {
        setFlashVisible(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [question.id, isSubitize]);

  const handleSelect = (option) => {
    setSelected(option);
    const isCorrect = String(option).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();
    
    // Slight pause for tactile feedback before advancing
    setTimeout(() => {
      onAnswer({
        userAnswer: option,
        correctAnswer: question.correctAnswer,
        isCorrect,
        reversalDetected: false,
        motorJitterScore: 0,
        magnitudeDistance: 0
      });
    }, 280);
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto' }}>
      
      {/* Visual Enhancers per Question Type */}
      {isPhonicBlend && (
        <div style={{ marginBottom: 24, padding: 18, background: 'rgba(99, 102, 241, 0.1)', borderRadius: 16 }}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 12 }}>Click to hear each sound:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {['/k/', '/æ/', '/t/'].map((sound, i) => (
              <button
                key={i}
                id={`blend-sound-${i}`}
                className="btn-audio"
                onClick={() => speakPrompt(sound === '/k/' ? 'k' : sound === '/æ/' ? 'a' : 't')}
                style={{ fontSize: '1.2rem', padding: '10px 18px' }}
              >
                <Volume2 size={18} /> {sound}
              </button>
            ))}
          </div>
        </div>
      )}

      {isMissingVowel && (
        <div style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          letterSpacing: '0.25em',
          color: '#fbbf24',
          margin: '20px 0',
          padding: '16px',
          background: 'rgba(251, 191, 36, 0.08)',
          borderRadius: 16
        }}>
          EL <span style={{ textDecoration: 'underline', color: '#60a5fa' }}>_</span> PHANT
        </div>
      )}

      {isSubitize && (
        <div style={{ margin: '20px 0' }}>
          {flashVisible ? (
            <div style={{
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              background: 'rgba(245, 158, 11, 0.12)',
              borderRadius: 20,
              border: '2px dashed #f59e0b',
              animation: 'pulseGlow 1s infinite alternate'
            }}>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    boxShadow: '0 0 15px #f59e0b'
                  }}
                />
              ))}
            </div>
          ) : (
            <div style={{
              height: 140,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 20,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Time is up! How many dots were there?</span>
              <span style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>Select your best estimate below:</span>
            </div>
          )}
        </div>
      )}

      {isMagnitude && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          margin: '20px 0'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            borderRadius: 16,
            padding: 16,
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h4 style={{ color: '#38bdf8', marginBottom: 12 }}>Basket A (Left)</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[...Array(8)].map((_, i) => (
                <span key={i} style={{ fontSize: '1.8rem' }}>🍎</span>
              ))}
            </div>
          </div>
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            borderRadius: 16,
            padding: 16,
            border: '2px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h4 style={{ color: '#38bdf8', marginBottom: 12 }}>Basket B (Right)</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ fontSize: '1.8rem' }}>🍎</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {isSequenceGap && (
        <div style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#34d399',
          margin: '24px 0',
          padding: 16,
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: 16
        }}>
          🐸 3 &nbsp;➜&nbsp; 6 &nbsp;➜&nbsp; 9 &nbsp;➜&nbsp; <span style={{ color: '#fbbf24', borderBottom: '3px solid #fbbf24' }}>?</span> &nbsp;➜&nbsp; 15
        </div>
      )}

      {isVisualArithmetic && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          margin: '20px 0',
          fontSize: '1.8rem',
          fontWeight: 700
        }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '12px 18px', borderRadius: 14 }}>
            <span>⭐⭐⭐⭐</span> (4)
          </div>
          <span style={{ color: '#fbbf24', fontSize: '2.2rem' }}>+</span>
          <div style={{ background: 'rgba(251, 191, 36, 0.15)', padding: '12px 18px', borderRadius: 14 }}>
            <span>⭐⭐⭐</span> (3)
          </div>
          <span style={{ color: '#94a3b8' }}>=</span>
          <span style={{ color: '#818cf8', fontSize: '2.2rem' }}>?</span>
        </div>
      )}

      {/* Options List */}
      <div className="choice-grid">
        {(question.options || []).map((opt, idx) => {
          const isChosen = selected === opt;
          return (
            <button
              id={`choice-btn-${idx}`}
              key={idx}
              className={`choice-btn ${isChosen ? 'selected' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
