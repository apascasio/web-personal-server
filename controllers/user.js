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

module.exports ={
    signUp,
    signIn
};
