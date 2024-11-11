import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { User } from "../models/user.js";
import { uploadOnCloud } from "../utils/cloudinary.js";

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

export { registeredUser, loginUser, logoutUser };
