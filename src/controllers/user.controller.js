import asyncHandler from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Assuming you have a utility function to handle Cloudinary uploads
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId); // Find the user by ID in the database
    const accessToken = user.generateAccessToken(); // This method should be defined in your User model to generate an access token
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // Save the refresh token in the user document
    await user.save({ validateBeforeSave: false }); // Save the user document with the new refresh token in the database
    // validateBeforeSave: false is used to skip validation for the refreshToken field, as it is not required during user registration or login
    // This is useful when you want to update the user document without triggering validation errors for fields that are not required at that moment
    return { accessToken, refreshToken }; // Return both tokens
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get users details from frontend
  // validation means that we check if the user has provided all the required fields-not empty details
  // check if user already exists in the database : username,email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from the response
  // check for user creation
  // return response

  const { fullName, email, username, password } = req.body; // destructure the body of the request to get the user details
  console.log("email:", email);
  console.log("password:", password);
  console.log("body fields", req.body);

  // if(fullName===""){
  //   throw new ApiError(400,"Full name is required");
  // }
  // validation means that we check if the user has provided all the required fields-not empty details
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "") // some() used to check if any of the fields are empty means, "?" means optional chaining, if field is null or undefined, it will not throw an error and will return false, so we check if any of the fields are empty or not provided
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // $or is used to check if any of the conditions are true
  // if user with same username or email already exists, then throw error
  // .findOne() is used to find a single document in the database
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with same username or email already exists");
  }
  console.log("req.files:-", req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path; // multer middleware will save the file in the specified path
  /* const coverImageLocalPath = req.files?.coverImage[0]?.path;*/

  let coverImageLocalPath;
  if (
    req.files && // check if req.files is defined
    Array.isArray(req.files.coverImage) && // check if coverImage is an array
    req.files.coverImage.length > 0 // check if coverImage array has at least one file
  ) {
    coverImageLocalPath = req.files.coverImage[0].path; // if coverImage is provided, then get the path of the first file in the array
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar image");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url, // Assuming the uploadOnCloudinary function returns an object with a url property
    coverImage: coverImage?.url || "", // coverImage can be null if not provided
    email,
    password, // password will be hashed in the user model pre-save hook
    username: username.toLowerCase(), // to ensure username is stored in lowercase
  });
  const createdUser = await User.findById(user._id) // findById() is used to find a document by its id
    .select("-password -refreshToken"); // select() is used to exclude the password and refreshToken fields from the response exclude means that we don't want to return these fields in the response
  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  /* aise bhi kaam hoo jayega :- return res.status(201).json({createdUser}); // return the created user in the response with status code 201 (Created) */
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        createdUser,
        "user created (registered) successfully"
      )
    );

  // .populate("watchHistory", "-videoUrl -createdAt -updatedAt") // populate() is used to populate the watchHistory field with the Video documents, excluding videoUrl, createdAt, and updatedAt fields
  // .exec() // exec() is used to execute the query and return a promise
  // .lean(); // lean() is used to return a plain JavaScript object instead of a Mongoose document
});

const loginUser = asyncHandler(async (req, res) => {
  // get user details from frontend,req.body => data (lelo) like username and password,email;
  // username or email (validation check)
  // find the user
  // if user exists check password
  // if password is correct, generate access token and refresh token
  //  send cookies return response with user details and tokens

  const { email, username, password } = req.body;

  console.log("req body in loginUser:", req.body);

  if (!email && !username) {
    // check if email and username is provided
    throw new ApiError(400, "username or email is required");
  }
  const user = await User.findOne({
    $or: [{ username: username }, { email: email }], // $or operator is used to find a user by either username or email
  });
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  console.log(user, "logged in succesfully");

  // if user exists, check password
  const isPasswordValid = await user.isPasswordCorrect(password);
  console.log("user password ", password);
  console.log("DB password: ", user.password);

  if (!isPasswordValid) {
    new ApiError(401, "Invalid user password");
  }
  // if password is correct, generate access token and refresh token

  // generateAccessAndRefreshTokens is a function that generates access and refresh tokens for the user
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password,-refreshToken"
  ); // select() is used to exclude the password and refreshToken fields from the response

  // cookie is used to store the refresh token in the browser
  const options = {
    httpOnly: true, // httpOnly:true means that the cookie cannot be accessed by JavaScript in the browser, it can only be accessed by the server
    secure: true, // secure:true means that the cookie will only be sent over HTTPS
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, // return the logged in user details
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // clear the cookies and return response

  // findByIdAndUpdate is used to find a user by id and update the user document
  await User.findByIdAndUpdate(
    // req.user._id is the id of the user who is logged in, req.user is set by the verifyJWT middleware
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  console.log("User logged out successfully, clearing cookies");

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // check if refresh token is present in cookies or request body (mobile ke liye)
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(
      401,
      "Refresh token is required to refresh access token"
    );
  }
  // Verify the refresh token using the secret key
  // Jwt.verify() is used to verify the refresh token
  try {
    const decodedToken = Jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // If the token is valid, it will return the decoded token, otherwise it will throw an error
    // decoded token means that it will return the payload of the token, which contains the user id and other information
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(404, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    // Generate new access and refresh tokens
    // Set the new tokens in cookies and return response
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._Id);
    //
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access tokens refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };

// const registerUser = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     message: "ok",
//   });
// });
