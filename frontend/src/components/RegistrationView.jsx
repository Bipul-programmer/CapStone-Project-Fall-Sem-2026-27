import React, { useState } from 'react';
import {
  User, Mail, Phone, BookOpen, PenTool, Calculator,
  ArrowRight, History, ChevronDown, Info,
} from 'lucide-react';

const GRADES = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade',
  '4th Grade', '5th Grade', '6th Grade', '7th Grade', '8th Grade',
];

const DOMAINS = [
  {
    key: 'dyslexia',
    icon: BookOpen,
    label: 'Dyslexia',
    colorVar: 'var(--dyslexia)',
    dimVar: 'var(--dyslexia-dim)',
    borderVar: 'var(--dyslexia-border)',
    desc: 'Reading, phonological decoding, mirror-letter orientation (b/d/p/q), rhyme awareness, and rapid sight-word recognition.',
    count: 5,
  },
  {
    key: 'dysgraphia',
    icon: PenTool,
    label: 'Dysgraphia',
    colorVar: 'var(--dysgraphia)',
    dimVar: 'var(--dysgraphia-dim)',
    borderVar: 'var(--dysgraphia-border)',
    desc: 'Fine-motor trajectory stability, canvas stroke jitter, letter-formation kinematics, and visual-spatial sentence alignment.',
    count: 5,
  },
  {
    key: 'dyscalculia',
    icon: Calculator,
    label: 'Dyscalculia',
    colorVar: 'var(--dyscalculia)',
    dimVar: 'var(--dyscalculia-dim)',
    borderVar: 'var(--dyscalculia-border)',
    desc: 'Non-verbal subitizing flash speed, magnitude comparison, mental number line scaling, and arithmetic fact fluency.',
    count: 5,
  },
];

