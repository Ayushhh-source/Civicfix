import React, { useMemo } from 'react'
import { useNavigate } from 'react-router'
import '../style/dashboard.scss'
import '../style/home.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'

const Dashboard = () => {
    const navigate = useNavigate()
    const { reports, loading } = useInterview()
    const { user, handleLogout } = useAuth()

    const stats = useMemo(() => {
        if (!reports || reports.length === 0) {
            return { total: 0, avg: 0, best: 0 }
        }
        const total = reports.length
        const avg = Math.round(
            reports.reduce((sum, r) => sum + (r.matchScore || 0), 0) / total
        )
        const best = Math.max(...reports.map(r => r.matchScore || 0))
        return { total, avg, best }
    }, [ reports ])

    const greetingName = user?.username
        ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
        : 'there'

    const initial = (user?.username || user?.email || 'U').charAt(0).toUpperCase()

    const onLogout = async () => {
        await handleLogout()
        navigate('/login')
    }

    if (loading && reports.length === 0) {
        return (
            <main className='loading-screen'>
                <h1>Loading your dashboard…</h1>
            </main>
        )
    }

    return (
        <div className='dashboard-page'>

            {/* Top bar */}
            <header className='dash-topbar'>
                <div className='dash-topbar__brand'>
                    <span className='brand-mark'>P</span>
                    <span>PrepAir</span>
                </div>
                <div className='dash-topbar__user'>
                    <span className='dash-topbar__avatar'>{initial}</span>
                    <span>{user?.username || user?.email || 'User'}</span>
                    <button
                        className='dash-topbar__logout'
                        onClick={onLogout}
                        type='button'
                    >
                        Sign out
                    </button>
                </div>
            </header>

            {/* Hero / CTA */}
            <section className='dash-hero'>
                <div className='dash-hero__copy'>
                    <span className='dash-hero__eyebrow'>✦ Dashboard</span>
                    <h1>Welcome back, <span className='highlight'>{greetingName}.</span></h1>
                    <p>
                        {reports.length > 0
                            ? `You have ${reports.length} interview ${reports.length === 1 ? 'plan' : 'plans'} on file. Pick up where you left off, or start a fresh one for a new role.`
                            : `Let's build your first interview plan. Drop in a job description and your background — we'll handle the rest.`
                        }
                    </p>
                </div>
                <button
                    className='dash-cta'
                    onClick={() => navigate('/new')}
                    type='button'
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New interview plan
                </button>
            </section>

            {/* Stats */}
            {reports.length > 0 && (
                <section className='dash-stats'>
                    <div className='stat-card'>
                        <span className='stat-card__icon'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                <line x1="9" y1="9" x2="15" y2="9" />
                                <line x1="9" y1="13" x2="15" y2="13" />
                                <line x1="9" y1="17" x2="13" y2="17" />
                            </svg>
                        </span>
                        <div className='stat-card__body'>
                            <span className='stat-card__label'>Plans created</span>
                            <span className='stat-card__value'>{stats.total}</span>
                        </div>
                    </div>

                    <div className='stat-card'>
                        <span className='stat-card__icon'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </span>
                        <div className='stat-card__body'>
                            <span className='stat-card__label'>Average match</span>
                            <span className='stat-card__value'>{stats.avg}<span className='suffix'>%</span></span>
                        </div>
                    </div>

                    <div className='stat-card'>
                        <span className='stat-card__icon'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 9V2h12v7" />
                                <path d="M6 9a6 6 0 0 0 12 0" />
                                <path d="M12 15v6" />
                                <path d="M9 21h6" />
                            </svg>
                        </span>
                        <div className='stat-card__body'>
                            <span className='stat-card__label'>Best match</span>
                            <span className='stat-card__value'>{stats.best}<span className='suffix'>%</span></span>
                        </div>
                    </div>
                </section>
            )}

            {/* Plans list or empty state */}
            {reports.length > 0 ? (
                <section className='dash-plans'>
                    <div className='dash-plans__header'>
                        <h2>
                            Your plans
                            <span className='count-pill'>{reports.length}</span>
                        </h2>
                    </div>
                    <ul className='dash-plans-list'>
                        {reports.map(report => {
                            const score = report.matchScore ?? 0
                            const tone = score >= 80 ? 'score--high' : score >= 60 ? 'score--mid' : 'score--low'
                            return (
                                <li
                                    key={report._id}
                                    className='report-item'
                                    onClick={() => navigate(`/interview/${report._id}`)}
                                >
                                    <h3>{report.title || 'Untitled Position'}</h3>
                                    <p className='report-meta'>
                                        Generated {new Date(report.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className={`match-score ${tone}`}>
                                        Match {score}%
                                    </p>
                                </li>
                            )
                        })}
                    </ul>
                </section>
            ) : (
                <section className='empty-state'>
                    <span className='empty-state__icon'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                    </span>
                    <h3>No plans yet</h3>
                    <p>Tap the button above to generate your first interview prep plan. It only takes a job description and a quick profile.</p>
                </section>
            )}
        </div>
    )
}

export default Dashboard
