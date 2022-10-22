// Import express
let express = require('express');
// Import Body parser
let bodyParser = require('body-parser');
// Import Mongoose
let mongoose = require('mongoose');
let contactController = require("./controller/contactController");
let redisMiddleware = require("./redisMiddleware");
// Initialise the app
let app = express();
const path = require('path');

let dotenv = require('dotenv');
dotenv.config();

var cors = require('cors')

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(cors({
    origin: "*", // restrict calls to those this address
    methods: ["GET", "POST", "PUT", "DELETE"],// only allow GET requests
})) // Use this after the variable declaration

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/otot_b";

// Import routes
let apiRoutes = require("./api-routes");
const { route } = require('./api-routes');
// Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// Connect to Mongoose and set connection variable
if (!MONGO_URI) {
    throw new Error("Missing mongo_uri");
}
try {
    mongoose.connect(MONGO_URI);
} catch (error) {
    throw new Error(`Cannot connect to ${MONGO_URI}`)
}



var db = mongoose.connection;
console.log(MONGO_URI)
// Added check for DB connection
if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")

// Setup server port
var port = process.env.PORT || 8080;

// Send message for default URL
app.get('/', (req, res) => res.send('Hello World with Express'));

// Use Api routes in the App
app.use('/api', apiRoutes);

// app.get("*", function(req, res) {
//     res.sendFile(path.join(__dirname, "./frontend/build/index.html"))
// })

// Launch app to listen to specified port
app.listen(port, function () {
    console.log("Running OTOT_B on port " + port);
});

app.post("/data", contactController.post);
app.get("/redis", redisMiddleware.get);
app.get("/data", contactController.get);

app.get('*', (req, res) => {
    res.status(404)
    .send('ERROR 404 PAGE NOT FOUND!');
});

app.post('*', (req, res) => {
    res.status(404)
    .send('ERROR 404 PAGE NOT FOUND!');
});

