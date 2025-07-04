import mongoose, { Schema } from "mongoose";
import { JsonWebToken } from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
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
      type: String, //cloudnary url store here
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { typestamps: true }
);
// async function used to call and check errors with hashed password
userSchema.pre("save", async function (next) {
  // pre-save hook middleware use to
  // Check if the password is modified before hashing
  if (!this.isModified("password")) return next();
  else {
    this.password = bcrypt.hash(this.password, 10); //bcrypt hash function to hash(encrypt) the password
    next(); // call next middleware in the stack
  }
});

// bcrypt compare function to compare the password with hashed password to check if the password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// This method will generate an access token for the user
userSchema.methods.generateAccessToken = function () {
  Jwt.sign(      // create a JWT token with the user details and jwt sign uses the secret key to sign the token
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } // token will expire in 1d
  );
};

// This method will generate a refresh token for the user
userSchema.methods.generateRefreshToken = function () {
  Jwt.sign(  // create a JWT token with the user details and jwt sign uses the secret key to sign the token
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // token will expire in 10d
  );
};

export const User = mongoose.model("User", userSchema);
