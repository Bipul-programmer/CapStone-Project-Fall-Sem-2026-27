import React, { useState, useEffect } from 'react';
import { X, Search, FileText, Database, Loader2 } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (query = '') => {
    setLoading(true);
    try {
      const url = query
        ? `http://localhost:8080/api/assessments/history?childName=${encodeURIComponent(query)}`
        : `http://localhost:8080/api/assessments/history`;
      const res = await fetch(url);
      if (res.ok) setSessions(await res.json());
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) { setSearchTerm(''); fetchHistory(); }
  }, [isOpen]);

  const handleSearch = (e) => { e.preventDefault(); fetchHistory(searchTerm); };

  if (!isOpen) return null;

  const riskColors = {
    LOW_RISK:          'var(--risk-low)',
    MODERATE_TENDENCY: 'var(--risk-mod)',
    HIGH_RISK:         'var(--risk-high)',
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0, 0, 0, 0.70)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, padding: 20,
      }}
    >
      <div
        className="card animate-fade-in"
        style={{ width: '100%', maxWidth: 780, maxHeight: '88vh', display: 'flex', flexDirection: 'column', padding: '28px 28px 20px' }}
      >

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--dysgraphia-dim)', border: '1px solid var(--dysgraphia-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={16} color="var(--dysgraphia)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Stored Assessments</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                MongoDB · learning_assessment_db
              </div>
            </div>
          </div>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '6px 10px', borderRadius: 8 }}
            id="close-history-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              id="search-history-input"
              className="custom-input"
              style={{ paddingLeft: 38 }}
              placeholder="Search by student name…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button id="search-history-btn" type="submit" className="btn-primary" style={{ padding: '0 20px', flexShrink: 0 }}>
            Filter
          </button>
        </form>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {loading ? (
            <div className="flex-center" style={{ height: 200, flexDirection: 'column', gap: 12, color: 'var(--text-tertiary)' }}>
              <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Querying MongoDB…</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex-center" style={{ height: 200, flexDirection: 'column', gap: 10, color: 'var(--text-tertiary)' }}>
              <Database size={32} />
              <span style={{ fontSize: '0.9rem' }}>No completed sessions found.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.map(s => {
                const rep     = s.report || {};
                const dateStr = (s.completedAt || s.createdAt)
                  ? new Date(s.completedAt || s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—';
                const riskCol = riskColors[rep.overallRiskLevel] || 'var(--text-tertiary)';

                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)',
                      padding: '14px 18px', border: '1px solid var(--border-faint)',
                      transition: 'border-color var(--dur-fast)',
                      flexWrap: 'wrap', gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.97rem', color: 'var(--text-primary)' }}>
                        {s.childName}
                        <span style={{ fontWeight: 400, fontSize: '0.83rem', color: 'var(--text-tertiary)', marginLeft: 6 }}>
                          ({s.childAge} yrs · {s.childGrade})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        Parent: {s.parentName} · {dateStr}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {rep.overallRiskLevel && (
                        <span className={`risk-badge ${rep.overallRiskLevel}`} style={{ fontSize: '0.75rem' }}>
                          {rep.overallRiskLevel.replace('_', ' ')}
                        </span>
                      )}
                      <button
                        id={`view-report-${s.id}`}
                        className="btn-primary"
                        style={{ padding: '7px 14px', fontSize: '0.82rem', gap: 6 }}
                        onClick={() => { onSelectSession(s); onClose(); }}
                      >
                        <FileText size={14} /> View Report
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
