const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const port = process.env.PORT || 3000;

const app = express();

// this will give express the access to dist folder
app.use(express.static(path.join(__dirname, 'dist')));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

// to use the route api defined above when /api is mentioned.
//app.use('/api', api);
var router = express.Router();

app.use('/', router);

// to handle any matching path other than api 
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
});
  
app.listen(port, function () {
    console.log("Server running on localhost on port: " + port);
});
