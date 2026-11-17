require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

const sampleProducts = [
  {
    name: 'Study Table',
    sku: 'FURN-TB-812',
    category: 'Furniture',
    price: 3999,
    quantity: 2,
    reorderLevel: 4,
    supplier: 'IKEA India'
  },
  {
    name: 'Ergonomic Office Chair',
    sku: 'FURN-CH-101',
    category: 'Furniture',
    price: 6500,
    quantity: 3,
    reorderLevel: 5,
    supplier: 'Featherlite'
  },
  {
    name: 'Wireless Noise-Cancelling Headphones',
    sku: 'ELEC-HP-304',
    category: 'Electronics',
    price: 8999,
    quantity: 15,
    reorderLevel: 10,
    supplier: 'Sony Electronics'
  },
  {
    name: 'Mechanical Gaming Keyboard',
    sku: 'ELEC-KB-550',
    category: 'Electronics',
    price: 3499,
    quantity: 25,
    reorderLevel: 8,
    supplier: 'Logitech'
  },
  {
    name: 'Ultra-Wide 27-inch Monitor',
    sku: 'ELEC-MN-720',
    category: 'Electronics',
    price: 18500,
    quantity: 8,
    reorderLevel: 3,
    supplier: 'LG Electronics'
  },
  {
    name: 'USB-C Fast Charging Hub',
    sku: 'ELEC-HB-108',
    category: 'Electronics',
    price: 1499,
    quantity: 48,
    reorderLevel: 15,
    supplier: 'Anker Tech'
  },
  {
    name: 'Men Slim-Fit Cotton Shirt',
    sku: 'APPL-SH-201',
    category: 'Apparel',
    price: 1499,
    quantity: 40,
    reorderLevel: 15,
    supplier: 'Raymond'
  },
  {
    name: 'Casual Denim Jacket',
    sku: 'APPL-JK-405',
    category: 'Apparel',
    price: 2299,
    quantity: 38,
    reorderLevel: 10,
    supplier: 'Levi Strauss'
  },
  {
    name: 'Hardcover Spiral Notebook A5',
    sku: 'STNY-NB-402',
    category: 'Stationery',
    price: 180,
    quantity: 50,
    reorderLevel: 25,
    supplier: 'Classmate'
  },
  {
    name: 'Stainless Steel Water Bottle 1L',
    sku: 'HOME-WB-901',
    category: 'Home & Kitchen',
    price: 650,
    quantity: 1,
    reorderLevel: 5,
    supplier: 'Milton'
  },
  {
    name: 'Ceramic Coffee Mug Set',
    sku: 'HOME-MG-602',
    category: 'Home & Kitchen',
    price: 499,
    quantity: 2,
    reorderLevel: 4,
    supplier: 'Clay Craft'
  }
];

async function seedData() {
  try {
    await connectDB();
    await Product.deleteMany({});
    console.log('Cleared existing products');

    const created = await Product.create(sampleProducts);
    console.log(`Successfully seeded ${created.length} products into the database`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seedData();
