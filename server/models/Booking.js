import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    service: {
        type: String,
        required: true,
        enum: ['cleaning', 'plumbing', 'electrical', 'ac-repair', 'painting', 'carpentry', 'pest-control']
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'accepted', 'in-progress', 'completed', 'cancelled', 'failed'],
        default: 'pending'
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    scheduledTime: {
        type: String,
        required: true
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    description: {
        type: String,
        default: ''
    },
    estimatedPrice: {
        type: Number,
        default: 0
    },
    finalPrice: {
        type: Number,
        default: 0
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    cancelledBy: {
        type: String,
        enum: ['customer', 'provider', 'admin', null],
        default: null
    },
    retryCount: {
        type: Number,
        default: 0
    },
    maxRetries: {
        type: Number,
        default: 3
    },
    notes: {
        type: String,
        default: ''
    },
    adminNotes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
