import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
  // jo bhi method execute hoga,uske pehle multer ka upload middleware chalega, mtlb usse phele middleware use hoga // multer ka upload middleware chalega, uske baad registerUser function chalega.
  upload.fields([
    // middleware for handling multipart/form-data, which is used for uploading files
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);

// securd routes

router.route("/logout").post(verifyJWT, logoutUser);   //verifyJWT is the middleware 
router.route("/refresh-token").post(refreshAccessToken); // refreshAccessToken is the controller function
export default router;
