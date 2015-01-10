var url = require('url'),
	md5 = require('../lib/hash'),
	colors = require('colors'),
	encode = require('../lib/encode'),
	staticdb = require('../lib/staticdb'),
	async = require('async'),
	fs = require('fs');
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
			res.render('dashboard/Teacher/index', {
				name: req.cookies.userdata.name,
				firstname: req.session.user.firstname,
				gravatar: 'http://www.gravatar.com/avatar/' + md5(req.cookies.userdata.email) + '?s=200'
			});
		}
		else {
			res.render('dashboard/Student/index', {
				name: req.cookies.userdata.name,
				firstname: req.session.user.firstname,
				gravatar: 'http://www.gravatar.com/avatar/' + md5(req.cookies.userdata.email) + '?s=200'
			});
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
						firstname: data.firstname,
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
	staticdb('fcstu', 'users').findOne({
		"email": req.session.user.email.toLowerCase()
	}, function(data) {
		if (!!data) {
			res.render('dashboard/management/ProfileSetting', {
				dlcEmail: data.email,
				firstname: data.firstname,
				name: data.name,
				StuID: (!!data.StuID) ? data.StuID : "教授無須學號資料",
				Class: (!!data.class) ? data.class : "資訊工程系教授",
				identity: (data.identity == "teacher") ? "教授" : "學生"
			});
		}
		else {
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
	if (!!query.err) {
		html = '<div class="alert alert-danger ms"><strong>Ooops!</strong> <a href="#" class="alert-link ms">密碼需要一致才能夠變更，密碼也必須超過6位字元</a> 請再重新嘗試一次.</div>';
	}
	if (!!query.ok) {
		html = '<div class="alert alert-success ms"><strong>Well done!</strong> 您的密碼已完成變更 <a href="#" class="alert-link">請注意密碼的安全性</a>.</div>';
	}
	if (isLogin(req, res))
		res.render('dashboard/management/PasswordReset', {
			email: req.session.user.email,
			html: html
		});
};
exports.Response = function(req, res) {
	isLogin(req, res);
	staticdb('fcstu','message').findOne({email:req.session.user.email},function(data){
		if(!!data){
			if(!!data.AllMessage[0])
				res.render('dashboard/management/Response', {data:data,date:new Date().getHours()+':'+new Date().getMinutes()+(new Date().getHours() > 12?' PM':' AM')});
			else
				res.render('dashboard/management/Response',{data:{AllMessage:[{title:'',subtitle:'沒有任何訊息資料。',status:'success'}]},date: new Date().getHours()+':'+new Date().getMinutes()+(new Date().getHours() > 12?' PM':' AM')});
		}else{
			res.send("error# server dead! : this user are hacker!");
		}
	});
};
exports.checkAll = function(req,res){
	//is check all and clean notRead!
	isLogin(req,res);
	staticdb('fcstu','message').update({email:req.session.user.email},{notRead:[]});
	res.send(true);
}
exports.checkThing = function(req,res){
	// check can read thing!
	isLogin(req,res);
	//staticdb('fcstu','message').insert({email:"cslag@hotmail.com.tw",total:3,notRead:[{title:"平時作業",subtitle:"您的作業 [PPTP] 實作已經被教授批准了",status:"success"},{title:"平時作業",subtitle:"您的作業 [CPU] 實作已經被教授退回了",status:"danger"},{title:"平時考試",subtitle:"您的平時考 [表面積與體積] 已經釋出了成績 67 分",status:"success"}],AllMessage:[{title:"平時作業",subtitle:"您的作業 [PPTP] 實作已經被教授批准了",status:"success"},{title:"平時作業",subtitle:"您的作業 [CPU] 實作已經被教授退回了",status:"danger"},{title:"平時考試",subtitle:"您的平時考 [表面積與體積] 已經釋出了成績 67 分",status:"success"}]});
	staticdb('fcstu','message').findOne({email:req.session.user.email},function(data){
		if(!!data){
			res.send(data);	
		}else{
			res.send("error");
		}
		
	});
}

/**
* Add Read message to people
* 
* @param {request} req
* @param {response} res
* @param {strnig} person
* @param {object} message -> {title,subtitle,stats}
*/
function AddRead2People(req,res,person,message){
	//email: dsdlakd
	//total: notRead + new message length
	//notRead: [{title,subtitle,stats}]
	//Allmessage:[{title,subtitle,stats}]
	var title = message.title;
	var subtitle = message.subtitle;
	var status = message.status;
	staticdb('fcstu','message').findOne({email:person},function(data){
		data.notRead.unshift({title:title,subtitle:subtitle,status:status});
		data.AllMessage.unshift({title:title,subtitle:subtitle,status:status});
		staticdb('fcstu','message').override({email:person},data);
	});
	//staticdb('fcstu','message').update({email:person},
	//{total:,notRead:[{title:"平時作業",subtitle:"您的作業 [PPTP] 實作已經被教授批准了",status:"success"},{title:"平時作業",subtitle:"您的作業 [CPU] 實作已經被教授退回了",status:"danger"},{title:"平時考試",subtitle:"您的平時考 [表面積與體積] 已經釋出了成績 67 分",status:"success"}],AllMessage:[{title:"平時作業",subtitle:"您的作業 [PPTP] 實作已經被教授批准了",status:"success"},{title:"平時作業",subtitle:"您的作業 [CPU] 實作已經被教授退回了",status:"danger"},{title:"平時考試",subtitle:"您的平時考 [表面積與體積] 已經釋出了成績 67 分",status:"success"}]});
}
exports.addMessage = function(req,res){
	isLogin(req,res);
	AddRead2People(req,res,"cslag@hotmail.com.tw",{title:"平時作業",subtitle:"您的作業 [PPTP] 實作已經被教授批准了",status:"danger"});
	res.redirect('/');
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
	staticdb('fcstu', 'usually').findAll(function(data) {
		if (!!data) {
			res.render('dashboard/Student/UsuallyTest', {
				data: data[Object.keys(data).length - 1]
			});
		}
		else {
			res.send("沒有任何新的平時測驗");
		}
	});
};
exports.UsuallyTestScores = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	res.render('dashboard/Student/UsuallyTestScores', {});
};
exports.WeekTest = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	staticdb('fcstu', 'week').findAll(function(data) {
		if (!!data) {
			res.render('dashboard/Student/WeekTest', {
				data: data[Object.keys(data).length - 1]
			});
		}
		else {
			res.send("沒有釋出週試題目，請等待教授完成出題");
		}
	})
};
exports.WeekTestAnswer = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	staticdb('fcstu','week').findAll(function(data) {
	    if (!!data) {
			res.render('dashboard/management/WeekTestAnswer', {
				data: data[Object.keys(data).length - 1]
			});
		}
		else {
			res.send("沒有釋出週試題目，自然也不會有解答");
		}
	});
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
exports.getAssets = function(req,res){
	isLogin(req,res);
	OnlyParticularPerson(req,res,'student');
	staticdb('fcstu','assets').findAll(function(data){
		if(!!data){
			res.send({url:data[Object.keys(data).length-1].url});
		}else{
			res.send({url:'none'});
		}
	});
};

/**
 * Teacher All Page
 */
exports.AddStudent = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	var html = '';
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	if (!!query.err) {
		html = '<div class="alert alert-danger ms"><strong>Ooops!</strong> <a href="#" class="alert-link ms">學生資料需要整齊才可以新增</a> 請再重新嘗試一次.</div>';
	}
	if (!!query.ok) {
		html = '<div class="alert alert-success ms"><strong>Well done!</strong> 學生已完成加入<a href="#" class="alert-link">您可以至學生管理查看目前狀態</a>.</div>';
	}
	if (isLogin(req, res))
		res.render('dashboard/Teacher/StudentManager/AddStudent', {
			html: html
		});
};
exports.ModifyStudent = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/StudentManager/ModifyStudent', {});
};
exports.StudentManagement = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	staticdb('fcstu', 'class').findAll(function(data) {
		if (data) {
			res.render('dashboard/Teacher/StudentManager/StudentManagement', {
				list: data
			});
		}
		else {
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
	var html = '';
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	if (!!query.err) {
		html = '<div class="alert alert-danger ms"><strong>Ooops!</strong> <a href="#" class="alert-link ms">資源網址不能為空</a> 請再重新嘗試一次.</div>';
	}
	if (!!query.ok) {
		html = '<div class="alert alert-success ms"><strong>Well done!</strong> 資源已完成新增<a href="#" class="alert-link">您隨時可以變更您的資源網址，我們在每次修改都會存取一次紀錄</a>.</div>';
	}
	if (isLogin(req, res)){
		staticdb('fcstu', 'assets').findAll(function(data){
			if(!!data){
				res.render('dashboard/Teacher/AssetsManager/AssetsManagement', {html:html,indata:true,data:data[Object.keys(data).length-1]});
			}else{
				res.render('dashboard/Teacher/AssetsManager/AssetsManagement', {html:html,indata:false});
			}
		});
	}
};
exports.AddUsuallyTest = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	var html = '';
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	if (!!query.err) {
		html = '<div class="alert alert-danger ms"><strong>Ooops!</strong> <a href="#" class="alert-link ms">資料不齊全，需要填入才可以新增，尤其您需要繪製圖片給學生參考！</a> 請再重新嘗試一次.</div>';
	}
	if (!!query.ok) {
		html = '<div class="alert alert-success ms"><strong>Well done!</strong> 平時考資料已完成加入<a href="#" class="alert-link">若要更新，請在本表單重新輸入</a>.</div>';
	}
	if (isLogin(req, res))
		res.render('dashboard/Teacher/UsuallyTestManager/AddUsuallyTest', {
			html: html
		});
};
exports.UsuallyTestCorrect = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/UsuallyTestManager/UsuallyTestCorrect', {});
};
exports.UpdateWeekTest = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	var html = '';
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	if (!!query.err) {
		html = '<div class="alert alert-danger ms"><strong>Ooops!</strong> <a href="#" class="alert-link ms">資料不齊全，需要填入才可以新增，尤其您需要繪製圖片給學生參考！</a> 請再重新嘗試一次.</div>';
	}
	if (!!query.ok) {
		html = '<div class="alert alert-success ms"><strong>Well done!</strong> 每週測驗資料已完成加入<a href="#" class="alert-link">若要更新，請在本表單重新輸入</a>.</div>';
	}
	if (isLogin(req, res)) {
		staticdb('fcstu', 'week').findAll(function(data) {
			if (!!data) {
				res.render('dashboard/Teacher/WeekTestManagement/UpdateWeekTest', {
					html: html,
					indata: true,
					data: data[Object.keys(data).length - 1]
				});
			}
			else {
				res.render('dashboard/Teacher/WeekTestManagement/UpdateWeekTest', {
					html: html,
					indata: false
				});
			}
		});
	}
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
exports.PasswordResetPost = function(req, res) {
	isLogin(req, res);
	var ps1 = req.body.password;
	var ps2 = req.body.repassword;
	if (ps1 !== ps2 || ps1.length < 6) {
		var html = '<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Article Dead</title></head><body><p>"Different password or message."</p><p>"欲設定的密碼不盡相同。"</p><p>"パスワードが一致していません"</p><p>"Different mot de passe ou un message."</p><p>"Eri salasana tai viestin."</p><p>"інший пароль або повідомлення."</p>"другой пароль или сообщения."<p>"Malsamaj pasvorton aŭ mesaĝo."</p><p>"jiné heslo nebo zprávu."</p><p>"Verschillende wachtwoord of boodschap."</p><p>"Different Passwort oder eine Nachricht."</p><script>alert("Different password or message."); window.location.href = "/dashboard?foward=psre&err=ps";</script></body></html>';
		res.send(html);
	}
	else {
		staticdb('fcstu', 'users').update({
			"email": req.session.user.email
		}, {
			"password": md5(ps1)
		})
		staticdb('fcstu','message').insert({email:req.session.user.email,total:0,notRead:[],AllMessage:[]});
		res.redirect('/dashboard?foward=psre&ok=1');
	}
};
exports.AddStudentPost = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	var name = req.body.name;
	var lastname = req.body.firstname;
	var stuID = req.body.stuid;
	var email = req.body.email;
	var Class = req.body.class;
	if (!!name && !!lastname && !!stuID && !!email && !!Class) {
		staticdb('fcstu', 'users').insert({
			"name": name,
			"firstname": lastname,
			"email": email,
			'password': md5(stuID),
			StuID: stuID,
			"class": Class,
			'identity': 'student'
		});
		res.redirect('/dashboard?foward=astu&ok=1');
	}
	else {
		res.redirect('/dashboard?foward=astu&err=1');
	}
}

