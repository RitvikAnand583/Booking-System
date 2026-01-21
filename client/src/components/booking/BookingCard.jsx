import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, User, ArrowRight, Star } from 'lucide-react'

const SERVICE_ICONS = {
    'cleaning': '🧹',
    'plumbing': '🔧',
    'electrical': '💡',
    'ac-repair': '❄️',
    'painting': '🎨',
    'carpentry': '🪚',
    'pest-control': '🐜',
}

const SERVICE_COLORS = {
    'cleaning': 'bg-emerald-100',
    'plumbing': 'bg-blue-100',
    'electrical': 'bg-amber-100',
    'ac-repair': 'bg-cyan-100',
    'painting': 'bg-pink-100',
    'carpentry': 'bg-orange-100',
    'pest-control': 'bg-red-100',
}

function BookingCard({ booking, showActions, onAction }) {
    const serviceColor = SERVICE_COLORS[booking.service] || 'bg-secondary-100'

    return (
        <div className="card-static group hover:shadow-lg hover:border-primary-100 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${serviceColor} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
                        {SERVICE_ICONS[booking.service] || '🏠'}
                    </div>
                    <div>
                        <h3 className="font-bold text-secondary-900 capitalize text-lg">
                            {booking.service.replace('-', ' ')}
                        </h3>
                        <p className="text-sm text-secondary-400 font-medium">#{booking._id.slice(-8).toUpperCase()}</p>
                    </div>
                </div>
                <span className={`status-badge status-${booking.status}`}>
                    {booking.status.replace('-', ' ')}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex items-center gap-2 text-sm text-secondary-600 bg-secondary-50 px-3 py-2 rounded-xl">
                    <Calendar size={16} className="text-secondary-400" />
                    <span className="font-medium">{format(new Date(booking.scheduledDate), 'MMM dd')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-secondary-600 bg-secondary-50 px-3 py-2 rounded-xl">
                    <Clock size={16} className="text-secondary-400" />
                    <span className="font-medium">{booking.scheduledTime}</span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-secondary-600 mb-4">
                <MapPin size={16} className="text-secondary-400" />
                <span>{booking.address?.street ? `${booking.address.street}, ${booking.address.city}` : booking.address?.city || 'Address not specified'}</span>
            </div>

            {booking.providerId && (
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl mb-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {booking.providerId.name?.charAt(0).toUpperCase() || 'P'}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-secondary-900">{booking.providerId.name || 'Assigned'}</p>
                        {booking.providerId.rating && (
                            <div className="flex items-center gap-1 text-sm text-secondary-500">
                                <Star size={14} className="text-amber-500 fill-amber-500" />
                                <span>{booking.providerId.rating}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
                {booking.estimatedPrice > 0 ? (
                    <div>
                        <p className="text-xs text-secondary-400 mb-0.5">Estimated</p>
                        <span className="font-bold text-xl text-primary-600">₹{booking.estimatedPrice}</span>
                    </div>
                ) : (
                    <div />
                )}

                <div className="flex gap-2">
                    {showActions?.cancel && !['completed', 'cancelled'].includes(booking.status) && (
                        <button
                            onClick={() => onAction('cancel', booking._id)}
                            className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    {showActions?.accept && booking.status === 'assigned' && (
                        <button
                            onClick={() => onAction('accept', booking._id)}
                            className="btn-success text-sm"
                        >
                            Accept
                        </button>
                    )}
                    {showActions?.reject && booking.status === 'assigned' && (
                        <button
                            onClick={() => onAction('reject', booking._id)}
                            className="btn-outline text-sm"
                        >
                            Reject
                        </button>
                    )}
                    {showActions?.start && booking.status === 'accepted' && (
                        <button
                            onClick={() => onAction('start', booking._id)}
                            className="btn-primary text-sm"
                        >
                            Start Work
                        </button>
                    )}
                    {showActions?.complete && booking.status === 'in-progress' && (
                        <button
                            onClick={() => onAction('complete', booking._id)}
                            className="btn-success text-sm"
                        >
                            Complete
                        </button>
                    )}
                    <Link
                        to={`/booking/${booking._id}`}
                        className="btn-secondary text-sm flex items-center gap-1.5 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors"
                    >
                        Details <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default BookingCard
