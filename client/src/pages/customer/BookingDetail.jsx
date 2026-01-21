import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBookingById, cancelBooking, clearCurrentBooking } from '../../store/bookingSlice'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Clock, MapPin, User, Phone, Mail, Loader2, CheckCircle, XCircle, Clock4 } from 'lucide-react'
import api from '../../services/api'

const STATUS_STEPS = ['pending', 'assigned', 'accepted', 'in-progress', 'completed']

function BookingDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentBooking: booking, isLoading } = useSelector((state) => state.bookings)
    const { user } = useSelector((state) => state.auth)
    const [events, setEvents] = useState([])

    useEffect(() => {
        dispatch(fetchBookingById(id))
        fetchEvents()
        return () => dispatch(clearCurrentBooking())
    }, [dispatch, id])

    const fetchEvents = async () => {
        try {
            const response = await api.get(`/bookings/${id}/history`)
            setEvents(response.data)
        } catch (error) {
            console.log('Events fetch failed')
        }
    }

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            await dispatch(cancelBooking({ id, reason: 'Cancelled by user' }))
            navigate(-1)
        }
    }

    if (isLoading || !booking) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        )
    }

    const currentStepIndex = STATUS_STEPS.indexOf(booking.status)
    const isCancelled = ['cancelled', 'failed'].includes(booking.status)

    return (
        <div className="max-w-3xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-secondary-600 hover:text-secondary-900 mb-6"
            >
                <ArrowLeft size={18} />
                Back
            </button>

            <div className="card mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary-900 capitalize">
                            {booking.service?.replace('-', ' ')} Service
                        </h1>
                        <p className="text-secondary-500 mt-1">Booking #{booking._id}</p>
                    </div>
                    <span className={`status-badge status-${booking.status}`}>
                        {booking.status?.replace('-', ' ')}
                    </span>
                </div>

                {!isCancelled && currentStepIndex >= 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            {STATUS_STEPS.map((step, index) => (
                                <div key={step} className="flex-1 relative">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${index <= currentStepIndex
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-secondary-200 text-secondary-400'
                                            }`}>
                                            {index < currentStepIndex ? (
                                                <CheckCircle size={20} />
                                            ) : index === currentStepIndex ? (
                                                <Clock4 size={20} />
                                            ) : (
                                                <span className="text-sm font-medium">{index + 1}</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-secondary-600 mt-2 capitalize">{step.replace('-', ' ')}</span>
                                    </div>
                                    {index < STATUS_STEPS.length - 1 && (
                                        <div className={`absolute top-5 left-1/2 w-full h-0.5 ${index < currentStepIndex ? 'bg-primary-600' : 'bg-secondary-200'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-secondary-900">Booking Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-secondary-600">
                                <Calendar size={18} className="text-secondary-400" />
                                <span>{format(new Date(booking.scheduledDate), 'EEEE, MMMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-secondary-600">
                                <Clock size={18} className="text-secondary-400" />
                                <span>{booking.scheduledTime}</span>
                            </div>
                            <div className="flex items-start gap-3 text-secondary-600">
                                <MapPin size={18} className="text-secondary-400 mt-0.5" />
                                <div>
                                    <p>{booking.address?.street}</p>
                                    <p>{booking.address?.city}, {booking.address?.pincode}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {booking.providerId && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-secondary-900">Service Provider</h3>
                            <div className="p-4 bg-secondary-50 rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                        <User size={20} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-secondary-900">{booking.providerId.name}</p>
                                        <p className="text-sm text-secondary-500">⭐ {booking.providerId.rating || 5} Rating</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-secondary-600">
                                        <Phone size={14} />
                                        <span>{booking.providerId.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-secondary-600">
                                        <Mail size={14} />
                                        <span>{booking.providerId.email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {booking.description && (
                    <div className="mt-6 pt-6 border-t border-secondary-100">
                        <h3 className="font-semibold text-secondary-900 mb-2">Notes</h3>
                        <p className="text-secondary-600 text-sm">{booking.description}</p>
                    </div>
                )}

                <div className="mt-6 pt-6 border-t border-secondary-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-secondary-600">Estimated Price</p>
                        <p className="text-2xl font-bold text-primary-600">₹{booking.estimatedPrice || 0}</p>
                    </div>
                    {user?.role === 'customer' && !['completed', 'cancelled'].includes(booking.status) && (
                        <button onClick={handleCancel} className="btn-danger">
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>

            {events.length > 0 && (
                <div className="card">
                    <h3 className="font-semibold text-secondary-900 mb-4">Activity Timeline</h3>
                    <div className="space-y-4">
                        {events.map((event) => (
                            <div key={event._id} className="flex gap-4">
                                <div className="relative">
                                    <div className="w-3 h-3 bg-primary-600 rounded-full mt-1.5" />
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-full bg-secondary-200" />
                                </div>
                                <div className="pb-4">
                                    <p className="font-medium text-secondary-900">{event.eventType.replace(/_/g, ' ')}</p>
                                    <p className="text-sm text-secondary-600">{event.description}</p>
                                    <p className="text-xs text-secondary-400 mt-1">
                                        {format(new Date(event.createdAt), 'MMM dd, yyyy HH:mm')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default BookingDetail