//Usually Test Feature
exports.AddUsuallyTestPost = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	var title = req.body.title;
	var deadline = req.body.deadline;
	var image = req.body.image;
	var chtml = req.body.contextHTML;
	var qhtml = req.body.quizHTML;
	if (!!title && !!deadline && !!image && !!chtml && !!qhtml) {
		staticdb('fcstu', 'usually').insert({
			title: title,
			deadline: deadline,
			image: image,
			chtml: chtml,
			qhtml: qhtml
		});
		res.redirect('/dashboard?foward=autup&ok=1');
	}
	else {
		res.redirect('/dashboard?foward=autup&err=1');
	}
};
exports.UpdateWeekTestPost = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	var title = req.body.title;
	var image = req.body.image;
	var chtml = req.body.chtml;
	var qhtml = req.body.qhtml;
	var anshtml = req.body.anshtml;
	if (!!title && !!image && !!chtml && !!qhtml && !!anshtml) {
		var str = req.body.qhtml;
		str = '<div class="col-md-6"><div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">Question</h4></div><div class="panel-body"><div style="float:none;width:100%"><div class="course-quiz-question-text">' + str + '</div></div></div></div></div>';
		str = str.replace(/--addNewSection_V/g, '</div></div></div></div></div><div class="col-md-6"><div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">Question</h4></div><div class="panel-body"><div style="float:none;width:100%"><div class="course-quiz-question-text">');
		staticdb('fcstu', 'week').insert({
			title: title,
			image: image,
			chtml: chtml,
			qhtml: str,
			anshtml: anshtml,
			openDate: new Date().getDate()
		});
		res.redirect('/dashboard?foward=uwt&ok=1');
	}
	else {
		res.redirect('/dashboard?foward=uwt&err=1');
	}
};
exports.AssetsManagementPost = function(req,res){	
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	var url = req.body.url;
	if (!!url) {
		staticdb('fcstu', 'assets').insert({
			url: url
		});
		res.redirect('/dashboard?foward=assets&ok=1');
	}
	else {
		res.redirect('/dashboard?foward=assets&err=1');
	}
};