const jwt  = require('jwt-simple');
const mometn = require('moment');

const SECRE_KEY ="Ap77afc40sta";


exports.ensureAuth = (req,res, next) => {
    if(!req.headers.authorization){
        return res.status(403).send({message: "La peticion no tiene cabecera de autenticacio"});
    }

    const token = req.headers.authorization.replace(/['"]+/g,"");
    try {
        var payload = jwt.decode(token, SECRE_KEY);
        if(payload.ex <= mometn.unix()){
            return res.status(404).send({message: "El token ha expirado"});
        }
    } catch (ex) {
        console.log(ex);
        return res.status(404).send({message: "Token invalido"});
    }

    req.user = payload;
    next();
}