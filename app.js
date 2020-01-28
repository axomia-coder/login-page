const express = require('express'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	LocalStrategy = require('passport-local'),
	passportLocalMongoose = require('passport-local-mongoose'),
	User = require('./models/user');

const url = 'mongodb+srv://adervon:SKi4bg7fgXGPuy5i@cluster0-9gc4s.mongodb.net/auth?retryWrites=true&w=majority';
mongoose.connect(url, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
}).then(() => {
	console.log('Connected to DB!');
}).catch(err => {
	console.log('ERROR:', err.message);
});

let app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(
	require('express-session')({
		secret: 'A simple Auth project',
		resave: false,
		saveUninitialized: false
	})
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Routes
app.get('/', (req, res) => {
	res.render('home');
});

//Auth Routes
//Show signup form
app.get('/register', (req, res) => {
	res.render('register');
});
//handling user sign up
app.post('/register', (req, res) => {
	User.register(new User({
		username: req.body.username
	}), req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req, res, () => {
			res.redirect('/secret');
		});
	});
});

//login routes
app.get('/login', (req, res) => {
	res.render('login');
});
//middleware
app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/secret',
		failureRedirect: '/login'
	}),
	(req, res) => {}
);

//logout routes
app.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
};

app.get('/secret', isLoggedIn, (req, res) => {
	res.render('secret');
});

// app.listen(3000, () => {
// 	console.log('Server started...');
// });
app.listen(process.env.PORT || 3000, process.env.IP, () => {
	console.log('Auth Server has started!');
});