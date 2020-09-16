const express = require('express');
const app = express()
//const port = 3000


const { API_VERSION } = require("./config");

//Load routings
const authRoutes = require("./routers/auth");
const userRoutes = require("./routers/user");


app.use(express.json());

app.use(express.urlencoded({extended : true}));



//configure Header HTTP
// ..

// Router basic
app.use(`/api/${API_VERSION}`, authRoutes);
app.use(`/api/${API_VERSION}`, userRoutes);


module.exports = app;