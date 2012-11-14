var express = require('express');
var app = express();
app.use(express.static('public'));
app.listen(1337);
console.log('Listening on port 1337');