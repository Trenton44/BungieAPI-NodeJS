const D2Components = require("./D2components");
const dotenv = require("dotenv");
const path = require("path");
const root = path.join(__dirname,"..\\");
dotenv.config( { path: path.join(root,"process.env") } );

//I'm gonna try to do with error handling what I'm doing with D2components.js,
//ideally so that errors are passed from anywhere in server code to be handled here.
//And then a value is returned that can be logged.
