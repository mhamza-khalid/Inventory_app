const pool = require('./pool.js');

async function getAllGenres(){
                        //this returns a promise with the rows wrapped inside the promise
                        //await then unwraps the promsie resolved value of rows and returns it
    const { rows } = await pool.query('SELECT * FROM genres');
    return rows;  //since we are returning from an async function
                  //the returned value rows will be wrapped in resolved value of a promise
                  //hence a promise is returned with rows as its resolved value
}

async function addGenre(value){
    await pool.query('INSERT INTO genres(genre) VALUES ($1)', [value]);
}


async function getAllDevelopers() {
    const { rows } = await pool.query('SELECT * FROM developers');
    return rows;
}

async function getAllGames() {
    const { rows } = await pool.query('SELECT * FROM games');
    return rows;
}

async function insertGame(response) {

    await pool.query('INSERT INTO games(game_name, game_description, game_price, game_rating, game_image_url) VALUES ($1, $2, $3, $4, $5)', [response.gameName, response.gameDescription, response.gamePrice, response.gameRating, response.gameImageUrl]);

}


async function getDevIds(response){
    let developers = response.developers;

    let dev_ids;

    if(Array.isArray(developers)){

        dev_ids = await Promise.all(developers.map(async (dev) => {
            let { rows } = await pool.query('SELECT developer_id FROM developers WHERE developer = ($1)', [dev])
            console.log(rows[0].developer_id);
            return rows[0].developer_id;
            // dev_ids.push(rows[0].developer_id)
        }));
        console.log(dev_ids)
        return dev_ids;
    }
    else{
        let { rows } = await pool.query('SELECT developer_id FROM developers WHERE developer = ($1)', [developers])
        console.log('Single developer id', rows[0].developer_id)
        // dev_ids.push(rows[0].developer_id)
        return [rows[0].developer_id];
    }
    
}

async function getGenIds(response){
    let genres = response.genres;

    let gen_ids;

    if(Array.isArray(genres)){

        gen_ids = await Promise.all(genres.map(async (gen) => {
            let { rows } = await pool.query('SELECT genre_id FROM genres WHERE genre = ($1)', [gen])
            console.log(rows[0].genre_id);
            return rows[0].genre_id;
            // dev_ids.push(rows[0].developer_id)
        }));
        console.log(gen_ids)
        return gen_ids;
    }
    else{
        let { rows } = await pool.query('SELECT genre_id FROM genres WHERE genre = ($1)', [genres])
        console.log('Single genre id', rows[0].genre_id)
        // dev_ids.push(rows[0].developer_id)
        return [rows[0].genre_id];
    }
    
}

async function populateGameDevTable(response, ids){
    console.log('Dev ids' , ids);

    let { rows } = await pool.query('SELECT game_id FROM games WHERE game_name = ($1)', [response.gameName])

    let gameId = rows[0].game_id;

    console.log('Game id', gameId);

    await Promise.all(
        ids.map(async (dev_id) =>{
            await pool.query('INSERT INTO game_developer(game_id, developer_id) VALUES ($1, $2)', [gameId, dev_id]);
        })
    )

} 

async function populateGameGenTable(response, ids){
    console.log('Gen ids' , ids);

    let { rows } = await pool.query('SELECT game_id FROM games WHERE game_name = ($1)', [response.gameName])

    let gameId = rows[0].game_id;

    console.log('Game id', gameId);

    await Promise.all(
        ids.map(async (gen_id) =>{
            await pool.query('INSERT INTO game_genre(game_id, genre_id) VALUES ($1, $2)', [gameId, gen_id]);
        })
    )

} 

async function getGenreGames(genre){
    let {rows} = await pool.query(
        `SELECT games.game_name
         FROM game_genre
         INNER JOIN genres
         ON game_genre.genre_id = genres.genre_id
         INNER JOIN games
         ON game_genre.game_id = games.game_id
         WHERE genres.genre = ($1);`, [genre]
    )
        
    return rows;
}

async function getGameInfo(name){
    let {rows} = await pool.query(
        `SELECT games.game_id, games.game_description, games.game_price, games.game_rating, games.game_image_url
         FROM games
         WHERE game_name = ($1);`, [name]
    )
        
    return rows;
}

async function getDevelopers(game_name){

    let { rows } = await pool.query(
        `SELECT DISTINCT developers.developer
         FROM games
         INNER JOIN game_developer
         ON games.game_id = game_developer.game_id
         INNER JOIN developers
         ON game_developer.developer_id = developers.developer_id
         WHERE games.game_name = ($1);`, [game_name] 
    )
    return rows;
}

async function getGenres(game_name){

    let { rows } = await pool.query(
        `SELECT DISTINCT genres.genre
         FROM game_genre
         INNER JOIN genres
         ON game_genre.genre_id = genres.genre_id
         INNER JOIN games
         ON game_genre.game_id = games.game_id
         WHERE games.game_name = ($1);`, [game_name] 
    )
    return rows;
}

async function deleteGame_Games(gameId){

    await pool.query(`DELETE FROM game_genre WHERE game_id = ($1)`, [gameId]);
    await pool.query(`DELETE FROM game_developer WHERE game_id = ($1)`, [gameId]);
    await pool.query(`DELETE FROM games WHERE game_id = ($1)`, [gameId]);
    

}

async function deleteGenre(genre_id){
    await pool.query('DELETE FROM game_genre WHERE genre_id = ($1)', [genre_id])
    await pool.query('DELETE FROM genres WHERE genre_id = ($1)', [genre_id])
}



module.exports = {
    getAllGenres,
    addGenre,
    getAllDevelopers,
    getAllGames,
    insertGame,
    getDevIds,
    populateGameDevTable,
    getGenIds,
    populateGameGenTable,
    getGenreGames,
    getGameInfo,
    getDevelopers,
    getGenres,
    deleteGame_Games,
    deleteGenre
}