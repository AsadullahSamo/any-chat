const User = require("../Models/userModel");
const express = require("express");
const app = express();

app.use(express.json());       // To parse the request body and get the request body
