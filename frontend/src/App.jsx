import React, { useEffect, useState } from 'react'
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
  WandSparkles,
  X
} from 'lucide-react'

import {
  analyze,
  dashboardStats,
  generate,
  saveAnalysis,
  weaknessStats
} from './lib/api'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const NAV = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['analyzer', 'Password Analyzer', Shield],
  ['generator', 'Generator', WandSparkles],
  ['security', 'Security Center', LockKeyhole],
  ['education', 'Password Guide', BookOpen],
]

const fallback = {
  score: 0,
  classification: 'VERY WEAK',
  findings: [],
  suggestions: [],
  metrics: {
    length: 0,
    character_types: 0,
    unique_character_ratio: 0,
    theoretical_entropy_bits: 0,
    pattern_count: 0
  }
}

function App() {
  const [active, setActive] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [context, setContext] = useState({
    first_name: '',
    birth_year: '',
    company: '',
    username: ''
  })

  const [analysis, setAnalysis] = useState(fallback)
  const [stats, setStats] = useState(null)
  const [weaknesses, setWeaknesses] = useState([])

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    refreshDashboard()
  }, [])

  useEffect(() => {
    if (!password) {
      setAnalysis(fallback)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const result = await analyze(password, context)
        setAnalysis(result)
        setError('')
      } catch (e) {
        setError(e.message)
      }
    }, 180)

    return () => clearTimeout(timer)
  }, [password, context])

  async function refreshDashboard() {
    try {
      setStats(await dashboardStats())
      setWeaknesses((await weaknessStats()).weaknesses)
    } catch {
      // Backend may still be starting.
    }
  }

  async function saveCurrent() {
    if (!password) return

    try {
      await saveAnalysis(password, context)

      setSaved(true)

      await refreshDashboard()

      setTimeout(() => setSaved(false), 1800)
    } catch (e) {
      setError(e.message)
    }
  }

  async function makePassword(payload) {
    try {
      const result = await generate(payload)

      setPassword(result.password)
      setActive('analyzer')
      setShowPassword(true)
      setError('')
    } catch (e) {
      setError(e.message)
    }
  }

  const distribution = stats
    ? Object.entries(stats.strength_distribution).map(
        ([name, value]) => ({
          name,
          value
        })
      )
    : []

  const weaknessData = weaknesses.map(x => ({
    name: x.type.replaceAll('_', ' '),
    count: x.count
  }))

  return (
    <div className="app-shell">

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>

        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <b>
              Password<span>Guard</span>
            </b>

            <small>SECURITY ANALYZER</small>
          </div>
        </div>

        <div className="workspace">
          <span className="status-dot" />
          Demo Workspace
          <span className="lock-mini">⌁</span>
        </div>

        <div className="nav-label">MAIN</div>

        <nav>
          {NAV.map(([id, label, Icon]) => (
            <button
              key={id}
              className={
                active === id
                  ? 'nav-item active'
                  : 'nav-item'
              }
              onClick={() => {
                setActive(id)
                setMobileOpen(false)
              }}
            >
              <Icon size={18} />

              <span>{label}</span>

              {id === 'security' && <em>3</em>}
            </button>
          ))}
        </nav>

        <div className="nav-label lower">
          TOOLS & DATA
        </div>

        <nav>

          <button
            className="nav-item"
            onClick={refreshDashboard}
          >
            <RefreshCw size={18} />
            <span>Refresh Analytics</span>
          </button>

          {/* FIXED API DOCS LINK */}
          <button
            className="nav-item"
            onClick={() =>
              window.open(
                `${API_BASE_URL}/docs`,
                '_blank',
                'noopener,noreferrer'
              )
            }
          >
            <BookOpen size={18} />
            <span>API Docs</span>
          </button>

        </nav>

        <div className="sidebar-note">
          <Sparkles size={17} />

          <div>
            <b>Privacy by design</b>

            <small>
              Passwords stay in memory and are never
              written to analytics.
            </small>
          </div>
        </div>

        <div className="sidebar-footer">
          PasswordGuard v1.0
          <br />
          <span>Defensive cybersecurity project</span>
        </div>

      </aside>

      <main className="main">

        <header className="topbar">

          <button
            className="mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>

          <div className="search">
            <span>⌕</span>

            <input
              placeholder="Search tools, security guides..."
            />
          </div>

          <div className="top-actions">

            <button
              className="icon-btn"
              title="Secure status"
            >
              <ShieldCheck size={18} />
            </button>

            <button className="avatar">
              <UserRound size={17} />
            </button>

          </div>

        </header>

        {error && (
          <div className="error-banner">
            <TriangleAlert size={16} />
            {error}
          </div>
        )}

        <section className="content">

          <div className="page-head">

            <div>

              <p className="eyebrow">
                DIGITAL SECURITY MADE SIMPLE
              </p>

              <h1>
                {active === 'dashboard'
                  ? 'Security Dashboard'
                  : NAV.find(
                      x => x[0] === active
                    )?.[1]}
              </h1>

              <p className="subtitle">
                Real-time password security insights
                without storing your password.
              </p>

            </div>

            <div className="head-actions">

              <button
                className="secondary"
                onClick={() => setActive('generator')}
              >
                <WandSparkles size={16} />
                Generate
              </button>

              <button
                className="primary"
                onClick={() => setActive('analyzer')}
              >
                <KeyRound size={16} />
                Analyze Password
              </button>

            </div>

          </div>

          {active === 'dashboard' && (
            <Dashboard
              stats={stats}
              distribution={distribution}
              weaknessData={weaknessData}
              onAnalyze={() => setActive('analyzer')}
            />
          )}

          {active === 'analyzer' && (
            <Analyzer
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              context={context}
              setContext={setContext}
              analysis={analysis}
              onSave={saveCurrent}
              saved={saved}
            />
          )}

          {active === 'generator' && (
            <Generator
              onGenerate={makePassword}
            />
          )}

          {active === 'security' && (
            <SecurityCenter />
          )}

          {active === 'education' && (
            <Education />
          )}

        </section>

      </main>

    </div>
  )
}


