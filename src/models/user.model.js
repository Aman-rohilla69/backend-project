import mongoose, { Schema } from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // to create an index on email field for faster search
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, // to remove any extra spaces
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudnary url store here
      required: true,
    },
    coverImage: {
      //cloudnary url store here
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
    this.password = await bcrypt.hash(this.password, 8); //bcrypt hash function to hash(encrypt) the password
    next(); // call next middleware in the stack
  }
});

// bcrypt compare function to compare the password with hashed password to check if the password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
  // password is the plain text password provided by the user during login
  // this.password is the hashed password stored in the database

  return await bcrypt.compare(password, this.password);
};

// This method will generate an access token for the user
userSchema.methods.generateAccessToken = function () {
  return Jwt.sign(
    // create a JWT token with the user details and jwt sign uses the secret key to sign the token
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
  return Jwt.sign(
    // create a JWT token with the user details and jwt sign uses the secret key to sign the token
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } // token will expire in 10d
  );
};

export const User = mongoose.model("User", userSchema);
