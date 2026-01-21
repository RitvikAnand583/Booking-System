import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, User, ArrowRight } from 'lucide-react'

const SERVICE_ICONS = {
    'cleaning': '🧹',
    'plumbing': '🔧',
    'electrical': '💡',
    'ac-repair': '❄️',
    'painting': '🎨',
    'carpentry': '🪚',
    'pest-control': '🐜',
}

const STATUS_COLORS = {
    'pending': 'status-pending',
    'assigned': 'status-assigned',
    'accepted': 'status-accepted',
    'in-progress': 'status-in-progress',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled',
    'failed': 'status-failed',
}

function BookingCard({ booking, showActions, onAction }) {
    const statusClass = STATUS_COLORS[booking.status] || 'status-pending'

    return (
        <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center text-2xl">
                        {SERVICE_ICONS[booking.service] || '🏠'}
                    </div>
                    <div>
                        <h3 className="font-semibold text-secondary-900 capitalize">
                            {booking.service.replace('-', ' ')} Service
                        </h3>
                        <p className="text-sm text-secondary-500">#{booking._id.slice(-8).toUpperCase()}</p>
                    </div>
                </div>
                <span className={`status-badge ${statusClass}`}>
                    {booking.status.replace('-', ' ')}
                </span>
            </div>

            <div className="space-y-2 text-sm text-secondary-600 mb-4">
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-secondary-400" />
                    <span>{format(new Date(booking.scheduledDate), 'MMM dd, yyyy')}</span>
                    <Clock size={16} className="text-secondary-400 ml-2" />
                    <span>{booking.scheduledTime}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-secondary-400" />
                    <span>{booking.address?.city || 'Address not specified'}</span>
                </div>
                {booking.providerId && (
                    <div className="flex items-center gap-2">
                        <User size={16} className="text-secondary-400" />
                        <span>Provider: {booking.providerId.name || 'Assigned'}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-secondary-100">
                {booking.estimatedPrice > 0 && (
                    <span className="font-semibold text-secondary-900">₹{booking.estimatedPrice}</span>
                )}
                <div className="flex gap-2 ml-auto">
                    {showActions?.cancel && !['completed', 'cancelled'].includes(booking.status) && (
                        <button
                            onClick={() => onAction('cancel', booking._id)}
                            className="btn-outline text-sm py-1.5 text-red-600 border-red-200 hover:bg-red-50"
                        >
                            Cancel
                        </button>
                    )}
                    {showActions?.accept && booking.status === 'assigned' && (
                        <button
                            onClick={() => onAction('accept', booking._id)}
                            className="btn-primary text-sm py-1.5"
                        >
                            Accept
                        </button>
                    )}
                    {showActions?.reject && booking.status === 'assigned' && (
                        <button
                            onClick={() => onAction('reject', booking._id)}
                            className="btn-outline text-sm py-1.5"
                        >
                            Reject
                        </button>
                    )}
                    {showActions?.start && booking.status === 'accepted' && (
                        <button
                            onClick={() => onAction('start', booking._id)}
                            className="btn-primary text-sm py-1.5"
                        >
                            Start Work
                        </button>
                    )}
                    {showActions?.complete && booking.status === 'in-progress' && (
                        <button
                            onClick={() => onAction('complete', booking._id)}
                            className="btn-primary text-sm py-1.5"
                        >
                            Complete
                        </button>
                    )}
                    <Link
                        to={`/booking/${booking._id}`}
                        className="btn-secondary text-sm py-1.5 flex items-center gap-1"
                    >
                        View <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default BookingCard
