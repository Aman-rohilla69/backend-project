import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();
router.route("/register").post(
  // jo bhi method execute hoga,uske pehle multer ka upload middleware chalega, mtlb usse phele middleware use hoga // multer ka upload middleware chalega, uske baad registerUser function chalega.
  upload.fields([  // middleware for handling multipart/form-data, which is used for uploading files
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

export default router;
