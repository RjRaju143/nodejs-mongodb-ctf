
const express = require('express');
const session = require('express-session');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const app = express();

const path = require('path')
const fileUpload = require('express-fileupload');
const serveIndex = require('serve-index');
const fs = require('fs')

const pug = require("pug")



mongoose.connect("mongodb://172.17.0.1:27017/LoginUsers",{
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(() => {
   console.log("Successfully connect to MongoDB.");
}).catch(err => {
      console.log("MongoDB Connection error");
      process.exit();
});


const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});


/*
var statusOfUsers = {
	userName : req.user['username'],
	status : "login success"
}
*/


const User = mongoose.model('User', UserSchema);

// Middleware
app.engine('hbs', hbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');



app.use(express.static(__dirname + '/public'));
app.use(session({
	secret: "@#$%^&*jycRSFCDTFVYBU67564",
	resave: false,
	saveUninitialized: true
}));
app.use(express.urlencoded({
	extended: false
}));
app.use(express.json());

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
	done(null, user.id, user.username);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});


passport.use(new localStrategy(function (username, password, done) {
	User.findOne({
		username: username
	},function (err, user) {
		if (err) return done(err);
		if (!user) return done(null, false, {
			message: 'Incorrect username.'
		});

		bcrypt.compare(password, user.password, function (err, res) {
			if (err) return done(err);
			if (res === false) return done(null, false, {
				message: 'Incorrect password.'
			});
			
			return done(null, user);
		});
	});
}));

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/login');
	console.log(req.method,res.statusCode,req.url); // added for log
}

function isLoggedOut(req, res, next) {
	if (!req.isAuthenticated()) return next();
	res.redirect('/');
}

// ROUTES
app.get('/', isLoggedIn, (req, res) => {
	res.render("index",{
		title: "Home",
		name : req.user['username']
	});

	var statusOfUsers = {
		userName : req.user['username'],
		status : "login success"
	}

	//console.log(req.method,res.statusCode,req.url,"user :", req.user['username'], "logedin"); // added for log
	console.log(req.method,res.statusCode,req.url, statusOfUsers); // added for log
});



app.get('/about', isLoggedIn, (req, res) => {
	res.render("index",{
		title:"About",
		name : req.user['username']
	});

	var statusOfUsers = {
		userName : req.user['username'],
		status : "login success"
	}

	//console.log(req.method,res.statusCode,req.url,"user :", req.user['username'], "logedin"); // added for log
	console.log(req.method,res.statusCode,req.url, statusOfUsers); // added for log

});








// app.get("/bug", function (req, res) {
//   res.render("bug")
// })

// app.post("/render", function (req, res) {
//   template = req.body.template || "h1 No template provided"

//   value = pug.render(template)
//   res.render("render", { value: value })
// })













app.get('/index', isLoggedIn, (req, res) => {
	res.render("index",{
		title:"Home",
		name : req.user['username']
	});

	var statusOfUsers = {
		userName : req.user['username'],
		status : "login success"
	}
	console.log(req.method,res.statusCode,req.url, statusOfUsers); // added for log

	//console.log(req.method,res.statusCode,req.url,"user :", req.user['username'], "logedin"); // added for log
});


app.get('/login', isLoggedOut, (req, res) => {
	const response = {
		title: "Login",
		error: req.query.error
	}

	res.render('login', response);
	console.log(req.method,res.statusCode,req.url); // added for log

});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login?error=true'
}));

app.get("/logout", (req, res) => {
  req.logout(req.user, err => {
    if(err) return next(err);
    res.redirect("/");
  });
});





// need to config ....
app.get('/register', (req, res) => {
	res.render('register.hbs')
	console.log(req.method,res.statusCode,req.url); // added for log
  })






// Setup our admin user
app.get('/setup', async (req, res) => {
	const exists = await User.exists({
		username: "raju"
	});
	if (exists) {
		res.redirect('/login');
		return;
	};
	bcrypt.genSalt(10, function (err, salt) {
		if (err) return next(err);
		bcrypt.hash("password", salt, function (err, hash) {
			if (err) return next(err);
			
			const newAdmin = new User({
				username: "raju",
				password: hash
			});
			newAdmin.save();
			res.redirect('/login');
		});
	});
});


// Setup our admin user
app.get('/setup2', async (req, res) => {
	const exists = await User.exists({
		username: "admin"
	});
	if (exists) {
		res.redirect('/login');
		return;
	};
	bcrypt.genSalt(10, function (err, salt) {
		if (err) return next(err);
		bcrypt.hash("admin", salt, function (err, hash) {
			if (err) return next(err);
			
			const newAdmin = new User({
				username: "admin",
				password: hash
			});
			newAdmin.save();
			res.redirect('/login');
		});
	});
});



//robots
app.get('/robots.txt',(req,res)=>{
	res.sendFile(path.join(__dirname, 'robots.txt'));
  });


// 404 Page Not Found
app.use(function(req,res){
	res.status(404).render('404.ejs');
	console.log(req.method,res.statusCode,req.url); // added for log
});


// Server Listening ..
const port = 1430
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});




