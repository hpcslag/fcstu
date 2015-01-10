var express = require('express'),
	app = new express(),
	ejs = require('ejs'),
	router = require('./router');

app.configure(function() {
	app.use(express.static(__dirname + '/www'));
	app.use(express.cookieParser());
	app.use(express.session({
		secret: 'MD5HeapMap'
	}));
	/**
	*Long Alive Server session
	
	app.use(express.cookieSession({
		key:'cookie',
		secret:'https://www.youtube.com/watch?v=SR6iYWJxHqs'
	}));*/
	app.use(express.bodyParser()); //open GER,POST body parser
	app.set('views', __dirname + '/www'); //views engine path
	app.set('view engine', 'ejs');
	app.use(app.router); //open routers

	//404
	app.use(function(req, res, next) {
		res.status(404);

		// respond with html page
		if (req.accepts('html')) {
			res.render('404');
			return;
		}

		// respond with json
		if (req.accepts('json')) {
			res.send({
				error: 'Not found'
			});
			return;
		}

		// default to plain-text. send()
		res.type('txt').send('Not found');
	})
});

//Global Router
app.get('/', router.index);
app.get('/dashboard', router.dashboard_get);
app.get('/signout', router.signout);
app.get('/ProfileSetting', router.ProfileSetting);
app.get('/PasswordReset', router.PasswordReset);
app.get('/Response',router.Response);
//losePassword
//resetPassword
//mail to


//Student Router
app.get('/Assets', router.Assets);
app.get('/UsuallyTest', router.UsuallyTest);
app.get('/UsuallyTestScores', router.UsuallyTestScores);
app.get('/WeekTest', router.WeekTest);
app.get('/WeekTestAnswer', router.WeekTestAnswer);
app.get('/Homework',router.Homework);
app.get('/Question',router.Question);

//Teacher Router
app.get('/AddStudent',router.AddStudent);
app.get('/ModifyStudent',router.ModifyStudent);
app.get('/StudentManagement',router.StudentManagement);
app.get('/RollColl',router.RollColl);
app.get('/AssetsManagement',router.AssetsManagement);
app.get('/AddUsuallyTest',router.AddUsuallyTest);
app.get('/UsuallyTestCorrect',router.UsuallyTestCorrect);
app.get('/UpdateWeekTest',router.UpdateWeekTest);
app.get('/HomeworkCorrect',router.HomeworkCorrect);
app.get('/HomeworkUpdate',router.HomeworkUpdate);

//Feature POST Router
app.post('/dashboard', router.dashboard);
app.post('/PasswordReset',router.PasswordResetPost);
app.post('/AddStudent',router.AddStudentPost);
app.post('AddUsuallyTest',router.AddUsuallyTestPost);
app.listen(process.env.PORT);
