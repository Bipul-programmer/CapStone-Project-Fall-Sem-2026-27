import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, BookOpen, PenTool, Calculator, Loader2, CheckCheck } from 'lucide-react';
import { speakPrompt, stopSpeech, getSelectedVoiceName } from '../utils/speech';

import LetterMirrorGame      from './games/LetterMirrorGame';
import CanvasRoadTraceGame   from './games/CanvasRoadTraceGame';
import CanvasLetterTraceGame from './games/CanvasLetterTraceGame';
import SentenceSpacingGame   from './games/SentenceSpacingGame';
import DotConnectGame        from './games/DotConnectGame';
import KeySequenceGame       from './games/KeySequenceGame';
import NumberLineGame        from './games/NumberLineGame';
import MultipleChoiceGame    from './games/MultipleChoiceGame';

const DOMAIN_META = {
  DYSLEXIA:    { icon: BookOpen,    color: 'var(--dyslexia)',    label: 'Dyslexia'    },
  DYSGRAPHIA:  { icon: PenTool,     color: 'var(--dysgraphia)',  label: 'Dysgraphia'  },
  DYSCALCULIA: { icon: Calculator,  color: 'var(--dyscalculia)', label: 'Dyscalculia' },
};

export default function AssessmentEngine({ session, onCompleted }) {
  const [questions, setQuestions]   = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voiceName, setVoiceName]   = useState('');

  const startTimeRef = useRef(Date.now());

  /* Load questions */
  useEffect(() => {
    const fetchQ = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/assessments/questions');
        if (res.ok) setQuestions(await res.json());
      } catch (err) {
        console.error('Failed to load questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQ();
    /* Pre-resolve voice name for display */
    getSelectedVoiceName().then(n => setVoiceName(n));
  }, []);

  const currentQ = questions[currentIndex];

  /* Speak on question change */
  useEffect(() => {
    if (!currentQ) return;
    startTimeRef.current = Date.now();
    if (audioEnabled) {
      speakPrompt(currentQ.audioPrompt || currentQ.prompt);
    }
    return () => stopSpeech();
  }, [currentIndex, currentQ, audioEnabled]);

  const handleAnswer = async (answerData) => {
    const timeTakenMs = Date.now() - startTimeRef.current;

    const responsePayload = {
      questionId:          currentQ.id,
      domain:              currentQ.domain,
      parameterTested:     currentQ.parameterName,
      userAnswer:          String(answerData.userAnswer   ?? ''),
      correctAnswer:       String(answerData.correctAnswer ?? ''),
      isCorrect:           Boolean(answerData.isCorrect),
      timeTakenMs,
      motorJitterScore:    Number(answerData.motorJitterScore  ?? 0),
      motorHesitationCount: Number(answerData.hesitationCount ?? 0),
      reversalDetected:    Boolean(answerData.reversalDetected),
      magnitudeDistance:   Number(answerData.magnitudeDistance ?? 0),
      mlPrediction:        answerData.mlPrediction || null,
      mlConfidence:        answerData.mlConfidence ? Number(answerData.mlConfidence) : null,
      mlModel:             answerData.mlModel || null,
    };

    const nextResponses = [...responses, responsePayload];
    setResponses(nextResponses);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      /* All 15 done — submit to backend */
      setSubmitting(true);
      try {
        const res = await fetch(`http://localhost:8080/api/assessments/${session.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextResponses),
        });
        if (res.ok) onCompleted(await res.json());
        else console.error('Submission failed with status:', res.status);
      } catch (err) {
        console.error('Error submitting assessment:', err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <Loader2 size={40} color="var(--dyslexia)" style={{ animation: 'spin 1.2s linear infinite' }} />
        <h3 style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading assessment questions…</h3>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Submitting ── */
  if (submitting) {
    return (
      <div className="flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
        <CheckCheck size={48} color="var(--dysgraphia)" />
        <h2 style={{ fontSize: '1.8rem' }}>Generating Diagnostic Report</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Evaluating clinical parameters and saving to MongoDB…
        </p>
      </div>
    );
  }

  if (!currentQ) return null;

  const domainMeta = DOMAIN_META[currentQ.domain] || DOMAIN_META.DYSLEXIA;
  const DomainIcon = domainMeta.icon;
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  const renderGame = () => {
    switch (currentQ.type) {
      case 'LETTER_MIRROR':       return <LetterMirrorGame      key={currentQ.id} question={currentQ} onAnswer={handleAnswer} />;
      case 'CANVAS_ROAD_TRACE':   return <CanvasRoadTraceGame   key={currentQ.id} question={currentQ} onAnswer={handleAnswer} />;
      case 'CANVAS_LETTER_TRACE': return <CanvasLetterTraceGame key={currentQ.id} question={currentQ} onAnswer={handleAnswer} />;
      case 'SENTENCE_SPACING':    return <SentenceSpacingGame   key={currentQ.id} question={currentQ} onAnswer={handleAnswer} />;
      case 'DOT_CONNECT':         return <DotConnectGame        key={currentQ.id} question={currentQ} onAnswer={handleAnswer} />;
      case 'KEY_SEQUENCE':        return <KeySequenceGame       key={currentQ.id} question={currentQ} onAnswer={handleAnswer} />;
      case 'NUMBER_LINE':         return <NumberLineGame        key={currentQ.id} question={currentQ} onAnswer={handleAnswer} />;
      default:                    return <MultipleChoiceGame    key={currentQ.id} question={currentQ} onAnswer={handleAnswer} />;
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 24px 60px' }}>

      {/* ── Session Header Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Student + domain */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            {session.childName}
          </span>
          <span style={{ color: 'var(--border-medium)' }}>·</span>
          <span className={`domain-badge ${currentQ.domain}`}>
            <DomainIcon size={12} />
            {domainMeta.label}
          </span>
        </div>

        {/* Question counter + audio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            id="audio-toggle-btn"
            className="btn-audio"
            title={audioEnabled ? `Speaking: ${voiceName}` : 'Audio off — click to enable'}
            onClick={() => {
              if (audioEnabled) stopSpeech();
              else speakPrompt(currentQ.audioPrompt || currentQ.prompt);
              setAudioEnabled(p => !p);
            }}
          >
            {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {audioEnabled ? 'Audio On' : 'Muted'}
          </button>

          <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.02em' }}>
            Question <strong style={{ color: 'var(--text-primary)' }}>{currentIndex + 1}</strong> / {questions.length}
          </span>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <div style={{ marginBottom: 28 }}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
          <span>Start</span>
          <span style={{ color: domainMeta.color, fontWeight: 600 }}>{progressPct}% complete</span>
          <span>Report</span>
        </div>
      </div>

      {/* ── Domain Section Labels ── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(DOMAIN_META).map(([key, meta]) => {
          const Icon = meta.icon;
          const totalInDomain = questions.filter(q => q.domain === key).length;
          const doneInDomain  = responses.filter(r => r.domain === key).length;
          const isCurrent     = currentQ.domain === key;
          return (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 'var(--r-full)',
                background: isCurrent ? `${meta.color}18` : 'transparent',
                border: `1px solid ${isCurrent ? meta.color + '44' : 'var(--border-faint)'}`,
                fontSize: '0.75rem',
                color: isCurrent ? meta.color : 'var(--text-tertiary)',
                fontWeight: isCurrent ? 700 : 500,
                transition: 'all 0.2s',
              }}
            >
              <Icon size={12} />
              {meta.label} {doneInDomain}/{totalInDomain}
            </div>
          );
        })}
      </div>

      {/* ── Game Card ── */}
      <div
        className="card animate-pop-in"
        style={{ padding: 'clamp(24px, 5vw, 40px)' }}
      >
        {/* Question metadata row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 22,
            paddingBottom: 18,
            borderBottom: '1px solid var(--border-faint)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: 4,
              }}
            >
              Parameter
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {currentQ.parameterName}
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-faint)',
              borderRadius: 'var(--r-md)',
              padding: '6px 14px',
              fontSize: '0.8rem',
              color: 'var(--text-tertiary)',
              fontWeight: 600,
            }}
          >
            Q{currentIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Title & Prompt */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2
            style={{
              fontSize: 'clamp(1.35rem, 3.5vw, 1.85rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: 10,
            }}
          >
            {currentQ.title}
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              maxWidth: 580,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            {currentQ.prompt}
          </p>
        </div>

        {/* Game Component */}
        <div
          style={{
            minHeight: 260,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {renderGame()}
        </div>
      </div>

    </div>
  );
}
