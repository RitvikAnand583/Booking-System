import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBookings, updateBookingStatus, rejectBooking } from '../../store/bookingSlice'
import BookingCard from '../../components/booking/BookingCard'
import { Loader2, CheckCircle, Clock, AlertCircle, Power } from 'lucide-react'
import api from '../../services/api'

function ProviderDashboard() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { bookings, isLoading } = useSelector((state) => state.bookings)
    const [availability, setAvailability] = useState(user?.availability ?? true)
    const [stats, setStats] = useState(null)

    useEffect(() => {
        dispatch(fetchBookings())
        fetchStats()
    }, [dispatch])

    const fetchStats = async () => {
        try {
            const response = await api.get('/providers/stats')
            setStats(response.data)
        } catch (error) {
            console.error('Failed to fetch stats')
        }
    }

    const toggleAvailability = async () => {
        try {
            await api.patch('/providers/availability', { availability: !availability })
            setAvailability(!availability)
        } catch (error) {
            console.error('Failed to update availability')
        }
    }

    const handleAction = async (action, bookingId) => {
        if (action === 'accept') {
            dispatch(updateBookingStatus({ id: bookingId, status: 'accepted' }))
        } else if (action === 'reject') {
            dispatch(rejectBooking({ id: bookingId, reason: 'Provider rejected' }))
        } else if (action === 'start') {
            dispatch(updateBookingStatus({ id: bookingId, status: 'in-progress' }))
        } else if (action === 'complete') {
            dispatch(updateBookingStatus({ id: bookingId, status: 'completed' }))
            fetchStats()
        }
    }

    const pendingBookings = bookings.filter(b => b.status === 'assigned')
    const activeBookings = bookings.filter(b => ['accepted', 'in-progress'].includes(b.status))
    const completedBookings = bookings.filter(b => b.status === 'completed')

    if (isLoading && bookings.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary-600" size={32} />
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900">Provider Dashboard</h1>
                    <p className="text-secondary-600 mt-1">Manage your assigned jobs</p>
                </div>
                <button
                    onClick={toggleAvailability}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${availability
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-secondary-200 text-secondary-600 hover:bg-secondary-300'
                        }`}
                >
                    <Power size={18} />
                    {availability ? 'Available' : 'Unavailable'}
                </button>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-secondary-900">{stats.pending}</p>
                            <p className="text-sm text-secondary-600">Pending</p>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-secondary-900">{stats.inProgress}</p>
                            <p className="text-sm text-secondary-600">In Progress</p>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-100 text-green-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-secondary-900">{stats.completed}</p>
                            <p className="text-sm text-secondary-600">Completed</p>
                        </div>
                    </div>
                    <div className="card flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary-100 text-primary-600">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-secondary-900">{stats.completionRate}%</p>
                            <p className="text-sm text-secondary-600">Success Rate</p>
                        </div>
                    </div>
                </div>
            )}

            {pendingBookings.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        New Assignments ({pendingBookings.length})
                    </h2>
                    <div className="grid gap-4">
                        {pendingBookings.map((booking) => (
                            <BookingCard
                                key={booking._id}
                                booking={booking}
                                showActions={{ accept: true, reject: true }}
                                onAction={handleAction}
                            />
                        ))}
                    </div>
                </div>
            )}

            {activeBookings.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Active Jobs</h2>
                    <div className="grid gap-4">
                        {activeBookings.map((booking) => (
                            <BookingCard
                                key={booking._id}
                                booking={booking}
                                showActions={{ start: true, complete: true }}
                                onAction={handleAction}
                            />
                        ))}
                    </div>
                </div>
            )}

            {completedBookings.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-secondary-900 mb-4">Completed Jobs</h2>
                    <div className="grid gap-4">
                        {completedBookings.slice(0, 5).map((booking) => (
                            <BookingCard key={booking._id} booking={booking} />
                        ))}
                    </div>
                </div>
            )}

            {bookings.length === 0 && (
                <div className="card text-center py-12">
                    <Clock className="mx-auto text-secondary-300 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">No bookings assigned yet</h3>
                    <p className="text-secondary-600">Make sure you're set to "Available" to receive new jobs.</p>
                </div>
            )}
        </div>
    )
}

export default ProviderDashboard
