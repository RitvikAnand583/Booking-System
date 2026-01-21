import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { logEvent } from '../services/eventLogger.js';
import { validateTransition } from '../services/bookingStateMachine.js';
import { assignProviderToBooking } from '../services/providerAssignment.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'customer') {
            query.customerId = req.user._id;
        } else if (req.user.role === 'provider') {
            query.providerId = req.user._id;
        }

        const bookings = await Booking.find(query)
            .populate('customerId', 'name email phone')
            .populate('providerId', 'name email phone rating')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customerId', 'name email phone')
            .populate('providerId', 'name email phone rating services');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/history', protect, async (req, res) => {
    try {
        const { getBookingHistory } = await import('../services/eventLogger.js');
        const events = await getBookingHistory(req.params.id);
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', protect, authorize('customer'), async (req, res) => {
    try {
        const { service, scheduledDate, scheduledTime, address, description, estimatedPrice, autoAssign = true } = req.body;

        const booking = await Booking.create({
            customerId: req.user._id,
            service,
            scheduledDate,
            scheduledTime,
            address,
            description,
            estimatedPrice: estimatedPrice || 0,
            status: 'pending'
        });

        await logEvent({
            bookingId: booking._id,
            eventType: 'BOOKING_CREATED',
            previousState: null,
            newState: 'pending',
            actor: {
                userId: req.user._id,
                role: req.user.role,
                name: req.user.name
            },
            description: `Booking created for ${service} service`
        });

        if (autoAssign) {
            const result = await assignProviderToBooking(booking);
            if (result.success) {
                booking.providerId = result.provider._id;
                booking.status = 'assigned';
                await booking.save();

                await logEvent({
                    bookingId: booking._id,
                    eventType: 'PROVIDER_ASSIGNED',
                    previousState: 'pending',
                    newState: 'assigned',
                    actor: {
                        userId: req.user._id,
                        role: 'system',
                        name: 'Auto-Assignment'
                    },
                    metadata: { providerId: result.provider._id },
                    description: `Provider ${result.provider.name} auto-assigned to booking`
                });
            }
        }

        const populated = await Booking.findById(booking._id)
            .populate('customerId', 'name email phone')
            .populate('providerId', 'name email phone rating');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/assign', protect, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const { providerId } = req.body;
        const result = await assignProviderToBooking(booking, providerId);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        const previousState = booking.status;
        booking.providerId = result.provider._id;
        booking.status = 'assigned';
        await booking.save();

        await logEvent({
            bookingId: booking._id,
            eventType: 'PROVIDER_ASSIGNED',
            previousState,
            newState: 'assigned',
            actor: {
                userId: req.user._id,
                role: req.user.role,
                name: req.user.name
            },
            metadata: { providerId: result.provider._id },
            description: `Provider ${result.provider.name} assigned to booking`
        });

        const populated = await Booking.findById(booking._id)
            .populate('customerId', 'name email phone')
            .populate('providerId', 'name email phone rating');

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:id/status', protect, async (req, res) => {
    try {
        const { status, reason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const isAdmin = req.user.role === 'admin';
        const validation = validateTransition(booking.status, status, isAdmin);

        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        const previousState = booking.status;
        booking.status = status;

        if (status === 'cancelled') {
            booking.cancelledBy = req.user.role;
            booking.cancellationReason = reason || '';
        }

        if (status === 'completed' && booking.providerId) {
            await User.findByIdAndUpdate(booking.providerId, { $inc: { completedJobs: 1 } });
        }

        await booking.save();

        let eventType = 'STATUS_CHANGED';
        if (status === 'accepted') eventType = 'PROVIDER_ACCEPTED';
        if (status === 'in-progress') eventType = 'WORK_STARTED';
        if (status === 'completed') eventType = 'WORK_COMPLETED';
        if (status === 'cancelled') eventType = 'BOOKING_CANCELLED';
        if (status === 'failed') eventType = 'BOOKING_FAILED';

        await logEvent({
            bookingId: booking._id,
            eventType,
            previousState,
            newState: status,
            actor: {
                userId: req.user._id,
                role: req.user.role,
                name: req.user.name
            },
            metadata: { reason },
            description: reason || `Status changed from ${previousState} to ${status}`
        });

        const populated = await Booking.findById(booking._id)
            .populate('customerId', 'name email phone')
            .populate('providerId', 'name email phone rating');

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/reject', protect, authorize('provider'), async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.providerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const previousState = booking.status;

        await logEvent({
            bookingId: booking._id,
            eventType: 'PROVIDER_REJECTED',
            previousState,
            newState: 'pending',
            actor: {
                userId: req.user._id,
                role: req.user.role,
                name: req.user.name
            },
            metadata: { reason, rejectedProviderId: booking.providerId },
            description: reason || 'Provider rejected the booking'
        });

        if (booking.retryCount < booking.maxRetries) {
            booking.retryCount += 1;
            booking.providerId = null;
            booking.status = 'pending';
            await booking.save();

            await logEvent({
                bookingId: booking._id,
                eventType: 'RETRY_ATTEMPTED',
                previousState: 'assigned',
                newState: 'pending',
                actor: {
                    userId: req.user._id,
                    role: 'system',
                    name: 'System'
                },
                metadata: { retryCount: booking.retryCount },
                description: `Retry attempt ${booking.retryCount} of ${booking.maxRetries}`
            });

            res.json({ message: 'Booking returned to pending for reassignment', booking });
        } else {
            booking.status = 'failed';
            await booking.save();

            await logEvent({
                bookingId: booking._id,
                eventType: 'BOOKING_FAILED',
                previousState,
                newState: 'failed',
                actor: {
                    userId: req.user._id,
                    role: 'system',
                    name: 'System'
                },
                description: 'Maximum retry attempts exceeded'
            });

            res.json({ message: 'Booking failed after max retries', booking });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/cancel', protect, async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (req.user.role === 'customer' && booking.customerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (req.user.role === 'provider' && booking.providerId?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (['completed', 'cancelled'].includes(booking.status)) {
            return res.status(400).json({ message: 'Cannot cancel this booking' });
        }

        const previousState = booking.status;
        booking.status = 'cancelled';
        booking.cancelledBy = req.user.role;
        booking.cancellationReason = reason || '';
        await booking.save();

        await logEvent({
            bookingId: booking._id,
            eventType: 'BOOKING_CANCELLED',
            previousState,
            newState: 'cancelled',
            actor: {
                userId: req.user._id,
                role: req.user.role,
                name: req.user.name
            },
            metadata: { reason },
            description: reason || `Booking cancelled by ${req.user.role}`
        });

        res.json({ message: 'Booking cancelled', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
