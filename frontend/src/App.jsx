import React, { useState } from 'react';
import { Brain, Database, Shield } from 'lucide-react';
import RegistrationView from './components/RegistrationView';
import AssessmentEngine from './components/AssessmentEngine';
import DiagnosticReportView from './components/DiagnosticReportView';
import HistoryModal from './components/HistoryModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('REGISTRATION');
  const [activeSession, setActiveSession] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleStart = async (formData) => {
    try {
      const res = await fetch('http://localhost:8080/api/assessments/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const session = await res.json();
        setActiveSession(session);
        setCurrentScreen('ASSESSMENT');
      } else {
        alert('Could not start assessment. Ensure the Spring Boot backend is running on port 8080.');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Network error — could not connect to the backend at http://localhost:8080.');
    }
  };

  const handleAssessmentCompleted = (completedSession) => {
    setActiveSession(completedSession);
    setCurrentScreen('REPORT');
  };

  const handleRetake = () => {
    setActiveSession(null);
    setCurrentScreen('REGISTRATION');
  };

  const handleSelectHistorySession = (session) => {
    setActiveSession(session);
    setCurrentScreen('REPORT');
  };

  const navItems = [
    { label: 'Assessment', screen: 'REGISTRATION', active: currentScreen === 'REGISTRATION' },
    { label: 'Database', onClick: () => setIsHistoryOpen(true) },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Navigation Bar ── */}
      <header
        className="no-print"
        style={{
          height: 64,
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-faint)',
          background: 'rgba(7, 9, 15, 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 200,
        }}
      >
        {/* Logo */}
        <button
          id="logo-home-btn"
          onClick={handleRetake}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'none',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(140deg, #6370f8, #3a8ef8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 112, 248, 0.40)',
              flexShrink: 0,
            }}
          >
            <Brain size={20} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              NeuroQuest
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: -1 }}>
              Pediatric Screening Engine
            </div>
          </div>
        </button>

        {/* Screen Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['REGISTRATION', 'ASSESSMENT', 'REPORT'].map((s, i, arr) => (
            <React.Fragment key={s}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: currentScreen === s ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {s === 'REGISTRATION' ? 'Register' : s === 'ASSESSMENT' ? 'Assessment' : 'Report'}
              </span>
              {i < arr.length - 1 && (
                <span style={{ color: 'var(--border-medium)', fontSize: '0.7rem' }}>›</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Actions */}
        <button
          id="nav-history-btn"
          className="btn-secondary"
          onClick={() => setIsHistoryOpen(true)}
          style={{ fontSize: '0.84rem', padding: '7px 16px' }}
        >
          <Database size={15} color="var(--dysgraphia)" />
          MongoDB Records
        </button>
      </header>

      {/* ── Main Content ── */}
      <main style={{ flex: 1 }}>
        {currentScreen === 'REGISTRATION' && (
          <RegistrationView
            onStart={handleStart}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        )}

        {currentScreen === 'ASSESSMENT' && activeSession && (
          <AssessmentEngine
            session={activeSession}
            onCompleted={handleAssessmentCompleted}
          />
        )}

        {currentScreen === 'REPORT' && activeSession && (
          <DiagnosticReportView
            session={activeSession}
            onRetake={handleRetake}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        className="no-print"
        style={{
          borderTop: '1px solid var(--border-faint)',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--text-tertiary)',
          fontSize: '0.78rem',
          background: 'rgba(7, 9, 15, 0.60)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Shield size={13} color="var(--risk-low)" />
          <span>Parameters calibrated for Dyslexia, Dysgraphia &amp; Dyscalculia screening.</span>
        </div>
        <span>React · Spring Boot · MongoDB</span>
      </footer>

      {/* ── History Modal ── */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSelectHistorySession}
      />
    </div>
  );
}
