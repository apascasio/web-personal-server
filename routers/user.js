const express = require("express");
const UserContoller = require("../controllers/user");

const api = express.Router();

api.post("/sign-up", UserContoller.signUp);
api.post("/sign-in",UserContoller.signIn);

module.exports = api;