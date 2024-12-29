const express = require('express')
const gameRouter = express.Router()

let gameController = require("../controllers/gameController")

gameRouter.get('/', gameController.displayGameForm)
gameRouter.post('/', gameController.createGame);

module.exports = gameRouter;