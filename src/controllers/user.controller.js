import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    console.log("refreshToken from fn", refreshToken);
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  //get details
  //find if exists
  //compare password
  //generate tokens access and refresh
  //send cookies
  const { email, username, password } = req.body;
  if (!(email || username)) {
    throw new ApiError(400, "Email or username is required");
  }
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid Credentials");
  }
  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); //optional

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized");
    }
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid token");
    }
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Token mismatch");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user._id
    );
    console.log(accessToken, newRefreshToken);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
