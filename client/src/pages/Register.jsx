import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../store/authSlice'
import { Mail, Lock, User, Phone, Loader2, Briefcase, MapPin } from 'lucide-react'

const SERVICES = [
    { id: 'cleaning', label: 'Cleaning' },
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'ac-repair', label: 'AC Repair' },
    { id: 'painting', label: 'Painting' },
    { id: 'carpentry', label: 'Carpentry' },
    { id: 'pest-control', label: 'Pest Control' },
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
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">CF</span>
                    </div>
                    <h1 className="text-2xl font-bold text-secondary-900">Create an account</h1>
                    <p className="text-secondary-600 mt-2">Join CleanFanatics today</p>
                </div>

                <div className="card">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label">I want to</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                                    className={`p-3 rounded-lg border-2 text-center transition-colors
                    ${formData.role === 'customer'
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-secondary-200 hover:border-secondary-300'}`}
                                >
                                    <User className="mx-auto mb-1" size={20} />
                                    <span className="text-sm font-medium">Book Services</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'provider' })}
                                    className={`p-3 rounded-lg border-2 text-center transition-colors
                    ${formData.role === 'provider'
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-secondary-200 hover:border-secondary-300'}`}
                                >
                                    <Briefcase className="mx-auto mb-1" size={20} />
                                    <span className="text-sm font-medium">Provide Services</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input pl-10"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input pl-10"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input pl-10"
                                    placeholder="+91 98765 43210"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>

                        {formData.role === 'provider' && (
                            <>
                                <div>
                                    <label className="label">City</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={18} />
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="input pl-10"
                                            placeholder="Your city"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Services you provide</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {SERVICES.map((service) => (
                                            <button
                                                key={service.id}
                                                type="button"
                                                onClick={() => handleServiceToggle(service.id)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${formData.services.includes(service.id)
                                                        ? 'bg-primary-600 text-white'
                                                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'}`}
                                            >
                                                {service.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || (formData.role === 'provider' && formData.services.length === 0)}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Creating account...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-secondary-600 text-sm mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
