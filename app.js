const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser');
const connection = require('./database/dbconnection');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const ObjectsToCsv = require('objects-to-csv');
const flash = require('req-flash');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

//config
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(cookieParser());
app.use(session({
    secret: 'keyboardcat',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());





//login page
app.get('/', function(req, res) {
    if (!req.session.user) {
        res.render('login');
    } else {

        res.redirect('/code');
    }

})

//login logic
app.post('/', async function(req, res) {
    let { email, password } = req.body;

    try {
        let user = await connection.statement('SELECT * FROM login WHERE email = ?', [email]);
        if (!user[0]) {

            res.redirect('/');

        } else {
            let isValid = bcrypt.compareSync(password, user[0].password);

            if (isValid) {
                await connection.statement('UPDATE login SET lastlogin = CURRENT_TIMESTAMP WHERE id = ?', [user[0].id]); //upadte last login time

                req.session.user = user[0]; //storing the current session

                res.redirect('/code');

            } else {
                res.redirect('/');
            }
        }



    } catch (err) {
        console.log(err);
    }

})

// code page 
app.get('/code', async function(req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {

        //initilize the incremental code as cookie
        if (!req.cookies['inc_code']) {
            res.cookie('inc_code', 123);
        }

        let data = await connection.statement('SELECT * FROM code');
        res.render('code', { data: data, currUser: req.session.user, inCode: req.cookies['inc_code'] });
    }

})

//storing generated code to database
app.post('/code', async function(req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {

        let { state, atype, ref, dtype } = req.body;
        if (!state) {
            console.log('Enter state');
        } else if (!atype) {
            console.log('Enter atype');
        } else if (!dtype) {
            console.log('Enter dtype');
        } else if (!ref) {
            console.log('Enter dtype');
        }
        if (state && atype && dtype && ref) {
            let code = state.slice(0, 2).toUpperCase() + atype + dtype + req.cookies['inc_code'];

            try {
                await connection.statement('INSERT INTO code (_state,a_type,d_type,code,ref_no,userid) VALUES (?, ?,?,?,?,?)', [state, atype, dtype, code, ref, req.session.user.id]);
                let x = parseInt(req.cookies['inc_code']) + 1; //increasing the incremental code
                res.cookie('inc_code', x);
            } catch (err) {
                console.log(err);
            }

        }


        res.redirect('/code');

    }


})

// destroying current session
app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
})

// deleting the code
app.get('/delete/:id', async function(req, res) {
    if (req.session.user) {

        try {

            await connection.statement('DELETE FROM code WHERE _id = ?', [req.params.id]);

        } catch (err) {

            console.log(err);
        }


    }
    res.redirect('/code');

})

app.get('/csv', async function(req, res) {

    if (req.session.user) {
        try {
            let data = await connection.statement('SELECT * FROM code');
            const csv = new ObjectsToCsv(data);

            // Save to file:
            await csv.toDisk('./test.csv');
            res.download('./test.csv');


        } catch (err) {
            console.log(err);
        }
    }


})

app.listen(port, function(req, res) {
    console.log('App running on port 3000');
})