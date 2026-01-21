import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Loader2, Search, Filter, ArrowRight, User, Calendar } from 'lucide-react'
import api from '../../services/api'

const STATUSES = ['all', 'pending', 'assigned', 'accepted', 'in-progress', 'completed', 'cancelled', 'failed']

function AdminBookings() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [overrideStatus, setOverrideStatus] = useState('')
    const [overrideNotes, setOverrideNotes] = useState('')
    const [providers, setProviders] = useState([])

    useEffect(() => {
        fetchBookings()
        fetchProviders()
    }, [statusFilter])

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/admin/bookings?status=${statusFilter}`)
            setBookings(response.data.bookings)
        } catch (error) {
            console.error('Failed to fetch bookings')
        } finally {
            setLoading(false)
        }
    }

    const fetchProviders = async () => {
        try {
            const response = await api.get('/admin/providers')
            setProviders(response.data)
        } catch (error) {
            console.error('Failed to fetch providers')
        }
    }

    const handleOverride = async () => {
        if (!selectedBooking || !overrideStatus) return
        try {
            await api.patch(`/admin/bookings/${selectedBooking._id}/override`, {
                status: overrideStatus,
                notes: overrideNotes
            })
            fetchBookings()
            setSelectedBooking(null)
            setOverrideStatus('')
            setOverrideNotes('')
        } catch (error) {
            console.error('Failed to override status')
        }
    }

    const handleAssignProvider = async (bookingId, providerId) => {
        try {
            await api.post(`/bookings/${bookingId}/assign`, { providerId })
            fetchBookings()
        } catch (error) {
            console.error('Failed to assign provider')
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Booking Management</h1>
                    <p className="text-secondary-600 mt-1">View and manage all bookings</p>
                </div>
            </div>

            <div className="card mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-secondary-400" />
                        <span className="text-sm text-secondary-600">Filter by status:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {STATUSES.map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === status
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                                    }`}
                            >
                                {status === 'all' ? 'All' : status.replace('-', ' ')}
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
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-secondary-100">
                                <th className="text-left py-3 px-4 font-semibold text-secondary-900">ID</th>
                                <th className="text-left py-3 px-4 font-semibold text-secondary-900">Service</th>
                                <th className="text-left py-3 px-4 font-semibold text-secondary-900">Customer</th>
                                <th className="text-left py-3 px-4 font-semibold text-secondary-900">Provider</th>
                                <th className="text-left py-3 px-4 font-semibold text-secondary-900">Date</th>
                                <th className="text-left py-3 px-4 font-semibold text-secondary-900">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-secondary-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking._id} className="border-b border-secondary-50 hover:bg-secondary-50">
                                    <td className="py-3 px-4 text-sm text-secondary-600">#{booking._id.slice(-6).toUpperCase()}</td>
                                    <td className="py-3 px-4 text-sm font-medium capitalize">{booking.service?.replace('-', ' ')}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                                                <User size={14} />
                                            </div>
                                            <span className="text-sm">{booking.customerId?.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {booking.providerId ? (
                                            <span className="text-sm">{booking.providerId.name}</span>
                                        ) : booking.status === 'pending' ? (
                                            <select
                                                onChange={(e) => handleAssignProvider(booking._id, e.target.value)}
                                                className="text-sm bg-secondary-50 border border-secondary-200 rounded px-2 py-1"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Assign...</option>
                                                {providers.filter(p => p.services?.includes(booking.service)).map((p) => (
                                                    <option key={p._id} value={p._id}>{p.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-sm text-secondary-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-secondary-600">
                                        {format(new Date(booking.scheduledDate), 'MMM dd')}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`status-badge status-${booking.status}`}>
                                            {booking.status?.replace('-', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                Override
                                            </button>
                                            <Link to={`/booking/${booking._id}`} className="text-secondary-400 hover:text-secondary-600">
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {bookings.length === 0 && (
                        <div className="text-center py-12 text-secondary-500">
                            No bookings found for this filter
                        </div>
                    )}
                </div>
            )}

            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Override Booking Status</h3>
                        <p className="text-sm text-secondary-600 mb-4">
                            Booking #{selectedBooking._id.slice(-6).toUpperCase()} - {selectedBooking.service}
                        </p>

                        <div className="mb-4">
                            <label className="label">New Status</label>
                            <select
                                value={overrideStatus}
                                onChange={(e) => setOverrideStatus(e.target.value)}
                                className="input"
                            >
                                <option value="">Select status...</option>
                                {STATUSES.filter(s => s !== 'all').map((status) => (
                                    <option key={status} value={status}>{status.replace('-', ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-6">
                            <label className="label">Admin Notes</label>
                            <textarea
                                value={overrideNotes}
                                onChange={(e) => setOverrideNotes(e.target.value)}
                                className="input"
                                rows={3}
                                placeholder="Reason for override..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setSelectedBooking(null)} className="btn-secondary flex-1">
                                Cancel
                            </button>
                            <button onClick={handleOverride} className="btn-primary flex-1" disabled={!overrideStatus}>
                                Apply Override
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminBookings
