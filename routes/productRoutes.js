const express = require('express');
const Product = require('../models/Product');
const {
  validateProductBody,
  validateStockChange,
  validateProductId
} = require('../middleware/validateProduct');

const router = express.Router();


function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}


function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


router.post('/', validateProductBody, asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
}));


router.get('/low-stock', asyncHandler(async (req, res) => {
  const products = await Product.find({
    $expr: { $lte: ['$quantity', '$reorderLevel'] }
  }).sort({ quantity: 1 });

  res.json({ count: products.length, lowStockItems: products });
}));


router.get('/summary', asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalStockValue: {
          $sum: { $multiply: ['$price', '$quantity'] }
        },
        avgPrice: { $avg: '$price' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ categories: summary.length, summary });
}));


router.get('/', asyncHandler(async (req, res) => {
  const filter = {};
  const { category, search, minPrice, maxPrice } = req.query;


  if (category) {
    filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
  }


  if (search) {
    const text = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { name: text },
      { sku: text },
      { supplier: text }
    ];
  }


  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice !== undefined) {
      filter.price.$lte = Number(maxPrice);
    }

    if (
      Object.values(filter.price).some(value => !Number.isFinite(value) || value < 0) ||
      (filter.price.$gte !== undefined && filter.price.$lte !== undefined &&
        filter.price.$gte > filter.price.$lte)
    ) {
      return res.status(400).json({ message: 'Invalid price range' });
    }
  }


  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);

  if (!Number.isInteger(page) || page < 1 ||
      !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({
      message: 'Page must be positive and limit must be between 1 and 100'
    });
  }


  const allowedFields = ['name', 'sku', 'category', 'price', 'quantity', 'createdAt'];
  const sortBy = allowedFields.includes(req.query.sortBy)
    ? req.query.sortBy
    : 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  res.json({
    total,
    page,
    totalPages: Math.ceil(total / limit),
    count: products.length,
    products
  });
}));


router.get('/:id', validateProductId, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
}));


router.put('/:id', validateProductId, validateProductBody, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
}));

router.patch('/:id/stock', validateProductId, validateStockChange, asyncHandler(async (req, res) => {
  const change = req.body.change;
  const condition = { _id: req.params.id };



  if (change < 0) {
    condition.quantity = { $gte: Math.abs(change) };
  }

  const product = await Product.findOneAndUpdate(
    condition,
    { $inc: { quantity: change } },
    { new: true }
  );

  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });

    if (!exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(400).json({ message: 'Not enough stock for this sale' });
  }

  res.json({ message: 'Stock updated', product });
}));


router.delete('/:id', validateProductId, asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json({ message: 'Product deleted', id: product._id });
}));

module.exports = router;
