import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { User } from "../models/user.js";
import { uploadOnCloud } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessnRefreshToken = async (userId) => {
    try {
        const currUser = await User.findById(userId);
        const accTkn = currUser.generateAccessToken();
        const rfrTkn = currUser.generateRefreshToken();

        currUser.refreshToken = rfrTkn;
        await currUser.save({ validateBeforeSave: false });

        return { accTkn, rfrTkn };
    } catch (error) {
        throw new APIError(
            500,
            " Something went wrong, token can't be generated.",
        );
    }
};

const registeredUser = async (req, res) => {
    res.status(200).json({
        message: "ok",
    });
    const { user, email, name, password } = req.body;
    console.log(user, email);
    if ([name, user, email, password].some((val) => val?.trim() === "")) {
        throw new APIError(400, "All field are required.");
    }

    const userExist = await User.findOne({ $or: [{ email }, { user }] });
    if (userExist) {
        throw new APIError(409, "User already exist.");
    }

    const avtarFilePath = req.files?.avatar[0]?.path;
    // const cvImgFilePath = req.files?.coverImg[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

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
        user: user.toLowerCase(),
    });

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken",
    );
    if (userCreated) {
        throw new APIError(500, "User not created");
    }

    return res
        .status(201)
        .json(
            new APIResponse(200, userCreated, "user registered successfully."),
        );
};

const loginUser = asyncHandler(async (req, res) => {
    const { email, user, password } = req.body;
    if (!email && !user) throw new APIError(400, "username or email is empty.");
    const currUser = await User.findOne({
        $or: [{ email }, { user }],
    });
    if (!currUser) throw new ApiError(404, "User does not exist");
    const isPasswordValid = await currUser.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accTkn, rfrTkn } = await generateAccessnRefreshToken(currUser._id);

    const userSession = User.findById(currUser._id).select(
        "-password -refreshToken",
    );
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200).cookie("accessToken", accTkn, options);
    cookie("refreshToken", rfrTkn, options).json(
        new APIResponse(200, {
            user: userSession,
            accTkn,
            rfrTkn,
        }),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        },
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new APIResponse(200, {}, "User's session is over."));
});

const refreshAccToken = asyncHandler(async (req, res) => {
    const inputRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!inputRefreshToken) throw new APIError(401, "Unauthorized request");

    try {
        const extractedToken = jwt.verify(
            inputRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        );

        const user = await User.findById(extractedToken?._id);
        if (!user) throw new APIError(401, "Unauthorized token");

        if (inputRefreshToken !== user?.refreshToken)
            throw new APIError(401, "Refresh token is expired");

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accTkn, newRfrTkn } = await generateAccessnRefreshToken(
            user._id,
        );

        return res
            .status(200)
            .cookie("accessToken", accTkn)
            .cookie("refreshToken", newRfrTkn)
            .json(
                new APIResponse(
                    200,
                    { accTkn, refreshToken: newRfrTkn },
                    "Access token is generated.",
                ),
            );
    } catch (error) {
        throw new APIError(401, error?.message || "Invalid refresh token");
    }
});

const changeUserPassword = asyncHandler(async (req, res) => {
    const { currPass, newPass } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(currPass);

    if (!isPasswordCorrect)
        throw new APIError(400, "incorrect current password.");

    user.password = newPass;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new APIResponse(200, {}, "password changed successfully."));
});

const getCurrUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new APIResponse(200, req.user, "current user"));
});

const updateUserDetails = asyncHandler(async(req, res)=>{
        const {name, email} = req.body

        if(!name || !email) throw new APIError(400, "all fields are required")

        const user = await User.findByIdAndUpdate(req.user?._id, {
            $set:{
                name, email:email, 
            }
        }, {new:true}).select("-password")

        return res.status(200).json(new APIResponse(200, user, "User details updated successfully!"))
})

const updateProfilePicture = asyncHandler(async(req, res)=>{
    const filePath = req.file?.path
    if(!filePath) throw new APIError(400, "file not uploaded")
    const profilePic = await uploadOnCloud(filePath)

    if(!profilePic.url)throw new APIError(400, "error while uploading the picture")

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar: profilePic.url
            }
        },{new:true}).select("-password")

        
        return res.status(200).json(new APIResponse(200, user, "Profile Picture updated successfully"))
})


const updateCvImg = asyncHandler(async(req, res)=>{
    const filePath = req.file?.path
    if(!filePath) throw new APIError(400, "file not uploaded")
    const cvImg = await uploadOnCloud(filePath)

    if(!cvImg.url)throw new APIError(400, "error while uploading the picture")

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                cover: cvImg.url
            }
        },{new:true}).select("-password")

        return res.status(200).json(new APIResponse(200, user, "Cover Image updated successfully"))
})

export {
    registeredUser,
    loginUser,
    logoutUser,
    refreshAccToken,
    changeUserPassword,
    getCurrUser,
    updateUserDetails,
    updateProfilePicture,
    updateCvImg
};
