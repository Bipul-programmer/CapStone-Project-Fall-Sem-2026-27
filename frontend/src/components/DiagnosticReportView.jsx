import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle, AlertTriangle, XCircle,
  Printer, RotateCcw, BookOpen, PenTool, Calculator,
  Info, Database, ArrowRight,
} from 'lucide-react';

/* ── Helpers ── */
function getRiskConfig(risk) {
  if (!risk) return { icon: null, color: 'var(--text-tertiary)', label: 'N/A' };
  if (risk === 'LOW_RISK')         return { icon: CheckCircle,   color: 'var(--risk-low)', label: 'Low Risk / Age-Appropriate'  };
  if (risk === 'MODERATE_TENDENCY') return { icon: AlertTriangle, color: 'var(--risk-mod)', label: 'Moderate Tendency'             };
  return                                  { icon: XCircle,       color: 'var(--risk-high)', label: 'High Risk / Strong Indicator' };
}

function RiskBadge({ risk }) {
  const cfg = getRiskConfig(risk);
  const Icon = cfg.icon;
  return (
    <span className={`risk-badge ${risk}`}>
      {Icon && <Icon size={14} />}
      {cfg.label}
    </span>
  );
}

function ScoreGauge({ score, color }) {
  const pct = Math.min(100, Math.max(0, score || 0));
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Score</span>
        <span style={{ fontSize: '0.95rem', fontWeight: 800, color }}>{pct.toFixed(0)}%</span>
      </div>
      <div className="progress-track" style={{ height: 8 }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 'var(--r-full)', background: color, transition: 'width 1s var(--ease-out)' }} />
      </div>
    </div>
  );
}

const DOMAIN_CONFIG = {
  DYSLEXIA:    { icon: BookOpen,   label: 'Dyslexia',    color: 'var(--dyslexia)',    dim: 'var(--dyslexia-dim)',    border: 'var(--dyslexia-border)',    scoreKey: 'dyslexiaScore',    riskKey: 'dyslexiaRisk',    summaryKey: 'dyslexiaSummary',    tested: 'Mirror Letters (b/d/p), Rhyme Coda, Phoneme Blending, Vowel Orthography, Sight Words' },
  DYSGRAPHIA:  { icon: PenTool,    label: 'Dysgraphia',  color: 'var(--dysgraphia)',  dim: 'var(--dysgraphia-dim)',  border: 'var(--dysgraphia-border)',  scoreKey: 'dysgraphiaScore',  riskKey: 'dysgraphiaRisk',  summaryKey: 'dysgraphiaSummary',  tested: 'Continuous Path Jitter, Letter \'S\' Kinematics, Word Spacing Alignment, Dot Sequencing, Key Tap Latency' },
  DYSCALCULIA: { icon: Calculator, label: 'Dyscalculia', color: 'var(--dyscalculia)', dim: 'var(--dyscalculia-dim)', border: 'var(--dyscalculia-border)', scoreKey: 'dyscalculiaScore', riskKey: 'dyscalculiaRisk', summaryKey: 'dyscalculiaSummary', tested: 'Flash Subitizing, Non-Symbolic Magnitude, Number Line (0–20), Skip Counting, Visual Addition' },
};

