const express = require("express");
const {getCars, createCar, updateCar, deleteCar, getOwnCars, getOneCar } = require("../controllers/carController");
const {protect} = require("../middleware/authMiddleware")
const router = express.Router();

router.get("/", getCars);
router.get("/car/:id", getOneCar);
router.get("/own/", protect, getOwnCars);
router.post("/", protect, createCar);
router.put("/", protect, updateCar);
router.delete("/:id", protect, deleteCar);

module.exports = router;
