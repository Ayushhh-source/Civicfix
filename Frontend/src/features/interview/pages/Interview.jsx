import React, { useState, useEffect, useRef } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'

const NAV_ITEMS = [
    { id: 'technical', label: 'Technical', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>) },
    { id: 'behavioral', label: 'Behavioral', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
    { id: 'roadmap', label: 'Road Map', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>) },
]

// ── Animated count-up hook ────────────────────────────────────────
const useCountUp = (target, duration = 1400) => {
    const [ value, setValue ] = useState(0)
    const startedAt = useRef(null)
    const rafId = useRef(null)

    useEffect(() => {
        startedAt.current = null
        const tick = (ts) => {
            if (startedAt.current === null) startedAt.current = ts
            const progress = Math.min(1, (ts - startedAt.current) / duration)
            // ease-out-cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(target * eased))
            if (progress < 1) rafId.current = requestAnimationFrame(tick)
        }
        rafId.current = requestAnimationFrame(tick)
        return () => rafId.current && cancelAnimationFrame(rafId.current)
    }, [ target, duration ])

    return value
}

// ── Match score ring ──────────────────────────────────────────────
const MatchScoreRing = ({ score }) => {
    const value = useCountUp(score)
    const size = 160
    const stroke = 12
    const radius = (size - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (value / 100) * circumference

    return (
        <div className='score-ring'>
            <svg width={size} height={size}>
                <defs>
                    <linearGradient id='score-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                        <stop offset='0%' stopColor='#8b5cf6' />
                        <stop offset='60%' stopColor='#ec4899' />
                        <stop offset='100%' stopColor='#f59e0b' />
                    </linearGradient>
                </defs>
                <circle
                    className='score-ring__track'
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                />
                <circle
                    className='score-ring__progress'
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className='score-ring__value'>
                <span className='num'>{value}</span>
                <span className='pct'>%</span>
            </div>
        </div>
    )
}

// ── Question card ─────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className='q-card'>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Roadmap day ───────────────────────────────────────────────────
const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks.map((task, i) => (
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
            ))}
        </ul>
    </div>
)

// ── Page ──────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])

    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan…</h1>
            </main>
        )
    }

    return (
        <div className='interview-page'>

            {/* Top bar */}
            <div className='interview-topbar'>
                <button
                    className='interview-topbar__back'
                    onClick={() => navigate('/')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    All plans
                </button>
                <p className='interview-topbar__title'>{report.title || 'Untitled Position'}</p>
            </div>

            <div className='interview-layout'>

                {/* ── Left nav ── */}
                <nav className='interview-nav'>
                    <div className='nav-content'>
                        <p className='interview-nav__label'>Sections</p>
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                <span className='interview-nav__icon'>{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => getResumePdf(interviewId)}
                        className='button primary-button sidebar-download'
                    >
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                            <polyline points='7 10 12 15 17 10' />
                            <line x1='12' y1='15' x2='12' y2='3' />
                        </svg>
                        Download Resume
                    </button>
                </nav>

                {/* ── Center content ── */}
                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <section key='technical'>
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__count'>{report.technicalQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section key='behavioral'>
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__count'>{report.behavioralQuestions.length} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section key='roadmap'>
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <span className='content-header__count'>{report.preparationPlan.length}-day plan</span>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* ── Right sidebar ── */}
                <aside className='interview-sidebar'>

                    <div className='match-score-card'>
                        <p className='match-score-card__label'>Match Score</p>
                        <MatchScoreRing score={report.matchScore || 0} />
                        <p className='match-score-card__sub'>
                            {report.matchScore >= 80
                                ? 'Strong match for this role'
                                : report.matchScore >= 60
                                    ? 'Solid foundation — close some gaps'
                                    : 'Worth preparing — gaps are addressable'}
                        </p>
                    </div>

                    <div className='sidebar-divider' />

                    <div className='skill-gaps'>
                        <p className='skill-gaps__label'>Skill Gaps</p>
                        <div className='skill-gaps__list'>
                            {report.skillGaps.map((gap, i) => (
                                <span
                                    key={i}
                                    className={`skill-tag skill-tag--${gap.severity}`}
                                    style={{ animationDelay: `${i * 60}ms` }}
                                >
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </div>

                </aside>
            </div>
        </div>
    )
}

export default Interview
