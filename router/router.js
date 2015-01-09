var url = require('url'),
	md5 = require('../lib/hash'),
	colors = require('colors'),
	encode = require('../lib/encode'),
	staticdb = require('../lib/staticdb');
	//users = staticdb('fcstu', 'users'),
	//Class = new staticdb('fcstu', 'class');

/**
 * Index Login Page Handle.
 * - Cookie Check
 * - Error
 * - Lose Password
 */
exports.index = function(req, res) {
	/** found get method*/
	if (!!req.session.logined && !!req.session.user && !!req.cookies.userdata) {
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
	isLogin(req, res);
	if (!!req.session.user) {
		if (req.session.user.identity == 'teacher') {
			res.render('dashboard/Teacher/index', {});
		}
		else {
			res.render('dashboard/Student/index', {});
		}
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
	if (!!request.session.logined && !!request.session.user && request.cookies.userdata) {
		callback(true);
	}
	else {
		var email = request.body.email || request.cookies.userdata.email || false,
			password = request.body.password;
		if (email && !!password) {
			staticdb('fcstu', 'users').findOne({
				"email": email.toLowerCase()
			}, function(data) {
				if (data.password == md5(password)) {
					request.session.logined = true;
					request.session.user = {
						email: email,
						identity: data.identity
					};
					response.cookie('userdata', {
						name: data.name,
						email: data.email
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
	if (!!req.session.logined && !!req.session.user && !!req.cookies.userdata) {
		return true;
	}
	else {
		res.redirect('/');
	}
	//清除cookie也要重新登入, 重寫isLogin的程式碼, session也是. ok
}

/**
 * Only Identity
 * this function is check only student can view
 *
 * @param {string} identity
 */
function OnlyParticularPerson(req, res, identity) {
	if (!!req.session.logined) {
		if (req.session.user.identity == identity) {
			return true;
		}
		else {
			res.redirect('/404');
		}
	}
};
/**
 * Management Page
 * All Persion can use
 *
 */
exports.ProfileSetting = function(req, res) {
	isLogin(req, res);
	staticdb('fcstu', 'users').findOne({"email": req.session.user.email.toLowerCase()}, function(data) {
		if(!!data){
			res.render('dashboard/management/ProfileSetting', {dlcEmail:data.email,firstname:data.firstname,name:data.name,StuID:(!!data.StuID)?data.StuID:"教授無須學號資料",Class:(!!data.class)?data.class:"資訊工程系教授",identity:(data.identity == "teacher")?"教授":"學生"});
		}else{
			res.send("資料讀取失敗，請重新登入!");
			res.clearCookie('userdata');
			req.session.logined = null;
			req.session.user = null;
		}
	});
};
exports.PasswordReset = function(req, res) {
	isLogin(req, res);
	var html = '';
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	if(!!query.err){
		html = '<div class="alert alert-danger ms"><strong>Ooops!</strong> <a href="#" class="alert-link ms">密碼需要一致才能夠變更，密碼也必須超過6位字元</a> 請再重新嘗試一次.</div>'
	}
	if(!!query.ok){
		html = '<div class="alert alert-success ms"><strong>Well done!</strong> 您的密碼已完成變更 <a href="#" class="alert-link">請注意密碼的安全性</a>.</div>'
	}
	res.render('dashboard/management/PasswordReset', {email:req.session.user.email,html:html});
};
exports.Response = function(req, res) {
	isLogin(req, res);
	res.render('dashboard/management/Response', {});
};

/**
 * Student All Page
 */
exports.Assets = function(req, res) {
	isLogin(req, res);
	res.render('dashboard/management/Assets', {});
};
exports.UsuallyTest = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	res.render('dashboard/Student/UsuallyTest', {});
};
exports.UsuallyTestScores = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	res.render('dashboard/Student/UsuallyTestScores', {});
};
exports.WeekTest = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	res.render('dashboard/Student/WeekTest', {});
};
exports.WeekTestAnswer = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	res.render('dashboard/management/WeekTestAnswer', {});
};
exports.Homework = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	res.render('dashboard/Student/Homework', {});
};
exports.Question = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	res.render('dashboard/Student/Question', {});
};

/**
 * Teacher All Page
 */
exports.AddStudent = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/StudentManager/AddStudent', {});
};
exports.ModifyStudent = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/StudentManager/ModifyStudent', {});
};
exports.StudentManagement = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	console.log("sds");
	staticdb('fcstu', 'class').findAll(function(data) {
		if(data){
			res.render('dashboard/Teacher/StudentManager/StudentManagement',{list:data});	
		}else{
			res.send("<h1 class='ms'>您還沒有建立學生資料，不允許瀏覽!</h1>");
		}
	});
};
exports.RollColl = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/StudentManager/RollColl', {});
};
exports.AssetsManagement = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/AssetsManager/AssetsManagement', {});
};
exports.AddUsuallyTest = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/UsuallyTestManager/AddUsuallyTest', {});
};
exports.UsuallyTestCorrect = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/UsuallyTestManager/UsuallyTestCorrect', {});
};
exports.UpdateWeekTest = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/WeekTestManagement/UpdateWeekTest', {});
};
exports.HomeworkCorrect = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/HomeworkManager/HomeworkCorrect', {});
};
exports.HomeworkUpdate = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/HomeworkManager/HomeworkUpdate', {});
};

/**
* Feature POST
* 
*/
exports.PasswordResetPost = function(req,res){
	isLogin(req,res);
	var ps1 = req.body.password;
	var ps2 = req.body.repassword;
    if(ps1 !== ps2 || ps1.length < 6){
        var html = '<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Article Dead</title></head><body><p>"Different password or message."</p><p>"欲設定的密碼不盡相同。"</p><p>"パスワードが一致していません"</p><p>"Different mot de passe ou un message."</p><p>"Eri salasana tai viestin."</p><p>"інший пароль або повідомлення."</p>"другой пароль или сообщения."<p>"Malsamaj pasvorton aŭ mesaĝo."</p><p>"jiné heslo nebo zprávu."</p><p>"Verschillende wachtwoord of boodschap."</p><p>"Different Passwort oder eine Nachricht."</p><script>alert("Different password or message."); window.location.href = "/dashboard?foward=psre&err=ps";</script></body></html>';
        res.send(html);
    }else{
    	staticdb('fcstu','users').findOne({email:req.session.user.email},function(data){
			//varlog.password = md5('fcea920f7412b5da7be0cf42b8c93759');
			staticdb('fcstu','users').update({"email":req.session.user.email},{"password":ps1})
		});
        res.redirect('/dashboard?foward=psre&ok=1');
    }
};