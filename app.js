const flash = require('express-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
// const expressValidator = require('express-validator')

const express = require('express');
// connection mysql
var mysql = require('mysql');
const { name } = require('ejs');
 var connection=mysql.createConnection({
   host:'localhost',
   user:'root',
   password:'',
   database:'myapp'
 });
connection.connect((error) => {
   if(error){
     console.log(error);
   }else{
     console.log('Connected!:)');
   }
});


const app = express();
const PORT = 5000;
// vieww engine setup
app.set('view engine', 'ejs');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(session({
    secret: '123456cat',
    resave: false,
    saveUninitialized: true,
}))

app.use(flash());

// routes

// home page
app.get('/',(req,res)=> {
    res.render('pages/index')
});

// sign up page
// get
app.get('/signup', (req,res) => {
    res.render('pages/signup')
});
// post 
const { check, validationResult, matchedData } = require('express-validator');
app.post('/signup', [
    check('name')
        .isLength({ min: 1 })
        .withMessage('Message is required')
        .trim(),
    check('email')
        .isEmail()
        .withMessage('That email doesnt look right')
        .bail()
        .trim()
        .normalizeEmail(),
    check('password')
        .isLength({ min: 1 })
        .withMessage('Message is required')
        .trim()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('/signup', {
        data: req.body,
        errors: errors.mapped()
      });
    }
    const data = matchedData(req);
    const sql= 'INSERT INTO users SET ?';
    connection.query(sql, data,(err, data) => {
        if (err){
            console.log(err.message);
            res.send(err);
        } else{
            console.log('item added successfully ):')
            console.log('Sanitized: ', data);
        }
    req.flash('success', 'account created :)');
    res.redirect('/signin');
    });
  });

// sign in page
app.get('/signin', (req,res) => {
    res.render('pages/signin')
});
app.post('/signin', (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    connection.query('SELECT * FROM users WHERE email = ? AND password = ?',[email, password], (err, rows, fields) => {
        if(err){
            console.log(err);
        }
        if (rows.length <=0){
            console.log('wrong email  and password')
            req.flash('error', 'please enter correct email and password')
            res.redirect('/signin')
        } else{
            req.session.loggedin = true;
            req.session.email = email;
            res.redirect('/dashboard')
        }
    })
})

// about page
app.get('/about', (req,res) => {
    res.render('pages/about')
});
// about page
app.get('/contact', (req,res) => {
    res.render('pages/contact')
});
app.get('/dashboard', (req,res) =>{
    res.render('pages/dashboard')
})

app.listen(PORT, ()=>{ console.log(`server listning on port ${PORT}`)});