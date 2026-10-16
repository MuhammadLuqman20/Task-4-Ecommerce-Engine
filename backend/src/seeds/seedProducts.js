import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

export const seedProductsData = [
  {
    title: 'Aura Pro Noise-Cancelling Headphones',
    description:
      'Engineered with premium 40mm beryllium drivers, active hybrid noise cancellation, 45-hour battery life, and plush memory-foam ear cushions. Perfect for audiophiles and deep work sessions.',
    price: 249.99,
    category: 'Audio',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    stockQuantity: 25,
    isActive: true,
    rating: 4.9,
    reviewsCount: 142,
  },
  {
    title: 'Apex Mechanical Gaming Keyboard',
    description:
      'Ultra-responsive hot-swappable mechanical switches, aircraft-grade anodized aluminum frame, per-key RGB backlighting, and magnetic ergonomic wrist rest.',
    price: 129.5,
    category: 'Electronics',
    imageUrl:
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&auto=format&fit=crop&q=80',
    stockQuantity: 40,
    isActive: true,
    rating: 4.8,
    reviewsCount: 88,
  },
  {
    title: 'Titan Chrono Smartwatch Ultra',
    description:
      'Rugged aerospace titanium case with sapphire crystal glass. Features precision dual-frequency GPS, 100m water resistance, continuous ECG and SpO2 tracking.',
    price: 399.0,
    category: 'Wearables',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    stockQuantity: 18,
    isActive: true,
    rating: 4.95,
    reviewsCount: 210,
  },
  {
    title: 'Quantum 4K Ultra-Wide Studio Monitor',
    description:
      '34-inch curved QD-OLED display featuring 99% DCI-P3 color gamut, 175Hz refresh rate, USB-C 90W power delivery, and built-in KVM switch for multi-device workflows.',
    price: 799.99,
    category: 'Electronics',
    imageUrl:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    stockQuantity: 12,
    isActive: true,
    rating: 4.85,
    reviewsCount: 64,
  },
  {
    title: 'ErgoComfort Leather Desk Chair',
    description:
      'Engineered with multi-dimensional lumbar adjustment, breathable full-grain leather, 4D armrests, and dynamic recline lock for posture-perfect productivity.',
    price: 349.0,
    category: 'Accessories',
    imageUrl:
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80',
    stockQuantity: 15,
    isActive: true,
    rating: 4.75,
    reviewsCount: 52,
  },
  {
    title: 'Nomad Tech Sling & Organizer',
    description:
      'Weatherproof ballistic nylon compact sling with magnetic Fidlock buckle, padded tablet sleeve, RFID-blocking card pocket, and hidden passport compartment.',
    price: 69.95,
    category: 'Accessories',
    imageUrl:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    stockQuantity: 50,
    isActive: true,
    rating: 4.7,
    reviewsCount: 95,
  },
  {
    title: 'Lumix Precision Wireless Mouse',
    description:
      '40,000 DPI optical sensor, silent tactile switches, infinite hyper-fast scroll wheel, and multi-device Bluetooth + 2.4GHz seamless switching.',
    price: 89.99,
    category: 'Electronics',
    imageUrl:
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
    stockQuantity: 35,
    isActive: true,
    rating: 4.8,
    reviewsCount: 116,
  },
  {
    title: 'EchoSphere Hi-Res Smart Speaker',
    description:
      'Room-filling 360-degree spatial acoustic sound with integrated Dolby Atmos, touch capacitive glass top, and multi-room lossless streaming.',
    price: 189.0,
    category: 'Audio',
    imageUrl:
      'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&auto=format&fit=crop&q=80',
    stockQuantity: 22,
    isActive: true,
    rating: 4.65,
    reviewsCount: 78,
  },
];

export const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Clearing existing products...');
    await Product.deleteMany({});

    console.log('[Seeder] Inserting catalog products...');
    await Product.insertMany(seedProductsData);

    console.log('[Seeder] Ensuring default demo customer account exists...');
    const demoEmail = 'customer@example.com';
    const existingDemo = await User.findOne({ email: demoEmail });
    if (!existingDemo) {
      await User.create({
        name: 'Demo Customer',
        email: demoEmail,
        password: 'Password123!',
        role: 'customer',
      });
      console.log(`[Seeder] Created demo user: ${demoEmail} / Password123!`);
    }

    console.log('[Seeder] Ensuring default admin account exists...');
    const adminEmail = 'admin@example.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: 'AdminPassword123!',
        role: 'admin',
      });
      console.log(`[Seeder] Created admin user: ${adminEmail} / AdminPassword123!`);
    }

    console.log('[Seeder] Seed successfully completed!');
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
  }
};

// If run directly via `node src/seeds/seedProducts.js`
if (process.argv[1]?.includes('seedProducts.js')) {
  seedDatabase().then(async () => {
    await disconnectDB();
    process.exit(0);
  });
}
