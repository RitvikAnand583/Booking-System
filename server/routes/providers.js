import express from 'express';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/available', protect, async (req, res) => {
    try {
        const { service } = req.query;

        let query = {
            role: 'provider',
            availability: true,
            isActive: true
        };

        if (service) {
            query.services = service;
        }

        const providers = await User.find(query)
            .select('-password')
            .sort({ rating: -1, completedJobs: -1 });

        res.json(providers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/availability', protect, authorize('provider'), async (req, res) => {
    try {
        const { availability } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { availability },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/my-bookings', protect, authorize('provider'), async (req, res) => {
    try {
        const { status } = req.query;

        let query = { providerId: req.user._id };

        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate('customerId', 'name email phone')
            .sort({ scheduledDate: 1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/pending-bookings', protect, authorize('provider'), async (req, res) => {
    try {
        const bookings = await Booking.find({
            providerId: req.user._id,
            status: 'assigned'
        })
            .populate('customerId', 'name email phone')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/stats', protect, authorize('provider'), async (req, res) => {
    try {
        const total = await Booking.countDocuments({ providerId: req.user._id });
        const completed = await Booking.countDocuments({ providerId: req.user._id, status: 'completed' });
        const inProgress = await Booking.countDocuments({ providerId: req.user._id, status: 'in-progress' });
        const pending = await Booking.countDocuments({ providerId: req.user._id, status: { $in: ['assigned', 'accepted'] } });

        res.json({
            total,
            completed,
            inProgress,
            pending,
            completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
