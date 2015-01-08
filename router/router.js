var url = require('url'),
	md5 = require('../lib/hash'),
	colors = require('colors'),
	encode = require('../lib/encode'),
	staticdb = require('../lib/staticdb'),
	users = new staticdb('fcstu', 'users');

/**
 * Index Login Page Handle.
 * - Cookie Check
 * - Error
 * - Lose Password
 */
exports.index = function(req, res) {
	/** found get method*/
	if (req.session.logined) {
		res.redirect('/dashboard');
	}
	var url_parts = url.parse(req.url, true),
		query = url_parts.query; //query username if find
	/** if want clean user cookie, clean*/
	if (query.clean == "true") {
		res.clearCookie('userdata');
		res.redirect('/');
	}
	//如果有cookie才找username，不是本人就刪除cookie即可,資訊全部撈cookie的資料
	if (!!req.cookies.userdata) {
		//if is logined
		var cookie = req.cookies.userdata;
		res.render('singin', {
			logined: true,
			name: cookie.name,
			gravatar: 'http://www.gravatar.com/avatar/' + md5(cookie.email) + '?s=200'
		});
	}
	else {
		//if never login
		res.render('singin', {
			logined: false
		});
	}
};

/**
 * Handle Login User Dashboard render
 */
exports.dashboard_get = function(req, res) {
	if (!!req.session.logined) {
		res.render('dashboard/index', {});
	}
	else {
		res.redirect('/');
	}
};

/**
 * Handle Dashboard router.
 * **checkLogin
 * **page render
 *
 */
exports.dashboard = function(req, res) {
	//first check cookie "username". if no, check form "username" and "password". and reading
	checkLogin(req, res, function(stats) {
		if (stats) {
			res.redirect('/dashboard');
		}
		else {
			res.redirect('/?error=1');
		}
	});
};

/**
 * checkLogin function
 * @param {String} email_
 * @param {String} password
 * @param {Object} request
 * @param {Object} response
 * @callback {boolean} if login(true)
 */
function checkLogin(request, response, callback) {
	//check all - email and password
	if (!!request.session.logined) {
		callback(true);
	}
	else {
		var email = request.body.email || request.cookies.userdata.email || false,
			password = request.body.password;
		if (email && !!password) {
			users.findOne({
				"email": email.toLowerCase()
			}, function(data) {
				if (data.password == md5(password)) {
					request.session.logined = true;
					request.session.user = {
						email: email,
						identity: data.identity
					};
					response.cookie('userdata', {
						name: "Mac",
						email: 'cslag@hotmail.com.tw'
					}, {
						maxAge: new Date(Date.now() + 1000),
						httpOnly: true
					});
					callback(true);
				}
				else {
					callback(false);
				}
			});
		}
		else {
			callback(false);
		}
	}
}

/**
 * Logout
 * clean all session and redirect to index(singin page)
 */
exports.signout = function(req, res) {
	//res.clearCookie('userdata');
	req.session.logined = null;
	req.session.user = null;
	res.redirect('/?logout=1');
}

/**
 * isLogin
 */
function isLogin(req, res) {
		if (!!req.session.logined) {
			return true;
		}
		else {
			res.redirect('/');
		}
		//清除cookie也要重新登入, 重寫isLogin的程式碼, session也是
	}
	/**
	 * is Student or Teacher, check Login
	 */
function invalts(req, res) {
	if (req.session.user.identity == "student") {
		return "student";
	}
	else if (req.session.user.identity == "teacher") {
		return "teacher";
	}
	else {
		res.redirect('/');
	}
};

/**
 * Student All Page
 */
exports.ProfileSetting = function(req, res) {
	isLogin(req, res);
	res.render('dashboard/management/ProfileSetting', {});
};
exports.PasswordReset = function(req, res) {
	isLogin(req, res);
	res.render('dashboard/management/PasswordReset', {});
};
exports.Assets = function(req, res) {
	isLogin(req, res);
	res.render('dashboard/management/Assets', {});
};
exports.UsuallyTest = function(req, res) {
	isLogin(req, res);
	res.render('dashboard/Student/UsuallyTest', {});
};
exports.UsuallyTestScores = function(req, res) {
	isLogin(req, res);
	res.render('dashboard/Student/UsuallyTestScores', {});
};
exports.WeekTest = function(req, res) {
	isLogin(req, res);
	res.render('dashboard/Student/WeekTest', {});
};
exports.WeekTestAnswer = function(req, res) {
	isLogin(req, res);
	res.render('dashboard/management/WeekTestAnswer', {});
};
exports.Homework = function(req,res){
	isLogin(req,res);
	res.render('dashboard/Student/Homework',{});
};
exports.HomeworkResponse = function(req,res){
	isLogin(req,res);
	res.render('dashboard/Student/HomeworkResponse',{});
};
exports.Question = function(req,res){
	isLogin(req,res);
	res.render('dashboard/management/Question',{});
};

/**
 * Teacher All Page
 */