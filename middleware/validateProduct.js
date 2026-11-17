const allowedFields = [
  'name',
  'sku',
  'category',
  'price',
  'quantity',
  'reorderLevel',
  'supplier'
];

function validateProductBody(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ message: 'Request body must be a JSON object' });
  }

  const fields = Object.keys(body);
  const invalidFields = fields.filter((field) => !allowedFields.includes(field));

  if (invalidFields.length > 0) {
    return res.status(400).json({
      message: 'Unknown field(s) in request body',
      fields: invalidFields
    });
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Please provide at least one product field' });
  }


  
  if (req.method === 'POST') {
    const requiredFields = ['name', 'sku', 'category', 'price', 'quantity', 'supplier'];
    const missingFields = requiredFields.filter((field) => body[field] === undefined);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required field(s)',
        fields: missingFields
      });
    }
  }

  next();
}

function validateStockChange(req, res, next) {
  const change = req.body && req.body.change;

  if (!Number.isInteger(change) || change === 0) {
    return res.status(400).json({
      message: 'change must be a non-zero whole number (positive to restock, negative for a sale)'
    });
  }

  next();
}

function validateProductId(req, res, next) {
  const mongoose = require('mongoose');

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  next();
}

module.exports = {
  validateProductBody,
  validateStockChange,
  validateProductId
};
