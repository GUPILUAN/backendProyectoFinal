const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");


const getUsers = asyncHandler(async (req,res) => {
  const users = await User.find();
  res.status(200).json(users)
})

const register = asyncHandler(async (req, res) => {
  const { name, email, password, address, phone, isOwner, image } = req.body;

  if (!name || !email || !password || !address || !phone) {
    res.status(400);
    throw new Error("Por favor, ingrese todos los datos");
  }
  const userExist = await User.findOne({ email });
  
  if (userExist) {
    res.status(400);
    throw new Error("El email ya se encuentra registrado");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    address,
    phone,
    isOwner,
    image,
  });
  res.status(201).json({
    message: "Usuario Creado",
    user,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const {_id, name, email, password, address, phone, isOwner, image } = req.body;

  if (!name || !email || !address || !phone) {
    res.status(400);
    throw new Error("Por favor, ingrese todos los datos");
  }
  const userExist = await User.findOne({ email });
  if (userExist && userExist._id != _id) {
    res.status(400);
    throw new Error("El email ya se encuentra registrado");
  }
  let hashedPassword;
  if(password){
    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(password, salt);
  }
  const user = await User.updateOne({_id},{
    name,
    email,
    password : password ?  hashedPassword: userExist.password,
    address,
    phone,
    isOwner,
    image,
  });
  res.status(201).json({
    message: "Usuario Actualizado",
    user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      message: "Login Correcto",
      id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400)
    throw new Error("Contraseña o email invalidos");
  }
});

const generateToken = (idUser) => {
  return jwt.sign({ idUser }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const showData = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

const deleteUser = asyncHandler(async(req,res) => {
  const result = await User.deleteOne({_id: req.user._id})
  if(result.deletedCount > 0){
    res.status(202).json({
      message: "El usuario fue eliminado exitosamente"
      })
  }
})

const changeStatus = asyncHandler(async (req, res) => {
  const result = await User.updateOne(
    { _id: req.user._id },
    { isOwner: !req.user.isOwner }
  );
  if (result.modifiedCount > 0) {
    res.status(202).json({
      message: "El usuario fue actualizado exitosamente",
    });
  } else {
    res.status(400);
    throw new Error("No se encontro el usuario para actualizar");
  }
});


module.exports = {
  getUsers,
  register,
  login,
  showData,
  changeStatus,
  updateUser,
  deleteUser,
};
