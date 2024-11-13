import { Router } from "express";
import {
    changeUserPassword,
    getCurrUser,
    getUserProfileDetails,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccToken,
    registeredUser,
    updateCvImg,
    updateProfilePicture,
    updateUserDetails,
} from "../controllers/user.js";
import { upload } from "../middlewares/multer.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImg", maxCount: 1 },
    ]),
    registeredUser,
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyToken, logoutUser);
router.route("/refresh-tkn").post(refreshAccToken);
router.route("/change-password").post(verifyToken, changeUserPassword);
router.route("/curr-user").get(verifyToken, getCurrUser);

router.route("/update-profile").patch(verifyToken, updateUserDetails);
router
    .route("/profile-img")
    .patch(verifyToken, upload.single("avatar"), updateProfilePicture);
router
    .route("/cv-img")
    .patch(verifyToken, upload.single("/cv-img"), updateCvImg);

router.route("/c/:name").get(verifyToken, getUserProfileDetails);
router.route("/history").get(verifyToken, getWatchHistory);

export default router;