export default function RegistrationView({ onStart, onOpenHistory }) {
  const [form, setForm] = useState({
    parentName: '', parentEmail: '', parentPhone: '',
    childName: '', childAge: 8, childGrade: '2nd Grade',
  });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.parentName.trim()) e.parentName = 'Required';
    if (!form.childName.trim())  e.childName  = 'Required';
    if (form.childAge < 4 || form.childAge > 16) e.childAge = 'Age must be 4–16';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onStart(form);
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 24px 60px' }}>

      {/* ── Hero Section ── */}
      <div style={{ textAlign: 'center', marginBottom: 52 }}>

        {/* Pill badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--accent-subtle)',
            border: '1px solid rgba(91, 99, 245, 0.28)',
            borderRadius: 'var(--r-full)',
            padding: '6px 16px',
            marginBottom: 24,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--dyslexia)',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--dyslexia)', flexShrink: 0 }} />
          Pediatric Cognitive Screening Platform
        </div>

        <h1
          style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, marginBottom: 16, lineHeight: 1.15 }}
        >
          Understand How Your Child{' '}
          <span className="gradient-text-brand">Thinks&nbsp;&amp;&nbsp;Learns</span>
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            maxWidth: 620,
            margin: '0 auto',
            lineHeight: 1.65,
          }}
        >
          A 15-question interactive assessment measuring core neuro-cognitive indicators for{' '}
          <strong style={{ color: 'var(--dyslexia)' }}>Dyslexia</strong>,{' '}
          <strong style={{ color: 'var(--dysgraphia)' }}>Dysgraphia</strong>, and{' '}
          <strong style={{ color: 'var(--dyscalculia)' }}>Dyscalculia</strong>.
          Results generate a personalised clinical-parameter report within minutes.
        </p>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            marginTop: 32,
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Questions', value: '15' },
            { label: 'Domains', value: '3' },
            { label: 'Parameters', value: '15' },
            { label: 'Minutes', value: '~12' },
          ].map(s => (
            <div key={s.label} className="stat-chip">
              <strong>{s.value}</strong>
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Domain Feature Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 44,
        }}
      >
        {DOMAINS.map(({ icon: Icon, label, colorVar, dimVar, borderVar, desc, count }) => (
          <div
            key={label}
            className="card-elevated"
            style={{
              padding: '22px 22px 20px',
              borderColor: borderVar,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: dimVar,
                    border: `1px solid ${borderVar}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color={colorVar} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: colorVar }}>{label}</span>
              </div>
              <span
                style={{
                  background: dimVar,
                  color: colorVar,
                  border: `1px solid ${borderVar}`,
                  padding: '2px 9px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '0.73rem',
                  fontWeight: 700,
                }}
              >
                {count} tasks
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* ── Registration Form Card ── */}
      <div
        className="card"
        style={{ padding: 'clamp(24px, 5vw, 44px)' }}
      >
        {/* Form Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 6 }}>Session Registration</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Enter parent and student details to initialise a new assessment session.
            </p>
          </div>
          <button
            id="view-history-btn"
            type="button"
            className="btn-secondary"
            onClick={onOpenHistory}
            style={{ flexShrink: 0 }}
          >
            <History size={15} />
            Past Reports
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 40,
            }}
          >
            {/* ── Parent Column ── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--border-faint)',
                }}
              >
                <User size={16} color="var(--dyslexia)" />
                <span style={{ fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--dyslexia)' }}>
                  Parent / Guardian
                </span>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="parentName">Full Name *</label>
                <input
                  id="parentName"
                  className="custom-input"
                  type="text"
                  placeholder="e.g. Sarah Johnson"
                  value={form.parentName}
                  onChange={e => set('parentName', e.target.value)}
                />
                {errors.parentName && (
                  <span style={{ color: 'var(--risk-high)', fontSize: '0.78rem', marginTop: 2 }}>
                    {errors.parentName}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="parentEmail">
                  Email Address <span style={{ color: 'var(--text-tertiary)' }}>(optional)</span>
                </label>
                <input
                  id="parentEmail"
                  className="custom-input"
                  type="email"
                  placeholder="e.g. sarah@example.com"
                  value={form.parentEmail}
                  onChange={e => set('parentEmail', e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="parentPhone">
                  Phone Number <span style={{ color: 'var(--text-tertiary)' }}>(optional)</span>
                </label>
                <input
                  id="parentPhone"
                  className="custom-input"
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={form.parentPhone}
                  onChange={e => set('parentPhone', e.target.value)}
                />
              </div>
            </div>

            {/* ── Child Column ── */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 20,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--border-faint)',
                }}
              >
                <BookOpen size={16} color="var(--dysgraphia)" />
                <span style={{ fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--dysgraphia)' }}>
                  Student Profile
                </span>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="childName">Child's Full Name *</label>
                <input
                  id="childName"
                  className="custom-input"
                  type="text"
                  placeholder="e.g. Ethan Johnson"
                  value={form.childName}
                  onChange={e => set('childName', e.target.value)}
                />
                {errors.childName && (
                  <span style={{ color: 'var(--risk-high)', fontSize: '0.78rem', marginTop: 2 }}>
                    {errors.childName}
                  </span>
                )}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="childAge">
                  Age — <span style={{ color: 'var(--dyscalculia)', fontWeight: 700 }}>{form.childAge} years old</span>
                </label>
                <input
                  id="childAge"
                  type="range"
                  min="4"
                  max="16"
                  step="1"
                  value={form.childAge}
                  onChange={e => set('childAge', Number(e.target.value))}
                  style={{ accentColor: 'var(--dyscalculia)', width: '100%', cursor: 'pointer' }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.73rem',
                    color: 'var(--text-tertiary)',
                    marginTop: 4,
                  }}
                >
                  <span>4 yrs</span>
                  <span>10 yrs</span>
                  <span>16 yrs</span>
                </div>
                {errors.childAge && (
                  <span style={{ color: 'var(--risk-high)', fontSize: '0.78rem' }}>{errors.childAge}</span>
                )}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="childGrade">Grade / Year Level</label>
                <div style={{ position: 'relative' }}>
                  <select
                    id="childGrade"
                    className="custom-input"
                    value={form.childGrade}
                    onChange={e => set('childGrade', e.target.value)}
                    style={{ appearance: 'none', WebkitAppearance: 'none', paddingRight: 36 }}
                  >
                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronDown
                    size={16}
                    color="var(--text-tertiary)"
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Screening disclaimer */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              background: 'rgba(91, 99, 245, 0.06)',
              border: '1px solid rgba(91, 99, 245, 0.18)',
              borderRadius: 'var(--r-md)',
              padding: '13px 16px',
              marginTop: 28,
              marginBottom: 28,
              fontSize: '0.80rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
            }}
          >
            <Info size={16} color="var(--dyslexia)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              This assessment provides an educational screening report — not a clinical diagnosis.
              Results should be reviewed with a qualified educational psychologist or paediatrician.
            </span>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              id="start-assessment-btn"
              type="submit"
              className="btn-primary"
              style={{ padding: '14px 44px', fontSize: '1rem', gap: 10 }}
            >
              Begin Assessment
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
