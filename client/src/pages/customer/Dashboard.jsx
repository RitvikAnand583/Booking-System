import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchBookings, cancelBooking } from '../../store/bookingSlice'
import BookingCard from '../../components/booking/BookingCard'
import { Plus, Loader2, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react'

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
        { label: 'Active Bookings', value: activeBookings.length, icon: Clock, color: 'text-blue-600' },
        { label: 'Completed', value: completedBookings.length, icon: CheckCircle, color: 'text-green-600' },
        { label: 'Cancelled', value: cancelledBookings.length, icon: XCircle, color: 'text-red-600' },
    ]

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
                    <h1 className="text-2xl font-bold text-secondary-900">Welcome back, {user?.name}!</h1>
                    <p className="text-secondary-600 mt-1">Manage your home service bookings</p>
                </div>
                <Link to="/new-booking" className="btn-primary flex items-center gap-2">
                    <Plus size={18} />
                    New Booking
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="card flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-secondary-100 ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                            <p className="text-sm text-secondary-600">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {bookings.length === 0 ? (
                <div className="card text-center py-12">
                    <Calendar className="mx-auto text-secondary-300 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">No bookings yet</h3>
                    <p className="text-secondary-600 mb-4">Book your first home service today!</p>
                    <Link to="/new-booking" className="btn-primary inline-flex items-center gap-2">
                        <Plus size={18} />
                        Create Booking
                    </Link>
                </div>
            ) : (
                <div>
                    {activeBookings.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Active Bookings</h2>
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
                            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Past Bookings</h2>
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
