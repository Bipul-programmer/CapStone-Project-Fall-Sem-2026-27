import React, { useRef, useState, useEffect } from 'react';

export default function CanvasLetterTraceGame({ question, onAnswer }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokePoints, setStrokePoints] = useState([]);
  const [hitCheckpoints, setHitCheckpoints] = useState([false, false, false]);

  const checkpoints = [
    { x: 270, y: 70, label: '1. Top' },
    { x: 230, y: 130, label: '2. Center' },
    { x: 190, y: 200, label: '3. Bottom' }
  ];

  const drawLetterTemplate = (ctx, hits) => {
    ctx.clearRect(0, 0, 460, 260);

    // Draw faint cursive 'S' background outline
    ctx.font = 'bold 180px Georgia, serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 230, 130);

    // Draw letter stroke guideline
    ctx.beginPath();
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
    ctx.lineCap = 'round';
    ctx.moveTo(270, 70);
    ctx.bezierCurveTo(230, 40, 180, 80, 230, 130);
    ctx.bezierCurveTo(280, 180, 230, 230, 180, 200);
    ctx.stroke();

    // Draw checkpoints
    checkpoints.forEach((cp, idx) => {
      const isHit = hits[idx];
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = isHit ? '#10b981' : 'rgba(255, 255, 255, 0.2)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isHit ? '#34d399' : '#94a3b8';
      ctx.stroke();

      ctx.fillStyle = isHit ? '#ffffff' : '#cbd5e1';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(String(idx + 1), cp.x, cp.y + 4);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawLetterTemplate(ctx, hitCheckpoints);
  }, [hitCheckpoints]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const handleStart = (e) => {
    setIsDrawing(true);
    const pt = getCanvasCoords(e);
    setStrokePoints([pt]);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const pt = getCanvasCoords(e);
    setStrokePoints(prev => [...prev, pt]);

    // Draw brush
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#60a5fa';
    ctx.fill();

    // Check collision with checkpoints
    const updated = [...hitCheckpoints];
    checkpoints.forEach((cp, idx) => {
      const dist = Math.hypot(pt.x - cp.x, pt.y - cp.y);
      if (dist < 26) {
        updated[idx] = true;
      }
    });

    if (updated.some((val, idx) => val !== hitCheckpoints[idx])) {
      setHitCheckpoints(updated);
    }
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const allPassed = hitCheckpoints.every(Boolean);
    const passedCount = hitCheckpoints.filter(Boolean).length;
    const jitter = strokePoints.length > 10 ? 12.0 : 25.0;

    onAnswer({
      userAnswer: `Passed ${passedCount}/3 Letter S Checkpoints`,
      correctAnswer: 'Passed 3/3 Checkpoints with smooth curve',
      isCorrect: allPassed,
      motorJitterScore: jitter,
      reversalDetected: false,
      magnitudeDistance: 0
    });
  };

  const handleReset = () => {
    setHitCheckpoints([false, false, false]);
    setStrokePoints([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      drawLetterTemplate(ctx, [false, false, false]);
    }
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
      <p style={{ color: '#cbd5e1', marginBottom: 12, fontSize: '0.95rem' }}>
        Trace over the letter <strong style={{ color: '#60a5fa' }}>'S'</strong>, touching checkpoint 1, then 2, then 3:
      </p>

      <div className="trace-canvas-container">
        <canvas
          id="letter-trace-canvas"
          ref={canvasRef}
          width={460}
          height={260}
          className="canvas-element"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <button className="btn-secondary" onClick={handleReset} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
          Clear
        </button>
        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Checkpoints: <strong style={{ color: '#34d399' }}>{hitCheckpoints.filter(Boolean).length} / 3</strong>
        </span>
        <button
          id="confirm-letter-trace"
          className="btn-primary"
          onClick={handleEnd}
          style={{ padding: '8px 18px', fontSize: '0.9rem' }}
        >
          Submit Letter Trace
        </button>
      </div>
    </div>
  );
}
