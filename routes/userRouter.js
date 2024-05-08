const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const { login, register, showData, changeStatus, getUsers, updateUser, deleteUser } = require("../controllers/userController");

router.post("/login", login);
router.post("/register", register);
router.get("/data", protect, showData);
router.get("/", getUsers);
router.put("/owner", protect, changeStatus);
router.put("/", protect, updateUser);
router.delete("/", protect, deleteUser); 

module.exports = router;
