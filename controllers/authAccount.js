const { request } = require('express');
const mysql2 = require('mysql2');
const bcrypt = require('bcrypt');
const async = require('hbs/lib/async');
const res = require('express/lib/response');

const db = mysql2.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});


//Add Account
//This is for the form input
exports.register = (req, res) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const age = req.body.age;
    const address = req.body.address;
    const contactnumber = req.body.contact_number;
    const email = req.body.email;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;

    //let {firstname, lastname, email, password, confirm_password} = req.body; 

    //Validating if there is existing records
    //ADDING RECORDS
    //async and await use in encrypting the password.
    db.query(
        'SELECT email from registration WHERE email = ?', [email],//email here served as unique identifier
        async (err, result) => {
            if (err) {
                console.log(err)
            }
            if (result.length > 0) {
                return res.render('registration', { message: 'E-mail entered is already in use' });
            }
            else if (password != confirm_password) {
                return res.render('registration', { message: 'Password and Confirmed Password did not match' })
            }
            //encrypted the password,then pass the variable name on password element in db.query line 59.
            const hashpassword = await bcrypt.hash(password, 8);


            //SQL statement to insert data in database
            db.query('INSERT INTO registration SET ?', {
                first_name: firstname, last_name: lastname,
                age: age, address: address, contact_number: contactnumber, email: email, password: hashpassword
            },
                (err, result) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        return res.render('registration', { message: 'User Registered' });
                    }
                })
        })

};
//export function for login.hbs file
//Add input in login.hbs file

//This is the variable part of email and password
exports.login = async (request, response) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return response.status(400).render('index', { message: 'Please provide email and password' });
        }
        //This is for the database
        db.query('SELECT * FROM registration WHERE email = ?',
            [email],
            async (err, result) => {
                console.log(result);
                if (!result || !(await bcrypt.compare(password, result[0].password))) {
                    return response.status(401).render('index', { message: 'Email or Password incorrect' });
                }
                else {
                    db.query(
                        'Select * from registration', (err, result) => {
                            response.render('list', { user: result, title: 'List of Users' });
                        }
                    )
                }
            }
        )
    }
    catch (error) {
        console.log(error);
    }
}
//Updating forms section
exports.update_form = (request, response) => {
    const email = request.params.email;
    db.query('SELECT * FROM registration WHERE email = ?', [email],
        (err, results) => {
            response.render('updateform', { title: 'Edit User', user: results[0] });
        }
    )
}
exports.update_user = (request, response) => {

    const { firstname, lastname, email } = request.body;

    db.query(`UPDATE registration SET first_name = '${firstname}', last_name = '${lastname}' WHERE email = '${email}';`,
        (error) => {
            if (error) return console.log(error.message);
            db.query('SELECT * FROM  registration;', (err, result) => {
                response.render('List', {
                    user: result,
                    title: 'List of Users',
                    alertMsg: `User alert: ${email}, has been updated.`
                });
            });
        }
    )
}
//Delete Section
exports.delete_user = (request, response) => {
    const { email } = request.params;

    db.query('DELETE from registration WHERE email =?;',
        [email], (error, results) => {

            if (error) return console.log('ERROR' + err);
            db.query('SELECT * FROM registration;', (err, result) => {
                response.render('List', {
                    user: result, title: 'List of User',
                    message: `User with email:' + ${email} + 'has been updated`
                })
                console.log('Updating')
            })
        }
    )
}