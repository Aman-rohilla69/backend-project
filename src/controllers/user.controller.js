import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Assuming you have a utility function to handle Cloudinary uploads
import { ApiResponse } from "../utils/ApiResponse.js";
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
    req.files &&           // check if req.files is defined
    Array.isArray(req.files.coverImage) &&  // check if coverImage is an array
    req.files.coverImage.length > 0  // check if coverImage array has at least one file
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

export { registerUser };

// const registerUser = asyncHandler(async (req, res) => {
//   res.status(200).json({
//     message: "ok",
//   });
// });
