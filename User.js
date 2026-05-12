// models/User.js — Gebya Maekel
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = Object.freeze({ BUYER: 'buyer', SELLER: 'seller', ADMIN: 'admin' });

// ── Store sub-document (only populated for sellers) ──────────────────────────
const storeSchema = new mongoose.Schema(
  {
    name:        { type: String, trim: true, maxlength: 120 },
    slug:        { type: String, lowercase: true, trim: true, unique: true, sparse: true },
    description: { type: String, maxlength: 1000 },
    logo:        { type: String },          // Cloudinary / S3 URL
    banner:      { type: String },
    address:     { type: String, maxlength: 300 },
    phone:       { type: String, maxlength: 20 },
    // Ethiopian bank / Telebirr payout details
    payoutMethod: {
      type:          { type: String, enum: ['telebirr', 'chapa_transfer', 'bank'] },
      accountNumber: { type: String },
      accountName:   { type: String },
    },
    isVerified:  { type: Boolean, default: false },
    rating:      { type: Number, default: 0, min: 0, max: 5 },
    totalSales:  { type: Number, default: 0 },
  },
  { _id: false }
);

// ── User schema ───────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    firstName:    { type: String, required: true, trim: true, maxlength: 60 },
    lastName:     { type: String, required: true, trim: true, maxlength: 60 },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:        { type: String, trim: true },          // Ethiopian format: +251…
    passwordHash: { type: String, required: true, select: false },
    role:         { type: String, enum: Object.values(ROLES), default: ROLES.BUYER },
    avatar:       { type: String },
    isActive:     { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },

    // Seller-only
    store: {
      type:     storeSchema,
      default:  undefined,   // only set when role === 'seller'
    },

    // Refresh token support
    refreshTokens: [{ type: String, select: false }],

    // Password reset
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ 'store.slug': 1 }, { sparse: true });

// ── Hooks ─────────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// ── Instance methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.isSeller = function () {
  return this.role === ROLES.SELLER;
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
