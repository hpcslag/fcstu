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
	//staticdb('fcstu','message').update({email:person},
	//{total:,notRead:[{title:"平時作業",subtitle:"您的作業 [PPTP] 實作已經被教授批准了",status:"success"},{title:"平時作業",subtitle:"您的作業 [CPU] 實作已經被教授退回了",status:"danger"},{title:"平時考試",subtitle:"您的平時考 [表面積與體積] 已經釋出了成績 67 分",status:"success"}],AllMessage:[{title:"平時作業",subtitle:"您的作業 [PPTP] 實作已經被教授批准了",status:"success"},{title:"平時作業",subtitle:"您的作業 [CPU] 實作已經被教授退回了",status:"danger"},{title:"平時考試",subtitle:"您的平時考 [表面積與體積] 已經釋出了成績 67 分",status:"success"}]});
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
			var html = '';
			var url = require('url');
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			if (!!query.err) {
				html = '<div class="alert alert-danger ms"><strong>Ooops!</strong> <a href="#" class="alert-link ms">需要寫完考試題目，否則無法計算成績</a> 請再重新嘗試一次.</div>';
			}
			if (!!query.ok) {
				html = '<div class="alert alert-success ms"><strong>Well done!</strong> 考試已完成提交，若教授批改將會通知。 <a href="#" class="alert-link">請加油！</a>.</div>';
			}
			staticdb('fcstu', 'studentUsually').findOne({
				email: req.session.user.email
			}, function(row) {
				staticdb('fcstu', 'usually').findAll(function(datas) {
					var length = Object.keys(datas).length;
					if (row.scope.length == length || row.test.length == length) {
						res.render('dashboard/Student/UsuallyTest', {
							data: 0,
							html: html,
							indata: false
						});
					}
					else {
						res.render('dashboard/Student/UsuallyTest', {
							data: data[Object.keys(data).length - 1],
							html: html,
							indata: true
						});
					}
				});
			})
		}
		else {
			res.send("沒有任何新的平時測驗");
		}
	});
};
exports.UsuallyTestScores = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	var scope = {};
	staticdb('fcstu', 'studentUsually').findOne({
		email: "cslag@hotmail.com.tw"
	}, function(row) {
		var err = "沒有成績紀錄(NaN)";
		var thr = "進步 ";
		var btr = "退步 ";

		var now = {
			now: (!!row.scope[row.scope.length - 1] ? row.scope[row.scope.length - 1].scope : "無紀錄")
		};
		var last = {
			now: (!!row.scope[row.scope.length - 2] ? row.scope[row.scope.length - 2].scope : "無紀錄")
		};
		var backlast = {
			now: (!!row.scope[row.scope.length - 3] ? row.scope[row.scope.length - 3].scope : "無紀錄")
		};
		var progressNow = {
			now: (now.now - last.now >= 0 ? now.now - last.now : (now.now - last.now) * -1),
			isBack: (now.now - last.now >= 0 ? true : false)
		};
		var progressLast = {
			now: (last.now - backlast.now >= 0 ? last.now - backlast.now : (last.now - backlast.now) * -1),
			isBack: (last.now - backlast.now >= 0 ? true : false)
		};
		var feedBack = {
			tag: (!!row.scope[row.scope.length - 1] ? row.scope[row.scope.length - 1].tag : "目前還沒有考試紀錄回應"),
			time: new Date()
		};
		res.render('dashboard/Student/UsuallyTestScores', {
			now: now,
			last: last,
			progressNow: progressNow,
			progressLast: progressLast,
			feedBack: feedBack
		});
	});
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
	staticdb('fcstu', 'week').findAll(function(data) {
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
	var html = '';
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	if (!!query.err) {
		html = '<div class="alert alert-danger ms"><strong>Ooops!</strong> <a href="#" class="alert-link ms">提交作業應將回應完整填寫</a> 請再重新嘗試一次.</div>';
	}
	if (!!query.ok) {
		html = '<div class="alert alert-success ms"><strong>Well done!</strong> 作業已完成提交，若教授批改將會通知。 <a href="#" class="alert-link">請加油！</a>.</div>';
	}
	staticdb('fcstu', 'homeworkqus').findAll(function(row) {
		if (row[Object.keys(row)].homework.length == 0) {
			console.log("目前沒有作業可以做");
		}
		else {
			staticdb('fcstu', 'homework').findOne({
				email: req.session.user.email
			}, function(data) {
				if (data.homework.length < row[Object.keys(row)].homework.length) {
					var homework = row[Object.keys(row)].homework[row[Object.keys(row)].homework.length - 1];
					res.render('dashboard/Student/Homework', {
						html: html,
						homework: homework
					});
				}
				else {
					res.send("<h1 class='ms'> 你已經完成這項作業了!</h1>");
				}
			});
		}
	});
};
exports.Question = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	var html = '';
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	if (!!query.err) {
		html = '<div class="alert alert-danger ms"><strong>Ooops!</strong> <a href="#" class="alert-link ms">要與教授反饋，麻煩請將資料完整填寫！</a> 請再重新嘗試一次.</div>';
	}
	if (!!query.ok) {
		html = '<div class="alert alert-success ms"><strong>Well done!</strong> 反饋已完成提交，若教授收到通知，可能會另外與您聯絡! <a href="#" class="alert-link">有急事請至教授辦公室</a>.</div>';
	}
	res.render('dashboard/Student/Question', {
		html: html
	});
};
exports.getAssets = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	staticdb('fcstu', 'assets').findAll(function(data) {
		if (!!data) {
			res.send({
				url: data[Object.keys(data).length - 1].url
			});
		}
		else {
			res.send({
				url: 'none'
			});
		}
	});
};
/**
 * Student Feature Post
 */
