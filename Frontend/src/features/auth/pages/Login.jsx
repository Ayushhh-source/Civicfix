import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate('/')
    }

    if (loading) {
        return (<main className='loading-screen'><h1>Loading…</h1></main>)
    }

    return (
        <main className='auth-page'>
            <div className='auth-card'>

                <div className='auth-card__brand'>
                    <span className='auth-card__brand-mark'>P</span>
                    <span className='auth-card__brand-name'>PrepAir</span>
                </div>

                <h1 className='auth-card__title'>Welcome back.</h1>
                <p className='auth-card__subtitle'>Pick up where you left off and prep for your next interview.</p>

                <form className='auth-card__form' onSubmit={handleSubmit}>

                    <div className='field'>
                        <input
                            id='email'
                            name='email'
                            type='email'
                            placeholder=' '
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label htmlFor='email'>Email address</label>
                    </div>

                    <div className='field'>
                        <input
                            id='password'
                            name='password'
                            type='password'
                            placeholder=' '
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label htmlFor='password'>Password</label>
                    </div>

                    <button className='button primary-button' type='submit'>
                        Sign in
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </button>
                </form>

                <p className='auth-card__footer'>
                    New here? <Link to={"/register"}>Create an account</Link>
                </p>
            </div>
        </main>
    )
}

export default Login
