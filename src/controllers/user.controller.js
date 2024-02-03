import asyncHandler from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiErrror.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"


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
    const existedUser = await User.findOne({
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
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
        console.error("Cover Image upload failed. Response:", coverImage);
        // Handle the error or throw an exception if needed
    }

    if (!avatar) {
        console.error("Avatar upload failed. Response:", avatar);
        throw new ApiError(400, "Avatar file is required");
    }


    try {
        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            userName: userName.toLowerCase()
        });

    } catch (error) {
        console.error("Error creating user:", error);
    }

})




export default register