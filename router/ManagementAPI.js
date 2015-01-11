var url = require('url'),
	md5 = require('../lib/hash'),
	colors = require('colors'),
	encode = require('../lib/encode'),
	staticdb = require('../lib/staticdb'),
	async = require('async'),
	fs = require('fs');



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
 * isLogin
 */
function isLogin(req, res) {
	if (!!req.session.logined && !!req.session.user && !!req.cookies.userdata) {
		return true;
	}
	else {
		res.redirect('/');
	}
}
/*
 * isLogin Out
*/
exports.isLogin = function(req, res) {
	if (!!req.session.logined && !!req.session.user && !!req.cookies.userdata) {
		return true;
	}
	else {
		res.redirect('/');
	}
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
 * OnlyParticularPerson
 * out
 */
exports.OnlyParticularPerson = function(req, res, identity) {
	if (!!req.session.logined) {
		if (req.session.user.identity == identity) {
			return true;
		}
		else {
			res.redirect('/404');
		}
	}
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
	staticdb('fcstu', 'message').findOne({
		email: req.session.user.email
	}, function(data) {
		if (!!data) {
			if (!!data.AllMessage[0])
				res.render('dashboard/management/Response', {
					data: data,
					date: new Date().getHours() + ':' + new Date().getMinutes() + (new Date().getHours() > 12 ? ' PM' : ' AM')
				});
			else
				res.render('dashboard/management/Response', {
					data: {
						AllMessage: [{
							title: '',
							subtitle: '沒有任何訊息資料。',
							status: 'success'
						}]
					},
					date: new Date().getHours() + ':' + new Date().getMinutes() + (new Date().getHours() > 12 ? ' PM' : ' AM')
				});
		}
		else {
			res.send("error# server dead! : this user are hacker!");
		}
	});
};
exports.checkAll = function(req, res) {
	//is check all and clean notRead!
	isLogin(req, res);
	staticdb('fcstu', 'message').update({
		email: req.session.user.email
	}, {
		notRead: []
	});
	res.send(true);
}
exports.checkThing = function(req, res) {
	// check can read thing!
	isLogin(req, res);
	//staticdb('fcstu','message').insert({email:"cslag@hotmail.com.tw",total:3,notRead:[{title:"平時作業",subtitle:"您的作業 [PPTP] 實作已經被教授批准了",status:"success"},{title:"平時作業",subtitle:"您的作業 [CPU] 實作已經被教授退回了",status:"danger"},{title:"平時考試",subtitle:"您的平時考 [表面積與體積] 已經釋出了成績 67 分",status:"success"}],AllMessage:[{title:"平時作業",subtitle:"您的作業 [PPTP] 實作已經被教授批准了",status:"success"},{title:"平時作業",subtitle:"您的作業 [CPU] 實作已經被教授退回了",status:"danger"},{title:"平時考試",subtitle:"您的平時考 [表面積與體積] 已經釋出了成績 67 分",status:"success"}]});
	staticdb('fcstu', 'message').findOne({
		email: req.session.user.email
	}, function(data) {
		if (!!data) {
			res.send(data);
		}
		else {
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
function AddRead2People(req, res, person, message) {
	//email: dsdlakd
	//notRead: [{title,subtitle,stats}]
	//Allmessage:[{title,subtitle,stats}]
	var title = message.title;
	var subtitle = message.subtitle;
	var status = message.status;
	staticdb('fcstu', 'message').findOne({
		email: person
	}, function(data) {
		data.notRead.unshift({
			title: title,
			subtitle: subtitle,
			status: status
		});
		data.AllMessage.unshift({
			title: title,
			subtitle: subtitle,
			status: status
		});
		staticdb('fcstu', 'message').override({
			email: person
		}, data);
	});
}
exports.AddRead2People = function(req, res, person, message) {
	//email: dsdlakd
	//notRead: [{title,subtitle,stats}]
	//Allmessage:[{title,subtitle,stats}]
	var title = message.title;
	var subtitle = message.subtitle;
	var status = message.status;
	staticdb('fcstu', 'message').findOne({
		email: person
	}, function(data) {
		data.notRead.unshift({
			title: title,
			subtitle: subtitle,
			status: status
		});
		data.AllMessage.unshift({
			title: title,
			subtitle: subtitle,
			status: status
		});
		staticdb('fcstu', 'message').override({
			email: person
		}, data);
	});
}

exports.addMessage = function(req, res) {
	isLogin(req, res);
	AddRead2People(req, res, req.session.user.email, {
		title: "平時作業",
		subtitle: "您的作業 [PPTP] 實作已經被教授批准了",
		status: "danger"
	});
	res.redirect('/');
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
		staticdb('fcstu', 'message').insert({
			email: req.session.user.email,
			total: 0,
			notRead: [],
			AllMessage: []
		});
		res.redirect('/dashboard?foward=psre&ok=1');
	}
};