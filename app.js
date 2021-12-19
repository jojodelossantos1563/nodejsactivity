const express = require('express');
const req = require('path');
const port = process.env.port || 3000;
const dotenv = require('dotenv');



dotenv.config({ path: './.env' })

const app = express();
// this where the error starts
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/auth', require('./routes/auth'));
app.use('/', require('./routes/registerRoutes'))



app.listen(port, function (req, res) {
    console.log(`Server run at ${port}`)
});