import mongoose from 'mongoose';

const eventLogSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    eventType: {
        type: String,
        required: true,
        enum: [
            'BOOKING_CREATED',
            'PROVIDER_ASSIGNED',
            'PROVIDER_ACCEPTED',
            'PROVIDER_REJECTED',
            'WORK_STARTED',
            'WORK_COMPLETED',
            'BOOKING_CANCELLED',
            'BOOKING_FAILED',
            'RETRY_ATTEMPTED',
            'ADMIN_OVERRIDE',
            'STATUS_CHANGED'
        ]
    },
    previousState: {
        type: String,
        default: null
    },
    newState: {
        type: String,
        required: true
    },
    actor: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['customer', 'provider', 'admin', 'system'],
            required: true
        },
        name: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

eventLogSchema.index({ bookingId: 1, createdAt: -1 });
eventLogSchema.index({ 'actor.userId': 1 });
eventLogSchema.index({ eventType: 1, createdAt: -1 });

const EventLog = mongoose.model('EventLog', eventLogSchema);

export default EventLog;
