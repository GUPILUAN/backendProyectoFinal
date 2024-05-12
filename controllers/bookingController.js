const asyncHandler = require("express-async-handler");
const Booking = require("../models/bookingModel");
const Car = require("../models/carModel");

const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ booker: req.user._id });
  res
    .status(200)
    .json(bookings.length > 0 ? bookings : { message: "No hay reservaciones" });
});

const createBooking = asyncHandler(async (req, res) => {
  const { carBooked, startingDate, endingDate } = req.body;
  if (!carBooked || !startingDate || !endingDate) {
    res.status(400);
    throw new Error("No fue posible crear la reservación");
  }
  const car = await Car.findById({ _id: carBooked });
  const check = await Booking.find({ carBooked });

  if (car.owner.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("No puedes reservar tu propio auto");
  }

  if (!checkDate(startingDate, endingDate)) {
    res.status(400);
    throw new Error(
      "Las fechas seleccionadas no son válidas, deben ser mayor a la fecha actual"
    );
  }

  if (
    check.length > 0 &&
    !checkDisponibility(check, startingDate, endingDate)
  ) {
    res.status(400);
    throw new Error(
      "El auto ya se encuentra reservado en las fechas seleccionadas"
    );
  }

  const booking = await Booking.create({
    booker: req.user._id,
    carBooked,
    startingDate,
    endingDate,
    totalPrice: car.pricePerDay * daysBetween(startingDate, endingDate),
  });
  res.status(201).json(booking);
});

const updateBooking = asyncHandler(async (req, res) => {
  const result = await Booking.updateOne(
    { _id: req.body.id, booker: req.user._id },
    req.body
  );
  if (result.modifiedCount > 0) {
    res.status(202).json({
      message: "La resevación fue actualizada exitosamente",
    });
  } else {
    res.status(400);
    throw new Error("No se encontro reservación para actualizar");
  }
});

const deleteBooking = asyncHandler(async (req, res) => {
  const result = await Booking.deleteOne({
    _id: req.body.id,
    booker: req.user._id,
  });
  if (result.deletedCount > 0) {
    res.status(203).json({
      message: "La reservación fue eliminada exitosamente",
    });
  } else {
    res.status(400);
    throw new Error("No se encontro reservación para eliminar");
  }
});

const checkDisponibility = (reservas, start, end) => {
  const starting = new Date(start);
  const ending = new Date(end);
  for (let reserva of reservas) {
    if (
      starting < new Date(reserva.endingDate) &&
      ending > new Date(reserva.startingDate)
    ) {
      return false;
    }
  }
  return true;
};

const checkDate = (start, end) => {
  const starting = new Date(start);
  const ending = new Date(end);
  const today = new Date();
  if (starting < today || ending < today) {
    return false;
  }
  return true;
};

const daysBetween = (start, end) => {
  const startingDate = new Date(start);
  const endingDate = new Date(end);
  const difference = endingDate.getTime() - startingDate.getTime();
  const days = Math.ceil(difference / (1000 * 60 * 60 * 24));
  return days;
};

module.exports = {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
};
