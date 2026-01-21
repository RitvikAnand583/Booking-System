import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createBooking } from '../../store/bookingSlice'
import { Calendar, Clock, MapPin, FileText, Loader2, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react'

const SERVICES = [
    { id: 'cleaning', label: 'Home Cleaning', icon: '🧹', price: 500, description: 'Deep cleaning for your home', color: 'bg-emerald-100 border-emerald-200' },
    { id: 'plumbing', label: 'Plumbing', icon: '🔧', price: 400, description: 'Fix leaks, pipes, and drainage', color: 'bg-blue-100 border-blue-200' },
    { id: 'electrical', label: 'Electrical', icon: '💡', price: 450, description: 'Wiring, fixtures, and repairs', color: 'bg-amber-100 border-amber-200' },
    { id: 'ac-repair', label: 'AC Repair', icon: '❄️', price: 600, description: 'AC servicing and repairs', color: 'bg-cyan-100 border-cyan-200' },
    { id: 'painting', label: 'Painting', icon: '🎨', price: 800, description: 'Interior and exterior painting', color: 'bg-pink-100 border-pink-200' },
    { id: 'carpentry', label: 'Carpentry', icon: '🪚', price: 550, description: 'Furniture repairs and custom work', color: 'bg-orange-100 border-orange-200' },
    { id: 'pest-control', label: 'Pest Control', icon: '🐜', price: 700, description: 'Eliminate pests from your home', color: 'bg-red-100 border-red-200' },
]

const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
]

const STEPS = [
    { id: 1, label: 'Service' },
    { id: 2, label: 'Schedule' },
    { id: 3, label: 'Address' }
]

function NewBooking() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        service: '',
        scheduledDate: '',
        scheduledTime: '',
        address: {
            street: '',
            city: '',
            pincode: ''
        },
        description: ''
    })

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { isLoading } = useSelector((state) => state.bookings)

    const selectedService = SERVICES.find(s => s.id === formData.service)

    const handleServiceSelect = (serviceId) => {
        setFormData({ ...formData, service: serviceId })
        setStep(2)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name.startsWith('address.')) {
            const field = name.split('.')[1]
            setFormData({
                ...formData,
                address: { ...formData.address, [field]: value }
            })
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const bookingData = {
            ...formData,
            estimatedPrice: selectedService?.price || 0
        }
        const result = await dispatch(createBooking(bookingData))
        if (createBooking.fulfilled.match(result)) {
            navigate('/dashboard')
        }
    }

    const canProceedToStep3 = formData.scheduledDate && formData.scheduledTime
    const canSubmit = formData.address.street && formData.address.city && formData.address.pincode

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
                className="flex items-center gap-2 text-secondary-500 hover:text-secondary-900 mb-6 font-medium transition-colors"
            >
                <ArrowLeft size={20} />
                {step > 1 ? 'Back' : 'Cancel'}
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-secondary-900">Book a Service</h1>
                <p className="text-secondary-500 mt-1">Complete the steps below to schedule your service</p>

                <div className="flex items-center gap-2 mt-6">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center flex-1">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${step > s.id
                                    ? 'bg-emerald-500 text-white'
                                    : step === s.id
                                        ? 'bg-primary-600 text-white shadow-lg'
                                        : 'bg-secondary-100 text-secondary-400'
                                }`}>
                                {step > s.id ? <CheckCircle size={20} /> : s.id}
                            </div>
                            <span className={`ml-3 font-semibold hidden sm:block ${step >= s.id ? 'text-secondary-900' : 'text-secondary-400'
                                }`}>{s.label}</span>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-1 mx-4 rounded-full ${step > s.id ? 'bg-emerald-500' : 'bg-secondary-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {step === 1 && (
                <div className="animate-fade-in">
                    <h2 className="text-xl font-bold text-secondary-900 mb-4">What do you need help with?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {SERVICES.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => handleServiceSelect(service.id)}
                                className={`card-interactive text-left border-2 ${formData.service === service.id
                                        ? 'border-primary-500 bg-primary-50'
                                        : `${service.color}`
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-4xl">{service.icon}</span>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-secondary-900 text-lg">{service.label}</h3>
                                        <p className="text-sm text-secondary-500 mt-1">{service.description}</p>
                                        <p className="text-primary-600 font-bold text-lg mt-2">₹{service.price}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-fade-in">
                    <h2 className="text-xl font-bold text-secondary-900 mb-4">When works for you?</h2>
                    <div className="card-static">
                        <div className="mb-6">
                            <label className="label flex items-center gap-2">
                                <Calendar size={18} className="text-primary-600" />
                                Select Date
                            </label>
                            <input
                                type="date"
                                name="scheduledDate"
                                value={formData.scheduledDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="input"
                                required
                            />
                        </div>

                        <div>
                            <label className="label flex items-center gap-2">
                                <Clock size={18} className="text-primary-600" />
                                Select Time Slot
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {TIME_SLOTS.map((time) => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, scheduledTime: time })}
                                        className={`px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${formData.scheduledTime === time
                                                ? 'bg-primary-600 text-white shadow-md'
                                                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                            }`}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(3)}
                            disabled={!canProceedToStep3}
                            className="btn-primary w-full mt-8 h-12 flex items-center justify-center gap-2"
                        >
                            Continue <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <form onSubmit={handleSubmit} className="animate-fade-in">
                    <h2 className="text-xl font-bold text-secondary-900 mb-4">Where should we come?</h2>
                    <div className="card-static mb-6">
                        <div className="space-y-5">
                            <div>
                                <label className="label flex items-center gap-2">
                                    <MapPin size={18} className="text-primary-600" />
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="123 Main Street, Apartment 4B"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">City</label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Mumbai"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Pincode</label>
                                    <input
                                        type="text"
                                        name="address.pincode"
                                        value={formData.address.pincode}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="400001"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label flex items-center gap-2">
                                    <FileText size={18} className="text-primary-600" />
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="input"
                                    rows={3}
                                    placeholder="Any specific instructions for the service provider..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-static bg-primary-50 border-primary-100 mb-6">
                        <h3 className="font-bold text-secondary-900 mb-4">Booking Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-secondary-600">Service</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{selectedService?.icon}</span>
                                    <span className="font-semibold">{selectedService?.label}</span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary-600">Date & Time</span>
                                <span className="font-semibold">{formData.scheduledDate} • {formData.scheduledTime}</span>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-primary-200">
                                <span className="text-secondary-900 font-bold text-base">Total</span>
                                <span className="text-primary-600 font-bold text-2xl">₹{selectedService?.price || 0}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!canSubmit || isLoading}
                        className="btn-primary w-full h-14 flex items-center justify-center gap-2 text-lg"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={22} />
                                Creating Booking...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={22} />
                                Confirm Booking
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    )
}

export default NewBooking
