var express = require('express');
var app = express();
app.use(express.static('public'));
app.listen(3536);
console.log('Listening on port 3536');