export default function DiagnosticReportView({ session, onRetake, onOpenHistory }) {
  const report     = session.report || {};
  const responses  = session.responses || [];

  useEffect(() => {
    try {
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.55 } });
    } catch (_) {}
  }, []);

  const formattedDate = session.completedAt
    ? new Date(session.completedAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'N/A';

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto', padding: '32px 24px 64px' }}>

      {/* ── Action Bar ── */}
      <div
        className="no-print"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}
      >
        <button className="btn-secondary" onClick={onRetake} id="report-new-test-btn">
          <RotateCcw size={15} /> New Assessment
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={onOpenHistory} id="report-history-btn">
            <Database size={15} color="var(--dysgraphia)" /> MongoDB Records
          </button>
          <button className="btn-primary" onClick={() => window.print()} id="print-report-btn">
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* ── Report Container ── */}
      <div className="card" style={{ padding: 'clamp(24px, 5vw, 44px)' }}>

        {/* Report Header */}
        <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid var(--border-faint)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'var(--accent-subtle)', border: '1px solid rgba(91,99,245,0.28)',
            borderRadius: 'var(--r-full)', padding: '5px 16px', marginBottom: 18,
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'var(--dyslexia)',
          }}>
            Learning Differences Screening Report
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: 6 }}>
            Cognitive Assessment Profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Dyslexia · Dysgraphia · Dyscalculia
          </p>
        </div>

        {/* Session Meta */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16, marginBottom: 36,
        }}>
          {[
            { label: 'Student',        value: session.childName,     sub: `Age ${session.childAge} · ${session.childGrade}` },
            { label: 'Parent',         value: session.parentName,    sub: session.parentEmail || session.parentPhone || 'No contact' },
            { label: 'Assessment',     value: '15 / 15 Questions',   sub: formattedDate },
            { label: 'Overall Result', value: null,                  badge: report.overallRiskLevel },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)',
                padding: '16px 18px', border: '1px solid var(--border-faint)',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 5 }}>
                {item.label}
              </div>
              {item.badge
                ? <RiskBadge risk={item.badge} />
                : <>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{item.value}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{item.sub}</div>
                  </>
              }
            </div>
          ))}
        </div>

        {/* Executive Summary */}
        <div style={{
          background: 'rgba(91, 99, 245, 0.06)', border: '1px solid rgba(91, 99, 245, 0.18)',
          borderRadius: 'var(--r-lg)', padding: '18px 22px', marginBottom: 40,
          display: 'flex', gap: 14,
        }}>
          <ArrowRight size={18} color="var(--dyslexia)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--dyslexia)', marginBottom: 4 }}>
              Clinical Synthesis
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.65 }}>
              {report.overallSummary}
            </p>
          </div>
        </div>

        {/* ── Domain Cards ── */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 18 }}>
          Domain Risk Analysis
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 44 }}>
          {Object.entries(DOMAIN_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const score = report[cfg.scoreKey];
            const risk  = report[cfg.riskKey];
            const summary = report[cfg.summaryKey];
            return (
              <div
                key={key}
                style={{
                  background: 'var(--bg-elevated)', borderRadius: 'var(--r-xl)',
                  padding: '22px 22px 20px', border: `1px solid ${cfg.border}`,
                  display: 'flex', flexDirection: 'column', gap: 14,
                }}
              >
                {/* Domain header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: cfg.dim, border: `1px solid ${cfg.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={cfg.color} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: cfg.color }}>{cfg.label}</span>
                </div>

                <ScoreGauge score={score} color={cfg.color} />
                <RiskBadge risk={risk} />

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6 }}>{summary}</p>

                <div style={{
                  fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: 1.5,
                  borderTop: '1px solid var(--border-faint)', paddingTop: 10,
                }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Tested:</strong> {cfg.tested}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Parameter Scores ── */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>Parameter Scores (All 15 Cognitive Tasks)</h2>

        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)', padding: '20px 22px', marginBottom: 40, border: '1px solid var(--border-faint)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {Object.entries(report.parameterScores || {}).map(([param, score], idx) => {
              const isHigh = score >= 80;
              const isMed  = score >= 50;
              const col = isHigh ? 'var(--risk-low)' : isMed ? 'var(--risk-mod)' : 'var(--risk-high)';
              return (
                <div key={idx} style={{ background: 'var(--bg-overlay)', padding: '12px 14px', borderRadius: 'var(--r-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.80rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{param.replace(/^(Dyslexia|Dysgraphia|Dyscalculia) - /, '')}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: col }}>{score}%</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--border-faint)', borderRadius: 'var(--r-full)' }}>
                    <div style={{ width: `${score}%`, height: '100%', borderRadius: 'var(--r-full)', background: col, transition: 'width 1s var(--ease-out)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Response Audit Table ── */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 14 }}>Response Audit (All 15 Questions)</h2>

        <div style={{ overflowX: 'auto', marginBottom: 40 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-overlay)', borderBottom: '1px solid var(--border-subtle)' }}>
                {['#', 'Domain', 'Parameter', 'Response', 'Time', 'Metric', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-faint)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>Q{r.questionId}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className={`domain-badge ${r.domain}`}>{r.domain}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.parameterTested}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {String(r.userAnswer)}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                    {(r.timeTakenMs / 1000).toFixed(1)}s
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--dyslexia)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {r.motorJitterScore > 0 ? `Jitter ${r.motorJitterScore}px` : r.reversalDetected ? 'Reversal' : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {r.isCorrect
                      ? <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--risk-low)', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}><CheckCircle size={13} /> Passed</span>
                      : <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--risk-high)', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}><AlertTriangle size={13} /> Friction</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Recommendations ── */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 14 }}>Home &amp; Classroom Action Plan</h2>

        <div style={{
          background: 'rgba(34, 199, 122, 0.06)', border: '1px solid rgba(34, 199, 122, 0.20)',
          borderRadius: 'var(--r-lg)', padding: '18px 22px', marginBottom: 32,
        }}>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(report.actionableRecommendations || []).map((rec, idx) => (
              <li key={idx} style={{ display: 'flex', gap: 10, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <CheckCircle size={16} color="var(--risk-low)" style={{ flexShrink: 0, marginTop: 2 }} />
                {rec}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Clinical Disclaimer ── */}
        <div className="disclaimer-banner">
          <Info size={20} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Clinical Screening Disclaimer</strong>
            <p style={{ marginTop: 6, color: '#fde58a' }}>
              This digital assessment is an educational screening tool measuring neuropsychological development indicators.
              It does not constitute an official DSM-5 or ICD-11 clinical diagnosis. If moderate or high risk markers are
              identified, consult a licensed educational psychologist, paediatrician, or speech-language pathologist.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
