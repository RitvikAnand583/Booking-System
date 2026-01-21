import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

const initialState = {
    bookings: [],
    currentBooking: null,
    isLoading: false,
    error: null,
}

export const fetchBookings = createAsyncThunk(
    'bookings/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/bookings')
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings')
        }
    }
)

export const fetchBookingById = createAsyncThunk(
    'bookings/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/bookings/${id}`)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking')
        }
    }
)

export const createBooking = createAsyncThunk(
    'bookings/create',
    async (bookingData, { rejectWithValue }) => {
        try {
            const response = await api.post('/bookings', bookingData)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create booking')
        }
    }
)

export const updateBookingStatus = createAsyncThunk(
    'bookings/updateStatus',
    async ({ id, status, reason }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/bookings/${id}/status`, { status, reason })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status')
        }
    }
)

export const assignProvider = createAsyncThunk(
    'bookings/assignProvider',
    async ({ bookingId, providerId }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/bookings/${bookingId}/assign`, { providerId })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to assign provider')
        }
    }
)

export const cancelBooking = createAsyncThunk(
    'bookings/cancel',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/bookings/${id}/cancel`, { reason })
            return response.data.booking
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking')
        }
    }
)

export const rejectBooking = createAsyncThunk(
    'bookings/reject',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/bookings/${id}/reject`, { reason })
            return response.data.booking
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject booking')
        }
    }
)

const bookingSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearCurrentBooking: (state) => {
            state.currentBooking = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookings.pending, (state) => {
                state.isLoading = true
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.isLoading = false
                state.bookings = action.payload
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(fetchBookingById.pending, (state) => {
                state.isLoading = true
            })
            .addCase(fetchBookingById.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentBooking = action.payload
            })
            .addCase(fetchBookingById.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(createBooking.pending, (state) => {
                state.isLoading = true
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.isLoading = false
                state.bookings.unshift(action.payload)
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                const index = state.bookings.findIndex(b => b._id === action.payload._id)
                if (index !== -1) {
                    state.bookings[index] = action.payload
                }
                if (state.currentBooking?._id === action.payload._id) {
                    state.currentBooking = action.payload
                }
            })
            .addCase(assignProvider.fulfilled, (state, action) => {
                const index = state.bookings.findIndex(b => b._id === action.payload._id)
                if (index !== -1) {
                    state.bookings[index] = action.payload
                }
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                const index = state.bookings.findIndex(b => b._id === action.payload._id)
                if (index !== -1) {
                    state.bookings[index] = action.payload
                }
            })
            .addCase(rejectBooking.fulfilled, (state, action) => {
                const index = state.bookings.findIndex(b => b._id === action.payload._id)
                if (index !== -1) {
                    state.bookings[index] = action.payload
                }
            })
    },
})

export const { clearError, clearCurrentBooking } = bookingSlice.actions
export default bookingSlice.reducer
