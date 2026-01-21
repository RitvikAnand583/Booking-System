import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../store/authSlice'
import { Loader2, Sparkles } from 'lucide-react'

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isLoading, error } = useSelector((state) => state.auth)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (error) dispatch(clearError())
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await dispatch(login(formData))
        if (login.fulfilled.match(result)) {
            const role = result.payload.role
            if (role === 'customer') navigate('/dashboard')
            else if (role === 'provider') navigate('/provider')
            else if (role === 'admin') navigate('/admin')
        }
    }

    return (
        <div className="min-h-screen bg-secondary-50 flex">
            <div className="hidden lg:flex lg:w-1/2 bg-primary-600 items-center justify-center p-12">
                <div className="max-w-md text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Sparkles size={24} />
                        </div>
                        <span className="text-2xl font-bold">CleanFanatics</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-4">Professional Home Services at Your Fingertips</h2>
                    <p className="text-primary-100 text-lg">
                        Book trusted professionals for cleaning, plumbing, electrical work, and more.
                        Fast, reliable, and hassle-free.
                    </p>
                    <div className="mt-12 grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                            <p className="text-3xl font-bold">500+</p>
                            <p className="text-sm text-primary-200">Providers</p>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                            <p className="text-3xl font-bold">10k+</p>
                            <p className="text-sm text-primary-200">Bookings</p>
                        </div>
                        <div className="text-center p-4 bg-white/10 rounded-xl">
                            <p className="text-3xl font-bold">4.9★</p>
                            <p className="text-sm text-primary-200">Rating</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="max-w-md w-full animate-fade-in">
                    <div className="text-center mb-8 lg:hidden">
                        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Sparkles className="text-white" size={28} />
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-secondary-900">Welcome back</h1>
                        <p className="text-secondary-500 mt-2">Sign in to continue to your dashboard</p>
                    </div>

                    <div className="card-static">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium animate-fade-in">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full h-12 flex items-center justify-center gap-2 text-base"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-secondary-100 text-center">
                            <p className="text-secondary-600">
                                Don't have an account?{' '}
                                <Link to="/register" className="link">
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
