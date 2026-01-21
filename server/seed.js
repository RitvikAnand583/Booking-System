import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Booking from './models/Booking.js';
import EventLog from './models/EventLog.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanfanatics';

const seedUsers = [
    {
        email: 'admin@cleanfanatics.com',
        password: 'admin123',
        name: 'Admin User',
        phone: '+91 9876543210',
        role: 'admin'
    },
    {
        email: 'customer@test.com',
        password: 'customer123',
        name: 'Rahul Sharma',
        phone: '+91 9876543211',
        role: 'customer'
    },
    {
        email: 'customer2@test.com',
        password: 'customer123',
        name: 'Priya Patel',
        phone: '+91 9876543212',
        role: 'customer'
    },
    {
        email: 'provider1@test.com',
        password: 'provider123',
        name: 'Amit Kumar',
        phone: '+91 9876543213',
        role: 'provider',
        services: ['cleaning', 'pest-control'],
        availability: true,
        rating: 4.8,
        completedJobs: 45,
        location: { city: 'Mumbai', pincode: '400001' }
    },
    {
        email: 'provider2@test.com',
        password: 'provider123',
        name: 'Suresh Electricals',
        phone: '+91 9876543214',
        role: 'provider',
        services: ['electrical', 'ac-repair'],
        availability: true,
        rating: 4.5,
        completedJobs: 32,
        location: { city: 'Mumbai', pincode: '400002' }
    },
    {
        email: 'provider3@test.com',
        password: 'provider123',
        name: 'Rajesh Plumbing',
        phone: '+91 9876543215',
        role: 'provider',
        services: ['plumbing'],
        availability: true,
        rating: 4.7,
        completedJobs: 58,
        location: { city: 'Delhi', pincode: '110001' }
    },
    {
        email: 'provider4@test.com',
        password: 'provider123',
        name: 'Paint Masters',
        phone: '+91 9876543216',
        role: 'provider',
        services: ['painting', 'carpentry'],
        availability: false,
        rating: 4.9,
        completedJobs: 27,
        location: { city: 'Bangalore', pincode: '560001' }
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await User.deleteMany({});
        await Booking.deleteMany({});
        await EventLog.deleteMany({});
        console.log('Cleared existing data');

        const createdUsers = [];
        for (const userData of seedUsers) {
            const user = await User.create(userData);
            createdUsers.push(user);
            console.log(`Created ${user.role}: ${user.email}`);
        }

        const customer = createdUsers.find(u => u.email === 'customer@test.com');
        const provider = createdUsers.find(u => u.email === 'provider1@test.com');

        const sampleBookings = [
            {
                customerId: customer._id,
                providerId: provider._id,
                service: 'cleaning',
                status: 'completed',
                scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                scheduledTime: '10:00 AM',
                address: { street: '123 MG Road', city: 'Mumbai', pincode: '400001' },
                description: 'Deep cleaning for 2BHK apartment',
                estimatedPrice: 500,
                finalPrice: 500
            },
            {
                customerId: customer._id,
                providerId: provider._id,
                service: 'cleaning',
                status: 'in-progress',
                scheduledDate: new Date(),
                scheduledTime: '02:00 PM',
                address: { street: '456 Link Road', city: 'Mumbai', pincode: '400053' },
                description: 'Kitchen deep cleaning',
                estimatedPrice: 400
            },
            {
                customerId: customer._id,
                service: 'plumbing',
                status: 'pending',
                scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                scheduledTime: '11:00 AM',
                address: { street: '789 Hill Road', city: 'Mumbai', pincode: '400050' },
                description: 'Bathroom pipe leakage',
                estimatedPrice: 400
            }
        ];

        for (const bookingData of sampleBookings) {
            const booking = await Booking.create(bookingData);
            console.log(`Created booking: ${booking.service} - ${booking.status}`);
        }

        console.log('\n✅ Seed data created successfully!\n');
        console.log('📧 Test Accounts:');
        console.log('─────────────────────────────────────');
        console.log('Admin:    admin@cleanfanatics.com / admin123');
        console.log('Customer: customer@test.com / customer123');
        console.log('Provider: provider1@test.com / provider123');
        console.log('─────────────────────────────────────\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
