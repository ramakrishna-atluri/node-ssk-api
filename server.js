const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('./app/helpers/jwt');
const errorHandler = require('./app/helpers/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use('/users', require('./app/controllers/users.controller'));
app.use('/counter', require('./app/controllers/counter.controller'));
app.use('/profile', require('./app/controllers/userProfile.controller'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});