exports.UsuallyTestPost = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	var url = req.body.url;
	var context = req.body.context;
	if (!!url && !!context) {
		staticdb('fcstu', 'studentUsually').findOne({
			email: req.session.user.email
		}, function(data) {
			data.test.push({
				url: url,
				"context": context
			});
			staticdb('fcstu', 'studentUsually').override({
				email: req.session.user.email
			}, data);
		});
		res.redirect('/dashboard/?foward=utu&ok=1')
	}
	else {
		res.redirect('/dashboard/?foward=utu&err=1');
	}
}
exports.HomeworkPost = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	if (!!req.body.url && !!req.body.response && !!req.body.keyword) {
		console.log("你可以交作業了");
		staticdb('fcstu', 'homework').findOne({
			email: req.session.user.email
		}, function(row) {
			//檢查有沒有做過了
			staticdb('fcstu', 'homeworkqus').findAll(function(data) {
				//if(data.homework.length<row[Object.keys(row)].homework.length){
				if (row.homework.length < data[Object.keys(data)].homework.length) {
					row.homework.push({
						url: req.body.url,
						response: req.body.response,
						keyword: req.body.keyword
					});
					staticdb('fcstu', 'homework').override({
						email: req.session.user.email
					}, row);
					res.send("<h1 class='ms'>作業已完成繳交，若批改會通知</h1><script>alert('作業已完成繳交，若批改會通知'); window.location.href = '/dashboard';</script>");
				}
				else {
					res.send("<h1 class='ms'>你已經完成過這項作業了！</h1>");
				}
			});
		});
	}
	else {
		res.redirect('/dashboard?foward=H&err=1');
	}
}
exports.FeedBack = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'student');
	if (!!req.body.title && !!req.body.feedback) {
		staticdb('fcstu', 'users').findAll(function(data) {
			for (var i = 0; i < Object.keys(data).length; i++) {
				if (data[Object.keys(data)[i]].identity == 'teacher') {
					AddRead2People(req, res, data[i].email, {
						title: req.body.title,
						subtitle: req.body.feedback,
						status: 'info'
					});
					res.redirect('/dashboard?foward=feedback&ok=1');
				}
			}
		});
	}
	else {
		res.redirect('/dashboard?foward=feedback&err=1');
	}
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
	staticdb('fcstu', 'class').findAll(function(data) {
		var Class = [];
		for (var i = 0; i < Object.keys(data['0'].rollcall).length; i++) {
			var studentName = Object.keys(data['0'].rollcall)[i];
			var className = data[Object.keys(data)].rollcall[Object.keys(data[Object.keys(data)].rollcall)[i]].class;
			var email = data[Object.keys(data)].rollcall[Object.keys(data[Object.keys(data)].rollcall)[i]].email;
			Class.push({
				name: studentName,
				class: className,
				email: email
			});
		}
		res.render('dashboard/Teacher/StudentManager/RollColl', {
			data: Class
		});
	});
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
	if (isLogin(req, res)) {
		staticdb('fcstu', 'assets').findAll(function(data) {
			if (!!data) {
				res.render('dashboard/Teacher/AssetsManager/AssetsManagement', {
					html: html,
					indata: true,
					data: data[Object.keys(data).length - 1]
				});
			}
			else {
				res.render('dashboard/Teacher/AssetsManager/AssetsManagement', {
					html: html,
					indata: false
				});
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
	staticdb('fcstu', 'usually').findAll(function(row) {
		var length = Object.keys(row).length - 1;
		staticdb('fcstu', 'studentUsually').findAll(function(data) {
			var student = [];
			for (var i = 0; i < Object.keys(data).length; i++) {
				if (!!data[i].scope[length] == false && data[i].test.length == length + 1) {
					student.push({
						email: data[i].email,
						name: data[i].name,
						class: data[i].class,
						url: data[i].test[length].url,
						context: data[i].test[length].context
					});
				}
			}
			var html = '';
			var url = require('url');
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			if (!!query.err) {
				html = '<div class="alert alert-danger ms"><strong>Ooops!</strong> <a href="#" class="alert-link ms">資料不齊全，需要填入才可以新增，尤其您需要評分學生的成績！</a> 請再重新嘗試一次.</div>';
			}
			if (!!query.ok) {
				html = '<div class="alert alert-success ms"><strong>Well done!</strong> 平時考分數資料已完成加入<a href="#" class="alert-link">若要更新，請變更資料庫表</a>.</div>';
			}
			res.render('dashboard/Teacher/UsuallyTestManager/UsuallyTestCorrect', {
				data: student,
				html: html
			});
		});
	});
};
exports.UsuallyTestGift = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	var html = '';
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	if (!!query.scope && !!query.tag && !isNaN(parseInt(query.scope))) {
		staticdb('fcstu', 'usually').findAll(function(row) {
			var length = Object.keys(row).length - 1;
			staticdb('fcstu', 'studentUsually').findOne({
				email: query.email
			}, function(data) {
				if (!!data) {
					if (!!data.scope[length] == false && data.test.length == length + 1) {
						//{"scope":99,"tag":"你沒有寫完",pass:21} //你被21了
						var sc = {
							scope: query.scope,
							tag: query.tag,
							pass: query.pass
						};
						data.scope.push(sc);
						staticdb('fcstu', 'studentUsually').override({
							email: query.email
						}, data);
						AddRead2People(req, res, query.email, {
							title: "平時測驗",
							subtitle: "您最近的平時考已批改，分數: " + query.scope,
							status: query.pass == 21 ? "danger" : "success"
						})
						res.redirect('/dashboard?foward=suc&ok=1');
					}
					else {
						res.send("以批改學生或資料");
					}
				}
				else {
					res.send("找無學生資料");
				}
			});
		});
	}
	else {
		res.redirect('/dashboard?foward=suc&err=1');
		//res.send("請輸入正確數值");
	}
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
	staticdb('fcstu', 'homeworkqus').findAll(function(row) {
		var length = row[Object.keys(row)].homework.length;
		var html = '';
		var url = require('url');
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		if (!!query.err) {
			html = '<div class="alert alert-danger ms"><strong>Ooops!</strong> <a href="#" class="alert-link ms">資料不齊全，需要填入才可以新增，尤其您需要輸入學生分數！</a> 請再重新嘗試一次.</div>';
		}
		if (!!query.ok) {
			html = '<div class="alert alert-success ms"><strong>Well done!</strong> 學生資料已完成加入<a href="#" class="alert-link">若要更新，請查詢資料庫</a>.</div>';
		}
		staticdb('fcstu', 'homework').findAll(function(data) {
			var student = [];
			for (var i = 0; i < Object.keys(data).length; i++) {
				//可批改條件 沒有分數 且 有答案，跟數量一樣
				if (data[i].homework.length == length && !!data[i].scope[length - 1] == false) {
					student.push({
						email: data[i].email,
						name: data[i].name,
						class: data[i].class,
						url: data[i].homework[length - 1].url,
						response: data[i].homework[length - 1].response,
						keyword: data[i].homework[length - 1].keyword
					});
				}
			}
			res.render('dashboard/Teacher/HomeworkManager/HomeworkCorrect', {
				student: student,
				html: html
			});
		});
	});
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
		staticdb('fcstu', 'message').insert({
			email: req.session.user.email,
			total: 0,
			notRead: [],
			AllMessage: []
		});
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
		//initialzation USERS Database
		staticdb('fcstu', 'users').insert({
			"name": name,
			"firstname": lastname,
			"email": email,
			'password': md5(stuID),
			StuID: stuID,
			"class": Class,
			'identity': 'student'
		});
		//initialzation Class Database(push up)
		staticdb('fcstu','users').findAll()
		
		//initialzation Homework Database(push up)
		
		//initialzation Message Database (insert)
		
		//initialzation studentUsually Database(insert)
		
		res.redirect('/dashboard?foward=astu&ok=1');
	}
	else {
		res.redirect('/dashboard?foward=astu&err=1');
	}
}
exports.RollCollPost = function(req, res) {
	isLogin(req, res);
	OnlyParticularPerson(req, res, 'teacher');
	var obj = req.body;
	staticdb('fcstu', 'class').findAll(function(row) {
		for (var i = 0; i < Object.keys(row['0'].rollcall).length; i++) {
			var studentName = Object.keys(row['0'].rollcall)[i];
			var student = row[Object.keys(row)].rollcall[Object.keys(row[Object.keys(row)].rollcall)[i]];
			for (var j = 0; j < Object.keys(obj).length; j++) {
				if (student.email == Object.keys(obj)[j]) {
					row[Object.keys(row)].rollcall[Object.keys(row[Object.keys(row)].rollcall)[i]].check.push(true);
					break;
				}
				if (student.email != Object.keys(obj)[j] && j == Object.keys(obj).length - 1) {
					row[Object.keys(row)].rollcall[Object.keys(row[Object.keys(row)].rollcall)[i]].check.push(false);
					break;
				}
			}
			//console.log(Object.keys(obj)[i]);
		}
		//console.log(row[Object.keys(row)].rollcall[Object.keys(row[Object.keys(row)].rollcall)[0]].check)
		row['0'].time.push(new Date());
		staticdb('fcstu', 'class').override({
			key: "class"
		}, row['0']);
		res.redirect('/dashboard');
	});
};
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
exports.AssetsManagementPost = function(req, res) {
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
exports.HomeworkCorrectGet = function(req, res) {
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	console.log(query.email);
	if (!!query.email && !!query.tag && !!query.scope && !!query.pass) {
		staticdb('fcstu', 'homeworkqus').findAll(function(row) {
			var length = row[Object.keys(row)].homework.length;
			staticdb('fcstu', 'homework').findOne({
				email: query.email
			}, function(data) {
				if (data.homework.length == length && !!data.scope[length - 1] == false) {
					data.homework.push({
						scope: query.scope,
						tag: query.tag,
						pass: query.pass
					});
					staticdb('fcstu', 'homework').override({
						email: query.email
					}, data);
					AddRead2People(req, res, query.email, {
						title: "平時作業",
						subtitle: "您的作業以批改過，" + query.scope + " 。 " + query.pass == 21 ? "不通過退回" : "已被批改接受",
						status: query.pass == 21 ? 'danger' : 'success'
					})
					res.redirect('/dashboard?foward=HC&ok=1');
				}
				else {
					res.send('<h1>這位學生已經批改過了</h1><script>alert("這位學生已經批改過了");window.location.href = "/dashboard?foward=psre&err=ps";</script>');
				}
			});
		});
	}
	else {
		console.log('資料不齊全');
	}
};