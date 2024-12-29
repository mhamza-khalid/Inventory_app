const db = require("../db/queries");
const { body, validationResult } = require("express-validator");

async function getGenres(req, res){
    const genres = await db.getAllGenres();
    //console.log('GENRESSSSSSSSSS', genres);
    res.render("index", {genresList: genres })
}

function addNewGenreForm(req, res){
    res.render("newGenreForm")
}

const validateGenre = [
    body("new_genre")
        .notEmpty().withMessage('Genre can\'t be empty')
        .customSanitizer((value) => {
            // Custom sanitization: Remove special characters, reduce spaces, capitalize words
            // and updates new_genre in req.body as per rules below
            return value
                .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
                .replace(/\s+/g, " ")          // Reduce multiple spaces to one
                .trim()                        // Trim leading and trailing spaces
                .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word
        })
        .custom(async (value) => {//custom validator checks if genre already exists in table
            //console.log(value)
            const genres = await db.getAllGenres(); 
            genres.forEach((item)=>{
                if(item.genre == value){
                    console.log(item.genre)
                    throw new Error(`${value} is already an exisiting Genre!`);
                }
            })
            
        })
]


//express will iterate over these middleware functions and run them in order in the array
//like you can put middleware functions in an array 
let createNewGenre = [
    validateGenre,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("newGenreForm", {
                errors: errors.array(),
            });
        }

        //receive sanitized value after validation
        let { new_genre } = req.body;
        //console.log(new_genre);

        //now lets add this new_genre to the genre table in db and redirect to index page
        await db.addGenre(new_genre);
        res.redirect("/");
    }
]

async function displayGenreGames(req, res){
    const genre = req.params.genre;

    //Now we have to do 2 left joins and select the rows with the genre

    //games of the selected genre
    let games = await db.getGenreGames(genre);

    //Now query the database for each game to get all its data

    let allGames = await Promise.all(games.map(async (item)=>{
        let game_name = item.game_name;

        let gameObj = {}

        let get_Data = await db.getGameInfo(game_name)

        console.log(get_Data)

        gameObj.gameId = get_Data[0].game_id
        gameObj.gameName = game_name
        gameObj.gameDescription = get_Data[0].game_description
        gameObj.gamePrice = get_Data[0].game_price
        gameObj.game_rating = get_Data[0].game_rating
        gameObj.gameImageUrl = get_Data[0].game_image_url

        //now get the developers of the game

        let developers = await db.getDevelopers(game_name)
        console.log('Developers', developers)

        gameObj.developers = developers;

        //now get the geres of the game

        let genres = await db.getGenres(game_name)
        console.log('Genres', genres)

        gameObj.genres = genres;

        return gameObj;
    }))

    console.log(allGames)
    res.render("gamesDisplay", {games: allGames, genre: genre});
    // , {games: allGames, genre: genre}
}

async function deleteGame(req, res){
    
    //Now get the game id from url

    let gameId = req.params.gameID;
    let genre = req.params.genre;

    //delete the corresponding row from games table
    
    await db.deleteGame_Games(gameId);

    let games = await db.getGenreGames(genre);

    //Now query the database for each game to get all its data

    let allGames = await Promise.all(games.map(async (item)=>{
        let game_name = item.game_name;

        let gameObj = {}

        let get_Data = await db.getGameInfo(game_name)

        console.log(get_Data)

        gameObj.gameId = get_Data[0].game_id
        gameObj.gameName = game_name
        gameObj.gameDescription = get_Data[0].game_description
        gameObj.gamePrice = get_Data[0].game_price
        gameObj.game_rating = get_Data[0].game_rating
        gameObj.gameImageUrl = get_Data[0].game_image_url

        //now get the developers of the game

        let developers = await db.getDevelopers(game_name)
        console.log('Developers', developers)

        gameObj.developers = developers;

        //now get the geres of the game

        let genres = await db.getGenres(game_name)
        console.log('Genres', genres)

        gameObj.genres = genres;

        return gameObj;
    }))

    res.render("gamesDisplay", {games: allGames, genre: genre});
}


async function deleteGenre(req, res){
    let genre_id = req.params.genreID

    await db.deleteGenre(genre_id);

    // const genres = await db.getAllGenres();

    // res.render("index", {genresList: genres })

    res.redirect("/");
}


module.exports = {
    getGenres,
    addNewGenreForm,
    createNewGenre,
    displayGenreGames,
    deleteGame,
    deleteGenre
}

