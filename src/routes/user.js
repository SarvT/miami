import { Router } from "express";
import {
    loginUser,
    logoutUser,
    refreshAccToken,
    registeredUser,
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

export default router;
