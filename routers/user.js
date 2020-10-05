const express = require("express");
const UserContoller = require("../controllers/user");
const multipart = require('connect-multiparty');

const md_auth = require('../middleware/authenticated');
const md_upload_avatar = multipart({uploadDir: "./uploads/avatar"});

const api = express.Router();

api.post("/sign-up", UserContoller.signUp);
api.post("/sign-in",UserContoller.signIn);
api.get("/users",[md_auth.ensureAuth], UserContoller.getUsers);
api.get("/users-active",[md_auth.ensureAuth], UserContoller.getUsersActive);
api.put(
    "/upload-avatar/:id",
    [md_auth.ensureAuth,md_upload_avatar],
    UserContoller.uploadAvatar
    );
api.get("/get-avatar/:avatarName", UserContoller.getAvatar);
api.put("/update-user/:id",[md_auth.ensureAuth], UserContoller.updateUser);

module.exports = api;