import User from '../models/User.js';

export const findAvailableProvider = async (service, excludeIds = []) => {
    try {
        const provider = await User.findOne({
            role: 'provider',
            services: service,
            availability: true,
            isActive: true,
            _id: { $nin: excludeIds }
        })
            .sort({ rating: -1, completedJobs: -1 })
            .select('-password');

        return provider;
    } catch (error) {
        console.error('Failed to find available provider:', error);
        return null;
    }
};

export const getAvailableProviders = async (service) => {
    try {
        const providers = await User.find({
            role: 'provider',
            services: service,
            availability: true,
            isActive: true
        })
            .sort({ rating: -1, completedJobs: -1 })
            .select('-password');

        return providers;
    } catch (error) {
        console.error('Failed to get available providers:', error);
        return [];
    }
};

export const assignProviderToBooking = async (booking, providerId = null) => {
    try {
        let provider;

        if (providerId) {
            provider = await User.findById(providerId);
            if (!provider || provider.role !== 'provider') {
                return { success: false, message: 'Invalid provider' };
            }
        } else {
            const excludeIds = booking.retryCount > 0 ? [booking.providerId] : [];
            provider = await findAvailableProvider(booking.service, excludeIds);

            if (!provider) {
                return { success: false, message: 'No available provider found' };
            }
        }

        return { success: true, provider };
    } catch (error) {
        console.error('Failed to assign provider:', error);
        return { success: false, message: 'Assignment failed' };
    }
};
