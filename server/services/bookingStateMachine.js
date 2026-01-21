const VALID_TRANSITIONS = {
    'pending': ['assigned', 'cancelled'],
    'assigned': ['accepted', 'pending', 'cancelled', 'failed'],
    'accepted': ['in-progress', 'cancelled'],
    'in-progress': ['completed', 'cancelled', 'failed'],
    'completed': [],
    'cancelled': [],
    'failed': ['pending']
};

export const canTransition = (currentStatus, newStatus) => {
    const validNext = VALID_TRANSITIONS[currentStatus] || [];
    return validNext.includes(newStatus);
};

export const getNextValidStates = (currentStatus) => {
    return VALID_TRANSITIONS[currentStatus] || [];
};

export const validateTransition = (currentStatus, newStatus, isAdmin = false) => {
    if (isAdmin) {
        return { valid: true };
    }

    if (!canTransition(currentStatus, newStatus)) {
        return {
            valid: false,
            message: `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${VALID_TRANSITIONS[currentStatus].join(', ') || 'none'}`
        };
    }

    return { valid: true };
};

export const getStatusColor = (status) => {
    const colors = {
        'pending': 'yellow',
        'assigned': 'blue',
        'accepted': 'indigo',
        'in-progress': 'purple',
        'completed': 'green',
        'cancelled': 'gray',
        'failed': 'red'
    };
    return colors[status] || 'gray';
};

export const getStatusLabel = (status) => {
    const labels = {
        'pending': 'Pending',
        'assigned': 'Assigned',
        'accepted': 'Accepted',
        'in-progress': 'In Progress',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'failed': 'Failed'
    };
    return labels[status] || status;
};
