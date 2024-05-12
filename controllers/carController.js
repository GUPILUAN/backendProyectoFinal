const asyncHandler = require("express-async-handler");
const Car = require("../models/carModel");

const getCars = asyncHandler(async (req, res) => {
  let cars;
  if (req.user) {
    cars = await Car.find({ owner: { $ne: req.user._id } });
  } else {
    cars = await Car.find();
  }
  res.status(200).json(cars.length > 0 ? cars : { message: "No hay carros" });
});

const createCar = asyncHandler(async (req, res) => {
  const {
    model,
    brand,
    year,
    serialNum,
    transmission,
    capacity,
    pricePerDay,
    location,
    insurance,
    image,
  } = req.body;
  if (
    !req.user.isOwner ||
    !model ||
    !brand ||
    !year ||
    !serialNum ||
    !transmission ||
    !capacity ||
    !pricePerDay ||
    !location ||
    !insurance ||
    !image
  ) {
    res.status(400);
    throw new Error("No fue posible crear el automovil");
  }
  const car = await Car.create({
    owner: req.user._id,
    model,
    brand,
    year,
    serialNum,
    transmission,
    capacity,
    pricePerDay,
    location,
    insurance,
    image,
  });
  res.status(201).json(car);
});

const updateCar = asyncHandler(async (req, res) => {
  const result = await Car.updateOne(
    { _id: req.body.id, owner: req.user._id },
    req.body
  );
  if (result.modifiedCount > 0) {
    res.status(202).json({
      message: "El carro fue actualizado exitosamente",
    });
  } else {
    res.status(400);
    throw new Error("No se encontro el carro para actualizar");
  }
});

const getOwnCars = asyncHandler(async (req, res) => {
  const cars = await Car.find({ owner: req.user._id });
  res.status(200).json(cars.length > 0 ? cars : { message: "No hay carros" });
});

const getOneCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);
  res.status(200).json(car);
});

const deleteCar = asyncHandler(async (req, res) => {
  const result = await Car.deleteOne({ _id: req.params.id });
  if (result.deletedCount > 0) {
    res.status(203).json({
      message: "El carro fue eliminado exitosamente",
    });
  } else {
    res.status(400);
    throw new Error("No se encontro el carro para eliminar");
  }
});

module.exports = {
  getCars,
  createCar,
  updateCar,
  deleteCar,
  getOwnCars,
  getOneCar,
};
