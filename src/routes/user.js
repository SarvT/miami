import { Router } from "express";
import { registeredUser } from "../controllers/user";
import { upload } from "../middlewares/multer.js";

const router = Router();

// router.route

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImg", maxCount: 1 },
    ]),
    registeredUser,
);

export default router;
