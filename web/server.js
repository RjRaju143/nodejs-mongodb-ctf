
const express = require('express');
const session = require('express-session');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const app = express();

mongoose.connect("mongodb://172.17.0.1:27017/LoginUsers", {
	useNewUrlParser: true,
	useUnifiedTopology: true
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

const User = mongoose.model('User', UserSchema);

// Middleware
app.engine('hbs', hbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(session({
	//secret: "verygoodsecret",
	secret: "@#$%^&*jycRSFCDTFVYBU67564",
	resave: false,
	saveUninitialized: true
}));
app.use(express.urlencoded({ extended: false }));
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
	User.findOne({ username: username }, function (err, user) {
		if (err) return done(err);
		if (!user) return done(null, false, { message: 'Incorrect username.' });

		bcrypt.compare(password, user.password, function (err, res) {
			if (err) return done(err);
			if (res === false) return done(null, false, { message: 'Incorrect password.' });
			
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
	res.render("index",{title:"Home",
	name : req.user['username']});
	console.log(req.method,res.statusCode,req.url); // added for log
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




// // Setup our admin user
// app.get('/setup', async (req, res) => {
// 	const exists = await User.exists({ username: "raju" });
// 	if (exists) {
// 		res.redirect('/login');
// 		return;
// 	};
// 	bcrypt.genSalt(10, function (err, salt) {
// 		if (err) return next(err);
// 		bcrypt.hash("password", salt, function (err, hash) {
// 			if (err) return next(err);
			
// 			const newAdmin = new User({
// 				username: "raju",
// 				password: hash
// 			});
// 			newAdmin.save();
// 			res.redirect('/login');
// 		});
// 	});
// });




// 404 Page Not Found
app.use(function(req,res){
	res.status(404).render('404.ejs');
	console.log(req.method,res.statusCode,req.url); // added for log
});


// Server Listening ..
const port = 4444
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});




