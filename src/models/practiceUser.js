import mongoose from "mongoose";
import { Schema } from "mongoose"; // Import Schema from mongoose
import bcrypt from "bcrypt"; // Import bcrypt for password hashing
import Jwt from "jsonwebtoken"; // Import jsonwebtoken for token generation and security for user authentication
const userSchema1 = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avtar: {
      type: String, // cloudinary url store here
      required: true,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      // to store the refresh token for JWT authentication
      type: String,
    },
    watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  },

  { timestamps: true } // to automatically manage createdAt and updatedAt fields
);

// Pre-save hook to hash (encrypt) the password before saving the user

userSchema1.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
});

userSchema1.methods.isPasswordCorrect(async function (password) {
  return await bcrypt.compare(password, this.password);
});

userSchema1.methods.generateAccessToken = function () {
  Jwt.sign(
    {
      _id: this._id,
      username: this.username,
      fullName: this.fullname,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,

    { expireIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema1.methods.generateRefreshToken = function () {
  Jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// userSchema.methods.isPasswordCorrect(async function (password) {
//   return await bcrypt.compare(password, this.password);
// });
