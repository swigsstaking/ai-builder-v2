import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password: { type: String, select: false },
  passwordHash: { type: String, select: false },
  googleId: { type: String, sparse: true, unique: true },
  avatar: { type: String },
  authMethod: { type: String, enum: ['local', 'google'], default: 'local' },
  role: { type: String, enum: ['admin', 'superadmin', 'editor', 'client'], default: 'client' },
  assignedSites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Site' }],
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  const hash = this.password || this.passwordHash;
  if (!hash) return false;
  return bcrypt.compare(candidatePassword, hash);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model('User', userSchema);
