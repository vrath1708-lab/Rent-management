import express from "express";
import { createNotice, listNotices, getNotice, deleteNotice } from "../controllers/noticeController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(protect, listNotices)
  .post(protect, admin, createNotice);

router.route("/:id")
  .get(protect, getNotice)
  .delete(protect, admin, deleteNotice);

export default router;
