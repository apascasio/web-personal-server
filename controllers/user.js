const fs = require('fs');
const path = require('path');
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("../services/jwt");

function signUp(req, res){
    const saltRounds = 10;
    const user = new User();
    const {name, lastname, email, password, repeatPassword} = req.body;
    user.name = name;
    user.lastname = lastname;
    user.email = email.toLowerCase();
    user.role = "admin";
    user.active = "false";


    if(!password || !repeatPassword){
        res.status(404).send({message: "Las contraseñas son obligatorias."});      
    } else {
        if(password !== repeatPassword){
            res.status(404).send({message: "Las contraseñas deben ser iguales."});
        } else {
            bcrypt.hash(password, saltRounds, function(err, hash) {
                // Store hash in your password DB.
                if (err){
                    res.status(500).send({message: "Error al encriptar la contraseña"});
                } else {
                    user.password = hash;

                    user.save((err, userStored) => {
                        if(err){
                            res.status(500).send({message: "El usuario ya existe"});
                        } else {
                            if(!userStored){
                                res.status(404).send({message: "Error al crear el usuario"});
                            } else {
                                res.status(200).send({user: userStored});
                            }
                        }
                    });
                }
            });

        }
    }
}


function signIn(req, res) {
    const params = req.body;
    const email = params.email.toLowerCase();
    const password = params.password;

    User.findOne({email}, (err, userStored) => {
        if(err){
            res.status(500).send({message: "Error del servidor"});
        } else {
            if(!userStored){
                res.status(404).send({message: "Usuario no encontrado"});
            } else {
                bcrypt.compare(password, userStored.password,(err, check) => {
                    if(err){
                        res.status(500).send({message: "Error del servidor"})
                    } else if(!check) {
                        res.status(404).send({message: "La contraseña no es valida"});

                    }else {
                        if(!userStored.active){
                            res.status(200).send({code:200, message: "El usuario no esta activo"});
                        } else {
                            res.status(200).send({
                                accessToken: jwt.createAccessToken(userStored),
                                refreshToken: jwt.createRefreshToken(userStored)
                            });
                        }
                    }
                });
            }
        }
    });
}

function getUsers(req, res) {
    User.find().then( users => {
        if(!users){
            res.status(404).send({message: "No se ha encontrado ningun usuario"});
        } else {
            res.status(200).send({ users });
        }
    })
}

function getUsersActive(req, res) {
    const query = req.query;

    User.find({active: query.active}).then( users => {
        if(!users){
            res.status(404).send({message: "No se ha encontrado ningun usuario"});
        } else {
            res.status(200).send({ users });
        }
    })
}

function uploadAvatar(req, res){
    const params = req.params;
    
    User.findById({_id: params.id}, (err, userData) =>{
        if(err){
            res.status(500).send({message: "Error del servidor"});
        }else {
            if(!userData){
                res.status(404).send({message: "Nose ha encontrado ningun usuario"});
            } else {
                let user = userData;
                if(req.files){
                    let filePath = req.files.avatar.path;
                    let fileSplit = filePath.split("/");
                    let fileName = fileSplit[2];

                    let extSplit = fileName.split(".");
                    let fileExt = extSplit[1];

                    if(fileExt !== "png" && fileExt !=="jpg"){
                        res.status(400)
                        .send({message: "La extension de la imagen no es valida. Extensiones permitidas .png y .jpg"});
                    } else {
                        user.avatar = fileName;
                        User.findOneAndUpdate({_id: params.id}, user, (err, userResult) => {
                            if(err){
                                res.status(500).send({message: "Error del servidor"});
                            } else {
                                if(!userResult){
                                    res.status(404).send({message: "No se ha encontrado ningun usuario"});
                                }else {
                                    res.status(200).send({avatarName: fileName });
                                }
                            }
                        });
                    }
                }
                
            }
        }
    });
}

function getAvatar(req, res){
    const avatarName = req.params.avatarName;
    const filePath = "./uploads/avatar/" + avatarName;

    fs.exists(filePath, exists => {
        if (!exists) {
            res.status(404).send({ message: "El avatar que buscas no existe." });
        } else {
            res.sendFile(path.resolve(filePath));
        }
    });

}

async function updateUser(req, res ){
    let userData = req.body;
    userData.email = req.body.email.toLowerCase();
    const params = req.params;
    const saltRounds = 10;

    if (userData.password) {
        await bcrypt.hash(userData.password, saltRounds, function(err, hash)  {
            if (err) {
                res.status(500).send({ message: "Error al encriptar la contraseña." });
            } else {
                userData.password = hash;
                console.log("1");
            }
        });
    }

    User.findOneAndUpdate({_id: params.id}, userData, (err, userUpdate) => {
        console.log("2");
        console.log('el valor de userData.password es: '+userData.password);
        
        if(err){
            res.status(500).send({message: "Error del servidor"});
        } else {
            if(!userUpdate){
                res.status(404).send({ message: "No se ha encontrado el usuario"});
            } else {
                res.status(200).send({message: "Usuario actualizado correctamente"});
            }
        }
    });

}

module.exports ={
    signUp,
    signIn,
    getUsers,
    getUsersActive,
    uploadAvatar,
    getAvatar,
    updateUser
};
