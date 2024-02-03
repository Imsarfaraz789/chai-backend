import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiErrror.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import ApiResponse from "../utils/ApiResponse.js"


const register = asyncHandler(async (req, res) => {
    // get user datails from frontend
    const { fullName, email, userName, password } = req.body
    console.log(email)
    // validation - not empty
    if (
        [fullName, email, userName, password].some((field) => field?.trim() == "")
    ) {
        throw new ApiError(400, "All field are required")
    }
    // check if user already exist: usernmae, email
    const existedUser = User.findOne({
        $or: [
            { userName },
            { email }
        ]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exist")
    }
    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar files is required")
    }
    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = uploadOnCloudinary(coverImageLocalPath)
    // create user object - crate entry in db
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            userName: userName.toLowerCase()
        }
    )


    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})




export default register