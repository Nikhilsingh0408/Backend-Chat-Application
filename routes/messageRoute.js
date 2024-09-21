import express from "express";
import { isAutheticated } from "../middlewares/isAuthenticated.js";
import { getMessage, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.route("/send/:id").post(isAutheticated, sendMessage);
router.route("/:id").get(isAutheticated, getMessage);

export default router;