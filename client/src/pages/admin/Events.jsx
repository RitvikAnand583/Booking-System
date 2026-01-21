import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Loader2, Activity, Filter, RefreshCw } from 'lucide-react'
import api from '../../services/api'

const EVENT_COLORS = {
    'BOOKING_CREATED': 'bg-blue-100 text-blue-600',
    'PROVIDER_ASSIGNED': 'bg-indigo-100 text-indigo-600',
    'PROVIDER_ACCEPTED': 'bg-green-100 text-green-600',
    'PROVIDER_REJECTED': 'bg-orange-100 text-orange-600',
    'WORK_STARTED': 'bg-purple-100 text-purple-600',
    'WORK_COMPLETED': 'bg-green-100 text-green-600',
    'BOOKING_CANCELLED': 'bg-gray-100 text-gray-600',
    'BOOKING_FAILED': 'bg-red-100 text-red-600',
    'RETRY_ATTEMPTED': 'bg-yellow-100 text-yellow-600',
    'ADMIN_OVERRIDE': 'bg-pink-100 text-pink-600',
    'STATUS_CHANGED': 'bg-secondary-100 text-secondary-600',
}

function AdminEvents() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [limit, setLimit] = useState(50)

    useEffect(() => {
        fetchEvents()
    }, [limit])

    const fetchEvents = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/admin/events?limit=${limit}`)
            setEvents(response.data)
        } catch (error) {
            console.error('Failed to fetch events')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Event Logs</h1>
                    <p className="text-secondary-600 mt-1">Complete audit trail of all system events</p>
                </div>
                <button onClick={fetchEvents} className="btn-outline flex items-center gap-2">
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>

            <div className="card mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-secondary-400" />
                        <span className="text-sm text-secondary-600">Show:</span>
                    </div>
                    <div className="flex gap-2">
                        {[25, 50, 100].map((num) => (
                            <button
                                key={num}
                                onClick={() => setLimit(num)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${limit === num
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                    }`}
                            >
                                {num} events
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="animate-spin text-primary-600" size={32} />
                </div>
            ) : (
                <div className="card">
                    <div className="space-y-4">
                        {events.map((event, index) => (
                            <div key={event._id} className="flex gap-4">
                                <div className="relative flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${EVENT_COLORS[event.eventType] || 'bg-secondary-100 text-secondary-600'}`}>
                                        <Activity size={18} />
                                    </div>
                                    {index < events.length - 1 && (
                                        <div className="w-0.5 flex-1 bg-secondary-200 mt-2" />
                                    )}
                                </div>
                                <div className="flex-1 pb-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-secondary-900">
                                                {event.eventType.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-sm text-secondary-600 mt-1">
                                                {event.description || `${event.previousState || 'New'} → ${event.newState}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-secondary-500">
                                                {format(new Date(event.createdAt), 'MMM dd, yyyy')}
                                            </p>
                                            <p className="text-xs text-secondary-400">
                                                {format(new Date(event.createdAt), 'HH:mm:ss')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-secondary-500">
                                        <span>Booking: #{event.bookingId?._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                                        <span>•</span>
                                        <span>{event.bookingId?.service?.replace('-', ' ') || 'Unknown'}</span>
                                        <span>•</span>
                                        <span className="capitalize">By: {event.actor?.name || event.actor?.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {events.length === 0 && (
                            <div className="text-center py-12 text-secondary-500">
                                No events found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminEvents
