let express = require('express');
let app = express();
const path = require("node:path");
let port = 4000;

app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

let indexRouter = require("./routes/indexRouter");
let gameRouter = require("./routes/gamesRouter");

app.use('/', indexRouter);
app.use('/new_game', gameRouter);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})