import React, { useState, useRef } from 'react'
import "../style/home.scss"
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate } from 'react-router'

const MAX_JD_CHARS = 5000

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ selfDescription, setSelfDescription ] = useState("")
    const [ resumeName, setResumeName ] = useState("")
    const [ dragActive, setDragActive ] = useState(false)
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const handleGenerateReport = async () => {
        const resumeFile = resumeInputRef.current?.files?.[ 0 ]
        const data = await generateReport({ jobDescription, selfDescription, resumeFile })
        if (data?._id) navigate(`/interview/${data._id}`)
    }

    const handleFilePicked = () => {
        const file = resumeInputRef.current?.files?.[ 0 ]
        setResumeName(file?.name || "")
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        const file = e.dataTransfer.files?.[ 0 ]
        if (file && resumeInputRef.current) {
            const dt = new DataTransfer()
            dt.items.add(file)
            resumeInputRef.current.files = dt.files
            setResumeName(file.name)
        }
    }

    const canSubmit = jobDescription.trim().length > 0 || selfDescription.trim().length > 0 || !!resumeName

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Crafting your interview plan…</h1>
            </main>
        )
    }

    return (
        <div className='home-page'>

            {/* Top bar */}
            <header className='home-topbar'>
                <button
                    className='home-topbar__back'
                    onClick={() => navigate('/')}
                    type='button'
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Dashboard
                </button>
                <div className='home-topbar__pill'>
                    <span className='dot' />
                    New interview plan
                </div>
            </header>

            {/* Hero */}
            <section className='home-hero'>
                <span className='home-hero__eyebrow'>✦ AI-powered prep</span>
                <h1>
                    Walk in <span className='highlight'>fully prepared.</span>
                </h1>
                <p>
                    Drop in a job description and your background. We'll build the questions,
                    answers, and study plan so you can focus on showing up sharp.
                </p>
            </section>

            {/* Main card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left panel — Job description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={MAX_JD_CHARS}
                        />
                        <div className='char-counter'>{jobDescription.length} / {MAX_JD_CHARS} chars</div>
                    </div>

                    <div className='panel-divider' />

                    {/* Right panel — Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>
                            <label
                                className={`dropzone${dragActive ? ' dropzone--active' : ''}${resumeName ? ' dropzone--has-file' : ''}`}
                                htmlFor='resume'
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={handleDrop}
                            >
                                <span className='dropzone__icon'>
                                    {resumeName ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                                    )}
                                </span>
                                <p className='dropzone__title'>
                                    {resumeName ? resumeName : 'Click to upload or drag & drop'}
                                </p>
                                <p className='dropzone__subtitle'>
                                    {resumeName ? 'Tap to replace · PDF or DOCX' : 'PDF or DOCX (Max 5MB)'}
                                </p>
                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type='file'
                                    id='resume'
                                    name='resume'
                                    accept='.pdf,.docx'
                                    onChange={handleFilePicked}
                                />
                            </label>
                        </div>

                        <div className='or-divider'><span>OR</span></div>

                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2.5" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2.5" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                <div className='interview-card__footer'>
                    <span className='footer-info'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        AI-powered strategy · approx. 30s
                    </span>
                    <button
                        onClick={handleGenerateReport}
                        disabled={!canSubmit}
                        className='generate-btn'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            <footer className='page-footer'>
                <a href='#'>Privacy</a>
                <a href='#'>Terms</a>
                <a href='#'>Help center</a>
            </footer>
        </div>
    )
}

export default Home
