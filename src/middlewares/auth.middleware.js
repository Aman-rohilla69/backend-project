// import { replace } from "react-router-dom";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { log } from "console";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token:", token); // Log the token for debugging purposes
    // Check if the token is present in cookies or Authorization header
    
    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }

    const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    )

    if (!user) {
      //Next_VIDEO : discuss about frontend
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invaild access token");
  }
});
