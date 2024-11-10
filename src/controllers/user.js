import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { User } from "../models/user.js";
import { uploadOnCloud } from "../utils/cloudinary.js";

const registeredUser = as(async (req, res) => {
    res.status(200).json({
        message: "ok",
    });
    const { user, email, name, password } = req.body;
    console.log(user, email);
    if ([name, user, email, password].some((val) => val?.trim() === "")) {
        throw new APIError(400, "All field are required.");
    }

    const userExist = User.findOne({ $or: [{ email }, { user }] });
    if (userExist) {
        throw new APIError(409, "User already exist.");
    }

    const avtarFilePath = req.files?.avatar[0]?.path;
    const cvImgFilePath = req.files?.coverImg[0]?.path;

    if (!avtarFilePath) {
        throw new APIError(400, "Profile picture is required.");
    }

    const avatar = await uploadOnCloud(avtarFilePath);
    const cvImg = await uploadOnCloud(cvImgFilePath);

    if (!avatar) {
        throw new APIError(400, "Profile picture is required.");
    }

    const newUser = await User.create({
        name: name,
        avatar: avatar.url,
        coverImg: cvImg?.url || "",
        email: email,
        user: user.toLowerCase()
    })

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (userCreated) {
        throw new APIError(500, "User not created")
    }

    return res.status(201).json(
        new APIResponse(200, userCreated, "user registered successfully.")
    )
});

export { registeredUser };
