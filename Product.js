// models/Product.js — Gebya Maekel
const mongoose = require('mongoose');

// ── Category-specific attribute sub-schema ─────────────────────────────────
// Flexible key-value pairs support any product type:
//   Electronics  → { brand: 'Samsung', warranty: '2 years', voltage: '220V' }
//   Clothing     → { size: 'XL', color: 'Red', material: 'Cotton' }
//   Furniture    → { dimensions: '120x60x75cm', weight: '18kg' }
const attributeSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    unit:  { type: String },   // e.g. 'kg', 'cm', 'ETB'
  },
  { _id: false }
);

// ── Variant sub-schema (for products with SKU variants) ───────────────────────
const variantSchema = new mongoose.Schema(
  {
    sku:        { type: String, trim: true },
    label:      { type: String, trim: true },   // e.g. "Red / XL"
    attributes: [attributeSchema],
    price:      { type: Number, required: true, min: 0 },  // ETB
    stock:      { type: Number, default: 0, min: 0 },
    images:     [{ type: String }],
  },
  { _id: true }
);

// ── Product schema ─────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    vendor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    // ── Core fields ────────────────────────────────────────────────────────
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    slug:        { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, maxlength: 5000 },
    category:    { type: String, required: true, trim: true },  // e.g. 'Electronics'
    subcategory: { type: String, trim: true },                  // e.g. 'Smartphones'
    brand:       { type: String, trim: true },

    // ── Pricing (ETB) ──────────────────────────────────────────────────────
    basePrice:     { type: Number, required: true, min: 0 },  // used if no variants
    discountPrice: { type: Number, min: 0 },
    currency:      { type: String, default: 'ETB' },

    // ── Inventory ──────────────────────────────────────────────────────────
    stock:    { type: Number, default: 0, min: 0 },
    sku:      { type: String, trim: true },
    variants: [variantSchema],  // empty array = single-variant product

    // ── Flexible attributes (any product type) ─────────────────────────────
    attributes: [attributeSchema],

    // ── Media ──────────────────────────────────────────────────────────────
    images:    [{ type: String }],   // Cloudinary / S3 URLs; first = thumbnail
    thumbnail: { type: String },

    // ── Shipping (Ethiopia-specific) ───────────────────────────────────────
    weight:        { type: Number },          // kg
    shippingZones: [{ type: String }],       // e.g. ['Addis Ababa', 'Tigray']
    isDigital:     { type: Boolean, default: false },

    // ── Status & visibility ────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['draft', 'active', 'suspended', 'out_of_stock'],
      default: 'draft',
      index:   true,
    },
    isFeatured: { type: Boolean, default: false },

    // ── Aggregated ratings ──────────────────────────────────────────────────
    rating:       { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:  { type: Number, default: 0 },

    // ── SEO ────────────────────────────────────────────────────────────────
    tags:        [{ type: String, lowercase: true, trim: true }],
    metaTitle:   { type: String, maxlength: 70 },
    metaDesc:    { type: String, maxlength: 160 },
  },
  { timestamps: true }
);

// ── Compound indexes ──────────────────────────────────────────────────────────
productSchema.index({ vendor: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ tags: 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' }); // full-text search

// ── Virtuals ──────────────────────────────────────────────────────────────────
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice ?? this.basePrice;
});

// ── Pre-save: auto-generate slug ───────────────────────────────────────────────
productSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug =
      this.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') +
      '-' +
      Date.now();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
