import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {

    const navigate = useNavigate()
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleRegister({ username, email, password })
        navigate("/")
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

                <h1 className='auth-card__title'>Make your first plan.</h1>
                <p className='auth-card__subtitle'>Tell us a little about yourself — we'll generate the rest.</p>

                <form className='auth-card__form' onSubmit={handleSubmit}>

                    <div className='field'>
                        <input
                            id='username'
                            name='username'
                            type='text'
                            placeholder=' '
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <label htmlFor='username'>Username</label>
                    </div>

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
                        Create account
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </button>
                </form>

                <p className='auth-card__footer'>
                    Already have an account? <Link to={"/login"}>Sign in</Link>
                </p>
            </div>
        </main>
    )
}

export default Register
