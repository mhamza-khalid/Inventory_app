
const db = require("../db/queries");
const { body, validationResult } = require("express-validator");

async function displayGameForm(req, res){

    let developers = await db.getAllDevelopers();
    let genres = await db.getAllGenres()
    res.render("newGameForm", {developers: developers, 
                               genres: genres,
                               formData: {} })

}

const valdiateGame = [
    body("gameName")
        .notEmpty().withMessage("Please provide name of the game")
        .isLength({max: 255})
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
            const games = await db.getAllGames(); 
            games.forEach((item)=>{
                if(item.game_name == value){
                    console.log(item.game_name)
                    throw new Error(`${value} is already an exisiting Game!`);
                }
            })
                    
        })
    ,
    body("gameDescription")
        .notEmpty().withMessage("Please provide a description of the game")
        .isLength({max: 1000}).withMessage("Game Description can't exceed 1000 characters"),

    body("gamePrice")
        .notEmpty().withMessage("Please provide a game price ($0-$999)")
        .isFloat().withMessage('Game price must be a numeric value')
        .customSanitizer(value => {
            const num = parseFloat(value);
            return num.toFixed(2); // Sanitizes to two decimal place and modifies the orignal game_price variable from req.body
        })
        .custom((value)=>{
            console.log(value)
            if(value < 0 || value >= 1000){
                throw new Error("Game price must be between 0 and 1000")
            }
            return true;
        }),
        
    
    body("gameRating")
        .notEmpty().withMessage("Please provide a game rating (0-5)")
        .isFloat().withMessage('Game rating must be a numeric value')
        .customSanitizer(value => {
            const num = parseFloat(value);
            return num.toFixed(1); // Sanitizes to two one place 
        })
        .custom((value)=>{
            console.log(value)
            if(value < 0 || value > 5){
                throw new Error("Game rating must be between 0 and 5")
            }
            return true;
        }),
        
    
    body("gameImageUrl")
        .notEmpty().withMessage("Please privode a URL of the game image")
        .isURL().withMessage('The input must be a valid URL')
        .custom((value) => {
            // Check if the URL ends with a valid image extension
            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            let url = new URL(value);
            let url1 = url.pathname;
            let url2 = url.hash;

            let pass1 = validExtensions.some(ext => url1.endsWith(ext))
            let pass2 = validExtensions.some(ext => url2.endsWith(ext))

            if (!(pass1 || pass2)) {
                throw new Error('The game image URL must point to an image (e.g., .jpg, .png)');
            }
            return true; // Validation passed
        }),
    body('developers')
        .notEmpty().withMessage('Please choose at least one developer')
    ,
    body('genres')
        .notEmpty().withMessage('Please choose at least one genre')
]

let createGame = [
    valdiateGame,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            async function displayErrors() {
                let developers = await db.getAllDevelopers();
                let genres = await db.getAllGenres()
                return res.status(400).render("newGameForm", {
                    errors      : errors.array(),
                    developers  : developers,
                    genres      : genres,
                    formData    : req.body
                }); 
            }
            displayErrors()   
        }
        else{
            let response = req.body;
            console.log(response);

            //add it to game table
            await db.insertGame(response)

            //then get all the developer_id(s)

            let dev_ids = await db.getDevIds(response);

            console.log('Finished getting dev_ids', dev_ids)


            await db.populateGameDevTable(response, dev_ids);

            let gen_ids = await db.getGenIds(response);

            await db.populateGameGenTable(response, gen_ids);
            
            res.redirect('/');
        }

    }
]

module.exports = {
    displayGameForm,
    createGame
}