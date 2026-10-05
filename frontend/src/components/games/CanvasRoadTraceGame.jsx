import React, { useRef, useState, useEffect } from 'react';

export default function CanvasRoadTraceGame({ question, onAnswer }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [samples, setSamples] = useState([]);
  const [progress, setProgress] = useState(0);

  // Define parametric winding centerline: x(t) = 60 + 360*t, y(t) = 130 + 65*sin(t*2*PI)
  const getCenterlinePoint = (t) => {
    const x = 50 + t * 380;
    const y = 130 + Math.sin(t * Math.PI * 2) * 55;
    return { x, y };
  };

  const drawBackgroundTrack = (ctx) => {
    ctx.clearRect(0, 0, 480, 260);

    // Draw wide river lane (width = 46)
    ctx.beginPath();
    ctx.lineWidth = 44;
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.2)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i <= 100; i++) {
      const { x, y } = getCenterlinePoint(i / 100);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw river borders
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.stroke();

    // Draw dotted centerline
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i <= 100; i++) {
      const { x, y } = getCenterlinePoint(i / 100);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Start Badge
    const startPt = getCenterlinePoint(0);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(startPt.x, startPt.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('START', startPt.x, startPt.y);

    // Finish Badge
    const endPt = getCenterlinePoint(1);
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(endPt.x, endPt.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('GOAL', endPt.x, endPt.y);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawBackgroundTrack(ctx);
  }, []);

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
    const coords = getCanvasCoords(e);
    setSamples([coords]);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    setSamples(prev => [...prev, coords]);

    // Draw user line
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#34d399';
    ctx.lineCap = 'round';
    ctx.arc(coords.x, coords.y, 2, 0, Math.PI * 2);
    ctx.fill();

    // Estimate progress towards goal
    const t = Math.min(1, Math.max(0, (coords.x - 50) / 380));
    setProgress(Math.round(t * 100));
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (samples.length < 5) return; // accidental click

    // Calculate kinematic path deviations (jitter/tremor score)
    let totalDeviation = 0;
    samples.forEach(pt => {
      // Find closest centerline point
      const t = Math.min(1, Math.max(0, (pt.x - 50) / 380));
      const center = getCenterlinePoint(t);
      const dist = Math.sqrt(Math.pow(pt.x - center.x, 2) + Math.pow(pt.y - center.y, 2));
      totalDeviation += dist;
    });

    const avgDeviation = Math.round((totalDeviation / samples.length) * 10) / 10;
    const reachedEnd = progress >= 75;

    onAnswer({
      userAnswer: `Completed with avg deviation ${avgDeviation}px (${reachedEnd ? 'Reached Goal' : 'Partial Path'})`,
      correctAnswer: 'Smooth centerline tracing <= 18px deviation',
      isCorrect: reachedEnd && avgDeviation <= 26.0,
      motorJitterScore: avgDeviation,
      reversalDetected: false,
      magnitudeDistance: 0
    });
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawBackgroundTrack(ctx);
    setSamples([]);
    setProgress(0);
  };

  return (
    <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
      <p style={{ color: '#cbd5e1', marginBottom: 12, fontSize: '0.95rem' }}>
        Click/touch and glide from <strong style={{ color: '#10b981' }}>START</strong> to <strong style={{ color: '#f59e0b' }}>GOAL</strong> along the river:
      </p>

      <div className="trace-canvas-container">
        <canvas
          id="road-trace-canvas"
          ref={canvasRef}
          width={480}
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
          Clear Canvas
        </button>
        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Path Progress: <strong style={{ color: '#34d399' }}>{progress}%</strong>
        </span>
        <button
          id="confirm-road-trace"
          className="btn-primary"
          onClick={handleEnd}
          disabled={samples.length < 5}
          style={{ opacity: samples.length < 5 ? 0.5 : 1, padding: '8px 18px', fontSize: '0.9rem' }}
        >
          Submit Path
        </button>
      </div>
    </div>
  );
}
