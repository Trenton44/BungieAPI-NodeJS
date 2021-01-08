const dotenv = require("dotenv");
const path = require("path");
const root = path.join(__dirname,"..\\");
dotenv.config( { path: path.join(root,"process.env") } );
const axios = require('axios');
const https = require("https");
const fs = require('fs');
const d2api = require("./D2APIfunctions");

const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
