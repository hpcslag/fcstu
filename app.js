var express = require('express'),
	app = new express(),
	ejs = require('ejs'),
	router = require('./router'),
	ManagementAPI = require('./router/ManagementAPI.js'),
	StudentAPI = require('./router/StudentAPI.js'),
	TeacherAPI = require('./router/TeacherAPI.js');

app.configure(function() {
	app.use(express.static(__dirname + '/www'));
	app.use(express.cookieParser());
	/*app.use(express.session({
		secret: 'MD5HeapMap'
	}));*/
	/**
	*Long Alive Server session*/
	
	app.use(express.cookieSession({
		key:'cookie',
		secret:'https://www.youtube.com/watch?v=SR6iYWJxHqs'
	}));
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
app.get('/signout',router.signout);
app.get('/', router.index);
app.get('/dashboard', router.dashboard_get);

//ManagementAPI Router
app.get('/ProfileSetting', ManagementAPI.ProfileSetting);
app.get('/PasswordReset', ManagementAPI.PasswordReset);
app.get('/Response',ManagementAPI.Response);
app.get('/checkAll',ManagementAPI.checkAll);//message check all read!
app.get('/checkThing',ManagementAPI.checkThing);//check not read message!
app.post('/dashboard', ManagementAPI.dashboard);
app.post('/PasswordReset',ManagementAPI.PasswordResetPost);
//losePassword
//resetPassword
//mail to
//message test
app.get('/addMessage',ManagementAPI.addMessage);

//StudentAPI Router
app.get('/Assets', StudentAPI.Assets);
app.get('/UsuallyTest', StudentAPI.UsuallyTest);
app.get('/UsuallyTestScores', StudentAPI.UsuallyTestScores);
app.get('/WeekTest', StudentAPI.WeekTest);
app.get('/WeekTestAnswer', StudentAPI.WeekTestAnswer);
app.get('/Homework',StudentAPI.Homework);
app.get('/Question',StudentAPI.Question);
app.get('/getAssets',StudentAPI.getAssets);
//Studnet Feature POST Router
app.post('/UsuallyTest',StudentAPI.UsuallyTestPost);
app.post('/Homework',StudentAPI.HomeworkPost);
app.post('/FeedBack',StudentAPI.FeedBack);

//Teacher Router
app.get('/AddStudent',TeacherAPI.AddStudent);
app.get('/ModifyStudent',TeacherAPI.ModifyStudent);
app.get('/StudentManagement',TeacherAPI.StudentManagement);
app.get('/RollColl',TeacherAPI.RollColl);
app.get('/AssetsManagement',TeacherAPI.AssetsManagement);
app.get('/AddUsuallyTest',TeacherAPI.AddUsuallyTest);
app.get('/UsuallyTestCorrect',TeacherAPI.UsuallyTestCorrect);
app.get('/UpdateWeekTest',TeacherAPI.UpdateWeekTest);
app.get('/HomeworkCorrect',TeacherAPI.HomeworkCorrect);
app.get('/HomeworkUpdate',TeacherAPI.HomeworkUpdate);

//Feature POST Router
app.post('/AddStudent',TeacherAPI.AddStudentPost);
app.post('/AddUsuallyTest',TeacherAPI.AddUsuallyTestPost);
app.post('/UpdateWeekTest',TeacherAPI.UpdateWeekTestPost);
app.post('/AssetsManagement',TeacherAPI.AssetsManagementPost);
app.get('/UsuallyTestGift',TeacherAPI.UsuallyTestGift);
app.get('/HomeworkCorrectGet',TeacherAPI.HomeworkCorrectGet);
app.post('/RollColl',TeacherAPI.RollCollPost);





//listen in default port
app.listen(process.env.PORT);