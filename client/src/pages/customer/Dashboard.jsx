import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchBookings, cancelBooking } from '../../store/bookingSlice'
import BookingCard from '../../components/booking/BookingCard'
import { Plus, Loader2, Calendar, CheckCircle, Clock, XCircle, Sparkles } from 'lucide-react'

function CustomerDashboard() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { bookings, isLoading } = useSelector((state) => state.bookings)

    useEffect(() => {
        dispatch(fetchBookings())
    }, [dispatch])

    const handleAction = async (action, bookingId) => {
        if (action === 'cancel') {
            if (window.confirm('Are you sure you want to cancel this booking?')) {
                dispatch(cancelBooking({ id: bookingId, reason: 'Cancelled by customer' }))
            }
        }
    }

    const activeBookings = bookings.filter(b =>
        ['pending', 'assigned', 'accepted', 'in-progress'].includes(b.status)
    )
    const completedBookings = bookings.filter(b => b.status === 'completed')
    const cancelledBookings = bookings.filter(b => ['cancelled', 'failed'].includes(b.status))

    const stats = [
        { label: 'Active', value: activeBookings.length, icon: Clock, color: 'bg-blue-500', bgLight: 'bg-blue-50' },
        { label: 'Completed', value: completedBookings.length, icon: CheckCircle, color: 'bg-emerald-500', bgLight: 'bg-emerald-50' },
        { label: 'Cancelled', value: cancelledBookings.length, icon: XCircle, color: 'bg-slate-400', bgLight: 'bg-slate-50' },
    ]

    if (isLoading && bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-primary-600" size={40} />
                <p className="text-secondary-500 font-medium">Loading your bookings...</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900">
                        Hello, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-secondary-500 mt-1">Here's what's happening with your bookings</p>
                </div>
                <Link to="/new-booking" className="btn-primary flex items-center justify-center gap-2 sm:w-auto w-full">
                    <Plus size={20} />
                    New Booking
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className={`card-static ${stat.bgLight} border-none`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
                                <p className="text-sm text-secondary-500 font-medium">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {bookings.length === 0 ? (
                <div className="card-static text-center py-16">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="text-primary-600" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-secondary-900 mb-2">No bookings yet</h3>
                    <p className="text-secondary-500 mb-6 max-w-sm mx-auto">
                        Book your first home service and let our professionals take care of the rest!
                    </p>
                    <Link to="/new-booking" className="btn-primary inline-flex items-center gap-2">
                        <Plus size={20} />
                        Create Your First Booking
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {activeBookings.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-6 bg-primary-600 rounded-full" />
                                <h2 className="text-xl font-bold text-secondary-900">Active Bookings</h2>
                                <span className="badge badge-primary">{activeBookings.length}</span>
                            </div>
                            <div className="grid gap-4">
                                {activeBookings.map((booking) => (
                                    <BookingCard
                                        key={booking._id}
                                        booking={booking}
                                        showActions={{ cancel: true }}
                                        onAction={handleAction}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {completedBookings.length > 0 && (
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                                <h2 className="text-xl font-bold text-secondary-900">Past Bookings</h2>
                            </div>
                            <div className="grid gap-4">
                                {completedBookings.slice(0, 5).map((booking) => (
                                    <BookingCard key={booking._id} booking={booking} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default CustomerDashboard
