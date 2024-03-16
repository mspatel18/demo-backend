import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty,etc
  // check if user already exists - findby username or email
  // check for images and check for avatar
  // upload to cloudinary,check avatar and get url
  // create User Object - create entry in db
  // remove pass and refresh token field from response
  // check for user creation
  // return response

  const { fullName, username, email, password } = req.body;
  console.log(fullName, username, email, password);
  if (!fullName || !username || !email || !password) {
    // res.status(400);
    throw new ApiError(400, "Please fill all the fields"); //if Error() is used then only message is send
  }
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  //   console.log(existedUser.username);
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }
  console.log(
    "req.files",
    req.files,
    req.files?.avatar[0].path
    // req.files?.coverImage[0]?.path
    // req.files.coverImage[0]
  );
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage
  // [0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  console.log(avatarLocalPath, coverImageLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Something went wrong");
  }
  const user = await User.create({
    fullName: fullName,
    username: username.toLowerCase(),
    email: email,
    password: password,
    avatar: avatar.url,
    coverImage: coverImage?.url || null,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created"));
});

export { registerUser };
