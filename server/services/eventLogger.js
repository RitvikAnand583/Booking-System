import EventLog from '../models/EventLog.js';

export const logEvent = async ({
    bookingId,
    eventType,
    previousState,
    newState,
    actor,
    metadata = {},
    description = ''
}) => {
    try {
        const event = await EventLog.create({
            bookingId,
            eventType,
            previousState,
            newState,
            actor,
            metadata,
            description
        });
        return event;
    } catch (error) {
        console.error('Failed to log event:', error);
        return null;
    }
};

export const getBookingHistory = async (bookingId) => {
    try {
        const events = await EventLog.find({ bookingId })
            .sort({ createdAt: 1 })
            .populate('actor.userId', 'name email role');
        return events;
    } catch (error) {
        console.error('Failed to get booking history:', error);
        return [];
    }
};

export const getRecentEvents = async (limit = 50) => {
    try {
        const events = await EventLog.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('bookingId', 'service status')
            .populate('actor.userId', 'name email role');
        return events;
    } catch (error) {
        console.error('Failed to get recent events:', error);
        return [];
    }
};
