import express from 'express';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import EventLog from '../models/EventLog.js';
import { protect, authorize } from '../middleware/auth.js';
import { logEvent, getRecentEvents } from '../services/eventLogger.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const activeBookings = await Booking.countDocuments({ status: { $in: ['assigned', 'accepted', 'in-progress'] } });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
        const failedBookings = await Booking.countDocuments({ status: 'failed' });

        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalProviders = await User.countDocuments({ role: 'provider' });
        const activeProviders = await User.countDocuments({ role: 'provider', availability: true });

        res.json({
            bookings: {
                total: totalBookings,
                pending: pendingBookings,
                active: activeBookings,
                completed: completedBookings,
                cancelled: cancelledBookings,
                failed: failedBookings
            },
            users: {
                customers: totalCustomers,
                providers: totalProviders,
                activeProviders
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/bookings', async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('customerId', 'name email phone')
            .populate('providerId', 'name email phone rating')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        res.json({
            bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/bookings/:id/override', async (req, res) => {
    try {
        const { status, notes } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const previousState = booking.status;
        booking.status = status;
        booking.adminNotes = notes || booking.adminNotes;
        await booking.save();

        await logEvent({
            bookingId: booking._id,
            eventType: 'ADMIN_OVERRIDE',
            previousState,
            newState: status,
            actor: {
                userId: req.user._id,
                role: 'admin',
                name: req.user.name
            },
            metadata: { notes },
            description: `Admin override: ${previousState} → ${status}`
        });

        const populated = await Booking.findById(booking._id)
            .populate('customerId', 'name email phone')
            .populate('providerId', 'name email phone rating');

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/events', async (req, res) => {
    try {
        const { limit = 50, bookingId } = req.query;

        let query = {};
        if (bookingId) {
            query.bookingId = bookingId;
        }

        const events = await EventLog.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('bookingId', 'service status')
            .populate('actor.userId', 'name email role');

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/providers', async (req, res) => {
    try {
        const providers = await User.find({ role: 'provider' })
            .select('-password')
            .sort({ rating: -1 });

        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/providers/:id', async (req, res) => {
    try {
        const { isActive, availability } = req.body;

        const provider = await User.findByIdAndUpdate(
            req.params.id,
            { isActive, availability },
            { new: true }
        ).select('-password');

        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        res.json(provider);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const { role } = req.query;

        let query = {};
        if (role) {
            query.role = role;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
