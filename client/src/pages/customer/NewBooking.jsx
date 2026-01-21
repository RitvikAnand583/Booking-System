import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createBooking } from '../../store/bookingSlice'
import { Calendar, Clock, MapPin, FileText, Loader2, ArrowLeft, CreditCard } from 'lucide-react'

const SERVICES = [
    { id: 'cleaning', label: 'Home Cleaning', icon: '🧹', price: 500, description: 'Deep cleaning for your home' },
    { id: 'plumbing', label: 'Plumbing', icon: '🔧', price: 400, description: 'Fix leaks, pipes, and drainage' },
    { id: 'electrical', label: 'Electrical', icon: '💡', price: 450, description: 'Wiring, fixtures, and repairs' },
    { id: 'ac-repair', label: 'AC Repair', icon: '❄️', price: 600, description: 'AC servicing and repairs' },
    { id: 'painting', label: 'Painting', icon: '🎨', price: 800, description: 'Interior and exterior painting' },
    { id: 'carpentry', label: 'Carpentry', icon: '🪚', price: 550, description: 'Furniture repairs and custom work' },
    { id: 'pest-control', label: 'Pest Control', icon: '🐜', price: 700, description: 'Eliminate pests from your home' },
]

const TIME_SLOTS = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
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
                className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-6"
            >
                <ArrowLeft size={18} />
                {step > 1 ? 'Back' : 'Cancel'}
            </button>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-secondary-900">Book a Service</h1>
                <p className="text-secondary-600 mt-1">Step {step} of 3</p>
                <div className="flex gap-2 mt-4">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary-600' : 'bg-secondary-200'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {step === 1 && (
                <div>
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Select a Service</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {SERVICES.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => handleServiceSelect(service.id)}
                                className={`card text-left hover:shadow-md transition-shadow ${formData.service === service.id ? 'ring-2 ring-primary-500' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <span className="text-3xl">{service.icon}</span>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-secondary-900">{service.label}</h3>
                                        <p className="text-sm text-secondary-600 mt-1">{service.description}</p>
                                        <p className="text-primary-600 font-semibold mt-2">₹{service.price}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Select Date & Time</h2>
                    <div className="card">
                        <div className="mb-6">
                            <label className="label flex items-center gap-2">
                                <Calendar size={16} />
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
                                <Clock size={16} />
                                Select Time Slot
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {TIME_SLOTS.map((time) => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, scheduledTime: time })}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${formData.scheduledTime === time
                                                ? 'bg-primary-600 text-white'
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
                            className="btn-primary w-full mt-6"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <form onSubmit={handleSubmit}>
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Service Address</h2>
                    <div className="card mb-6">
                        <div className="space-y-4">
                            <div>
                                <label className="label flex items-center gap-2">
                                    <MapPin size={16} />
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
                                    <FileText size={16} />
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

                    <div className="card mb-6">
                        <h3 className="font-semibold text-secondary-900 mb-4">Booking Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-secondary-600">Service</span>
                                <span className="font-medium capitalize">{formData.service.replace('-', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-secondary-600">Date & Time</span>
                                <span className="font-medium">{formData.scheduledDate} at {formData.scheduledTime}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-secondary-100">
                                <span className="text-secondary-900 font-semibold">Estimated Total</span>
                                <span className="text-primary-600 font-bold text-lg">₹{selectedService?.price || 0}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!canSubmit || isLoading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Creating Booking...
                            </>
                        ) : (
                            <>
                                <CreditCard size={18} />
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