function Dashboard({
  stats,
  distribution,
  weaknessData,
  onAnalyze
}) {

  const total = stats?.total_analyses ?? 0
  const avg = stats?.average_score ?? 0

  const dist =
    stats?.strength_distribution || {
      'VERY STRONG': 0,
      STRONG: 0,
      MODERATE: 0,
      WEAK: 0,
      'VERY WEAK': 0
    }

  const cards = [
    [
      'Total Analyses',
      total,
      'Safe aggregate metadata only',
      'blue'
    ],
    [
      'Very Strong',
      dist['VERY STRONG'],
      'High resilience',
      'green'
    ],
    [
      'Strong',
      dist.STRONG,
      'Good protection',
      'cyan'
    ],
    [
      'Moderate',
      dist.MODERATE,
      'Needs improvement',
      'orange'
    ],
    [
      'Weak',
      dist.WEAK,
      'Attention needed',
      'red'
    ],
    [
      'Very Weak',
      dist['VERY WEAK'],
      'High risk',
      'purple'
    ]
  ]

  return (
    <>
      <div className="hero-card">

        <div>

          <span className="pill">
            <ShieldCheck size={14} />
            PRIVACY-FIRST ANALYSIS
          </span>

          <h2>
            Make every password harder to guess.
          </h2>

          <p>
            Analyze length, unpredictability, patterns,
            common-password risk and contextual
            weaknesses in real time.
          </p>

          <button
            className="primary"
            onClick={onAnalyze}
          >
            Open Password Analyzer
            <ChevronRight size={16} />
          </button>

        </div>

        <div className="hero-visual">

          <div className="shield-orbit">
            <ShieldCheck size={52} />
            <span></span>
            <span></span>
          </div>

          <div className="hero-mini">
            <b>100%</b>
            <small>local-first input flow</small>
          </div>

        </div>

      </div>

      <div className="kpi-grid">

        {cards.map(
          ([label, value, note, tone]) => (
            <div
              className={`kpi-card ${tone}`}
              key={label}
            >

              <div className="kpi-top">
                <span>{label}</span>
                <Shield size={16} />
              </div>

              <strong>{value}</strong>

              <small>{note}</small>

            </div>
          )
        )}

      </div>

      <div className="dashboard-grid">

        <div className="panel chart-panel">

          <div className="panel-head">

            <div>
              <h3>Strength Distribution</h3>

              <small>
                Saved analyses only — never passwords
              </small>
            </div>

            <span className="avg-score">
              Avg {avg}/100
            </span>

          </div>

          <div className="chart">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart data={distribution}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  fill="#1565f2"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        <div className="panel chart-panel">

          <div className="panel-head">

            <div>
              <h3>Security Health</h3>

              <small>
                Project-defined score bands
              </small>
            </div>

            <Gauge size={18} />

          </div>

          <div
            className="health-ring"
            style={{
              '--score': `${avg}%`
            }}
          >
            <div>
              <strong>{avg}</strong>
              <span>Protected</span>
            </div>
          </div>

          <div className="legend">

            <span>
              <i className="dot strong" />
              Strong
            </span>

            <span>
              <i className="dot moderate" />
              Moderate
            </span>

            <span>
              <i className="dot weak" />
              Weak
            </span>

          </div>

        </div>

        <div className="panel chart-panel full">

          <div className="panel-head">

            <div>

              <h3>
                Most Common Weakness Types
              </h3>

              <small>
                Only aggregate finding counts are stored
              </small>

            </div>

            <BarChart3 size={18} />

          </div>

          <div className="chart short">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={weaknessData}
                layout="vertical"
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                />

                <YAxis
                  dataKey="name"
                  type="category"
                  width={130}
                  tick={{ fontSize: 11 }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  fill="#2b6ff7"
                  radius={[0, 7, 7, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>
    </>
  )
}


function Analyzer({
  password,
  setPassword,
  showPassword,
  setShowPassword,
  context,
  setContext,
  analysis,
  onSave,
  saved
}) {

  const m =
    analysis.metrics || fallback.metrics

  const severityIcon = {
    critical: 'danger',
    high: 'danger',
    medium: 'warn',
    low: 'safe'
  }

  return (
    <div className="analyzer-layout">

      <div className="panel analyzer-card">

        <div className="panel-head">

          <div>
            <h3>Password Strength Analyzer</h3>

            <small>
              Your password is analyzed transiently
              in memory.
            </small>
          </div>

          <span className="secure-chip">
            <LockKeyhole size={14} />
            PRIVATE
          </span>

        </div>

        <label className="field-label">
          ENTER PASSWORD
        </label>

        <div className="password-field">

          <input
            type={
              showPassword
                ? 'text'
                : 'password'
            }
            value={password}
            onChange={e =>
              setPassword(e.target.value)
            }
            placeholder="Type a password to analyze..."
            autoComplete="new-password"
          />

          <button
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword
              ? <EyeOff />
              : <Eye />}
          </button>

        </div>

        <div className="field-help">
          <span>Hidden by default</span>

          <span>
            {m.length}/128 characters
          </span>
        </div>

        <div className="context-box">

          <div className="context-head">

            <span>
              <UserRound size={15} />
              Optional personal context
            </span>

            <small>
              Compared locally only
            </small>

          </div>

          <div className="context-grid">

            {[
              ['first_name', 'First name'],
              ['birth_year', 'Birth year'],
              ['company', 'Company / college'],
              ['username', 'Username']
            ].map(([key, label]) => (

              <input
                key={key}
                value={context[key]}
                onChange={e =>
                  setContext({
                    ...context,
                    [key]: e.target.value
                  })
                }
                placeholder={label}
              />

            ))}

          </div>

        </div>

        <div className="score-box">

          <div
            className="score-circle"
            style={{
              '--score': `${analysis.score}%`
            }}
          >
            <div>
              <strong>{analysis.score}</strong>
              <span>/100</span>
            </div>
          </div>

          <div className="score-copy">

            <span
              className={`classification ${
                analysis.classification
                  .toLowerCase()
                  .replace(' ', '-')
              }`}
            >
              {analysis.classification}
            </span>

            <h4>
              {analysis.score >= 61
                ? 'Good foundation'
                : 'This password needs improvement'}
            </h4>

            <p>
              Composition is only one signal.
              Length, common-password exposure
              and predictable patterns matter too.
            </p>

          </div>

        </div>

        <div className="metric-row">

          <Metric
            label="Length"
            value={`${m.length} chars`}
            pct={Math.min(
              100,
              m.length / 16 * 100
            )}
          />

          <Metric
            label="Character types"
            value={`${m.character_types}/4`}
            pct={
              m.character_types / 4 * 100
            }
          />

          <Metric
            label="Unique ratio"
            value={`${Math.round(
              (m.unique_character_ratio || 0) * 100
            )}%`}
            pct={
              (m.unique_character_ratio || 0) * 100
            }
          />

        </div>

        <div className="action-row">

          <button
            className="primary"
            onClick={onSave}
            disabled={!password}
          >
            {saved ? (
              <>
                <CheckCircle2 size={16} />
                Saved safely
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Save aggregate result
              </>
            )}
          </button>

          <span className="privacy-inline">
            <LockKeyhole size={14} />
            No plaintext storage
          </span>

        </div>

      </div>

      <div className="analysis-side">

        <div className="panel">

          <div className="panel-head">

            <h3>Findings</h3>

            <span className="count-badge">
              {analysis.findings.length}
            </span>

          </div>

          {analysis.findings.length ? (

            analysis.findings.map((f, i) => (

              <div
                className="finding"
                key={i}
              >

                <div
                  className={`finding-icon ${
                    severityIcon[f.severity] || 'warn'
                  }`}
                >
                  <TriangleAlert size={15} />
                </div>

                <div>
                  <b>{f.title}</b>
                  <p>{f.description}</p>
                </div>

              </div>

            ))

          ) : (

            <div className="empty">

              <CheckCircle2 size={26} />

              <b>
                No weaknesses detected yet
              </b>

              <span>
                Type a password to see real-time
                analysis.
              </span>

            </div>

          )}

        </div>

        <div className="panel">

          <div className="panel-head">

            <h3>Security Suggestions</h3>

            <Sparkles size={17} />

          </div>

          <ul className="suggestions">

            {analysis.suggestions.map(
              (s, i) => (

                <li key={i}>
                  <CheckCircle2 size={15} />
                  {s}
                </li>

              )
            )}

          </ul>

        </div>

        <div className="panel entropy">

          <div>

            <span className="eyebrow">
              THEORETICAL ESTIMATE
            </span>

            <h3>
              {m.theoretical_entropy_bits || 0}
              {' '}
              bits
            </h3>

            <p>
              Entropy is an estimate assuming
              random character selection.
              Human-created passwords can be
              much more predictable.
            </p>

          </div>

          <Gauge size={32} />

        </div>

      </div>

    </div>
  )
}


function Metric({
  label,
  value,
  pct
}) {

  return (
    <div className="metric">

      <div>
        <span>{label}</span>
        <b>{value}</b>
      </div>

      <div className="progress">
        <i
          style={{
            width: `${Math.min(
              100,
              pct
            )}%`
          }}
        />
      </div>

    </div>
  )
}


function Generator({ onGenerate }) {

  const [length, setLength] = useState(20)
  const [passphrase, setPassphrase] =
    useState(false)

  const [generated, setGenerated] =
    useState('')

  const [copied, setCopied] =
    useState(false)

  async function run() {

    const payload = passphrase
      ? {
          passphrase_words: 5,
          length
        }
      : {
          length,
          uppercase: true,
          lowercase: true,
          numbers: true,
          symbols: true
        }

    const result = await generate(payload)

    setGenerated(result.password)
  }

  async function copy() {

    if (!generated) return

    await navigator.clipboard?.writeText(
      generated
    )

    setCopied(true)

    setTimeout(
      () => setCopied(false),
      1500
    )
  }

  return (
    <div className="generator-layout">

      <div className="panel generator-card">

        <div className="panel-head">

          <div>

            <h3>
              Secure Password Generator
            </h3>

            <small>
              Uses Python <code>secrets</code>
              for cryptographically secure
              randomness.
            </small>

          </div>

          <span className="secure-chip">
            <ShieldCheck size={14} />
            NO STORAGE
          </span>

        </div>

        <div className="toggle-row">

          <button
            className={
              !passphrase
                ? 'selected'
                : ''
            }
            onClick={() =>
              setPassphrase(false)
            }
          >
            Random password
          </button>

          <button
            className={
              passphrase
                ? 'selected'
                : ''
            }
            onClick={() =>
              setPassphrase(true)
            }
          >
            Random passphrase
          </button>

        </div>

        {!passphrase && (
          <>
            <label className="field-label">
              LENGTH — {length}
            </label>

            <input
              className="range"
              type="range"
              min="16"
              max="32"
              value={length}
              onChange={e =>
                setLength(+e.target.value)
              }
            />

            <div className="check-grid">
              <Check label="Uppercase" />
              <Check label="Lowercase" />
              <Check label="Numbers" />
              <Check label="Symbols" />
            </div>
          </>
        )}

        {passphrase && (
          <div className="passphrase-info">

            <WandSparkles size={22} />

            <p>
              Randomly selected fictional words
              can make a long passphrase easier
              to remember. Never reuse the
              examples shown here.
            </p>

          </div>
        )}

        <button
          className="primary wide"
          onClick={run}
        >
          <WandSparkles size={17} />
          Generate Secure Credential
        </button>

        {generated && (
          <div className="generated">

            <span>
              Generated in memory
            </span>

            <div>

              <code>{generated}</code>

              <button onClick={copy}>
                {copied
                  ? <CheckCircle2 />
                  : <Copy />}
              </button>

            </div>

            <small>
              It is not saved by this
              application. Clipboard access
              is controlled by your browser.
            </small>

          </div>
        )}

      </div>

      <div className="panel">

        <div className="panel-head">

          <h3>Generator principles</h3>

          <LockKeyhole size={17} />

        </div>

        <div className="principles">

          <p>
            <b>✓ Secure randomness</b>
            <span>
              Python secrets instead of
              general-purpose random.
            </span>
          </p>

          <p>
            <b>✓ Long by default</b>
            <span>
              16–128 character supported range.
            </span>
          </p>

          <p>
            <b>✓ No persistence</b>
            <span>
              Generated values are not written
              to analytics or local storage.
            </span>
          </p>

        </div>

      </div>

    </div>
  )
}


function Check({ label }) {

  return (
    <div className="check">
      <CheckCircle2 size={15} />
      {label}
    </div>
  )
}


function SecurityCenter() {

  const rules = [
    'Use a unique password for every important account.',
    'Prefer longer passwords or passphrases.',
    'Avoid names, birthdays, company names and predictable facts.',
    'Avoid common passwords and keyboard patterns.',
    'Never reuse credentials across services.',
    'Use a reputable password manager.',
    'Enable MFA wherever available.',
    'Never share passwords through chat or email.',
    'Treat unexpected login links and reset requests as phishing risks.',
    'Change credentials when compromise is suspected or confirmed.'
  ]

  return (
    <div className="security-grid">

      <div className="panel">

        <div className="panel-head">

          <div>
            <h3>Security Center</h3>
            <small>
              Practical authentication hygiene
            </small>
          </div>

          <ShieldCheck size={20} />

        </div>

        <div className="security-hero">

          <div className="big-shield">
            <ShieldCheck size={48} />
          </div>

          <div>

            <h2>
              Password strength is one layer.
            </h2>

            <p>
              Real-world authentication also
              depends on MFA, secure password
              hashing, rate limiting, session
              security, phishing resistance
              and monitoring.
            </p>

          </div>

        </div>

        <div className="rule-grid">

          {rules.map((r, i) => (

            <div
              className="rule"
              key={i}
            >

              <span>
                {String(i + 1).padStart(2, '0')}
              </span>

              <p>{r}</p>

            </div>

          ))}

        </div>

      </div>

      <div className="panel">

        <div className="panel-head">

          <h3>Secure Storage Concepts</h3>

          <LockKeyhole size={17} />

        </div>

        <div className="storage-list">

          <div>
            <b>Hashing</b>
            <span>
              One-way verification rather than
              reversible encryption.
            </span>
          </div>

          <div>
            <b>Salt</b>
            <span>
              Unique salt prevents identical
              passwords from producing identical
              stored hashes.
            </span>
          </div>

          <div>
            <b>Key stretching</b>
            <span>
              Argon2id, bcrypt, scrypt and PBKDF2
              make offline guessing more expensive.
            </span>
          </div>

          <div>
            <b>MFA</b>
            <span>
              A second factor reduces reliance
              on the password alone.
            </span>
          </div>

        </div>

      </div>

    </div>
  )
}


function Education() {

  return (
    <div className="education-grid">

      <div className="panel article">

        <span className="pill">
          PASSWORD 101
        </span>

        <h2>
          What makes a password strong?
        </h2>

        <p>
          A strong password is not simply a
          mix of uppercase letters, numbers
          and symbols. The goal is high
          unpredictability and resistance
          to common guessing strategies.
        </p>

        <div className="formula">
          LENGTH + UNPREDICTABILITY +
          PATTERN RESISTANCE + CONTEXT
        </div>

        <div className="edu-cards">

          <div>
            <b>Length</b>
            <span>
              Longer credentials provide more
              possible combinations.
            </span>
          </div>

          <div>
            <b>Unpredictability</b>
            <span>
              Avoid common words, dates,
              sequences and known patterns.
            </span>
          </div>

          <div>
            <b>Passphrases</b>
            <span>
              Random word combinations can be
              memorable and long.
            </span>
          </div>

          <div>
            <b>MFA</b>
            <span>
              Use another factor to reduce
              account takeover risk.
            </span>
          </div>

        </div>

      </div>

      <div className="panel article">

        <span className="pill">
          WHY COMPOSITION FAILS
        </span>

        <h2>
          Why Password123! can still be weak
        </h2>

        <p>
          It may satisfy a traditional
          composition policy while remaining
          highly predictable. This analyzer
          therefore combines composition signals
          with common-password, dictionary,
          keyboard, sequence, repetition and
          context checks.
        </p>

        <div className="callout">

          <TriangleAlert size={20} />

          <span>
            Project score bands are defined for
            this educational tool. They are not
            a universal industry standard.
          </span>

        </div>

      </div>

    </div>
  )
}


export default App