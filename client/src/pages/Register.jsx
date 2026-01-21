import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../store/authSlice'
import { Loader2, Briefcase, Sparkles, Check, User } from 'lucide-react'

const SERVICES = [
    { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
    { id: 'plumbing', label: 'Plumbing', icon: '🔧' },
    { id: 'electrical', label: 'Electrical', icon: '💡' },
    { id: 'ac-repair', label: 'AC Repair', icon: '❄️' },
    { id: 'painting', label: 'Painting', icon: '🎨' },
    { id: 'carpentry', label: 'Carpentry', icon: '🪚' },
    { id: 'pest-control', label: 'Pest Control', icon: '🐜' },
]

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'customer',
        services: [],
        city: '',
    })

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isLoading, error } = useSelector((state) => state.auth)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (error) dispatch(clearError())
    }

    const handleServiceToggle = (serviceId) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(serviceId)
                ? prev.services.filter(s => s !== serviceId)
                : [...prev.services, serviceId]
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            role: formData.role,
        }

        if (formData.role === 'provider') {
            userData.services = formData.services
            userData.location = { city: formData.city }
        }

        const result = await dispatch(register(userData))
        if (register.fulfilled.match(result)) {
            const role = result.payload.role
            if (role === 'customer') navigate('/dashboard')
            else if (role === 'provider') navigate('/provider')
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
                    <h2 className="text-4xl font-bold mb-4">
                        {formData.role === 'customer'
                            ? 'Get Things Done, Effortlessly'
                            : 'Grow Your Business With Us'}
                    </h2>
                    <p className="text-primary-100 text-lg mb-8">
                        {formData.role === 'customer'
                            ? 'Book trusted home service professionals in just a few clicks. Quality guaranteed.'
                            : 'Join our network of professionals. Get more customers and grow your income.'}
                    </p>
                    <div className="space-y-4">
                        {formData.role === 'customer' ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Check size={16} />
                                    </div>
                                    <span>Verified & Background-checked Providers</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Check size={16} />
                                    </div>
                                    <span>Transparent Pricing</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Check size={16} />
                                    </div>
                                    <span>Real-time Tracking</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Check size={16} />
                                    </div>
                                    <span>Set Your Own Schedule</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Check size={16} />
                                    </div>
                                    <span>Fair Commission Rates</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <Check size={16} />
                                    </div>
                                    <span>Weekly Payouts</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
                <div className="max-w-md w-full animate-fade-in">
                    <div className="text-center mb-6 lg:hidden">
                        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Sparkles className="text-white" size={24} />
                        </div>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-secondary-900">Create an account</h1>
                        <p className="text-secondary-500 mt-2">Join CleanFanatics today</p>
                    </div>

                    <div className="card-static">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-medium animate-fade-in">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="label">I want to</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'customer' })}
                                        className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${formData.role === 'customer'
                                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                                            : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
                                            }`}
                                    >
                                        <User className="mx-auto mb-2" size={24} />
                                        <span className="text-sm font-semibold">Book Services</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'provider' })}
                                        className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${formData.role === 'provider'
                                            ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                                            : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
                                            }`}
                                    >
                                        <Briefcase className="mx-auto mb-2" size={24} />
                                        <span className="text-sm font-semibold">Provide Services</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="you@email.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="9876543210"
                                        required
                                    />
                                </div>
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
                                    minLength={6}
                                    required
                                />
                            </div>

                            {formData.role === 'provider' && (
                                <div className="space-y-5 pt-2 animate-fade-in">
                                    <div>
                                        <label className="label">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="input"
                                            placeholder="Your city"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Services you provide</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {SERVICES.map((service) => (
                                                <button
                                                    key={service.id}
                                                    type="button"
                                                    onClick={() => handleServiceToggle(service.id)}
                                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${formData.services.includes(service.id)
                                                        ? 'bg-primary-600 text-white shadow-sm'
                                                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                                        }`}
                                                >
                                                    <span>{service.icon}</span>
                                                    {service.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || (formData.role === 'provider' && formData.services.length === 0)}
                                className="btn-primary w-full h-12 flex items-center justify-center gap-2 text-base mt-6"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create account'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-secondary-100 text-center">
                            <p className="text-secondary-600">
                                Already have an account?{' '}
                                <Link to="/login" className="link">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
