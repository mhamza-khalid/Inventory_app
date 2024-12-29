const express = require('express')
const indexRouter = express.Router()

let genreController = require("../controllers/genreController")

indexRouter.get('/', genreController.getGenres);

indexRouter.get('/delete_game/:gameID/:genre', genreController.deleteGame)

indexRouter.get('/delete_genre/:genreID/', genreController.deleteGenre)

indexRouter.get('/genre/:genre', genreController.displayGenreGames);

indexRouter.get('/new_genre', genreController.addNewGenreForm)

indexRouter.post('/create_genre', genreController.createNewGenre)

module.exports = indexRouter;

