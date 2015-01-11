var url = require('url'),
	md5 = require('../lib/hash'),
	colors = require('colors'),
	encode = require('../lib/encode'),
	staticdb = require('../lib/staticdb'),
	async = require('async'),
	fs = require('fs'),
	ManagementAPI = require('./ManagementAPI.js');
/**
 * Teacher All Page
 */
exports.AddStudent = function(req, res) {
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
	if (ManagementAPI.isLogin(req, res))
		res.render('dashboard/Teacher/StudentManager/AddStudent', {
			html: html
		});
};
exports.ModifyStudent = function(req, res) {
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/StudentManager/ModifyStudent', {});
};
exports.StudentManagement = function(req, res) {
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
	if (ManagementAPI.isLogin(req, res)) {
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
	if (ManagementAPI.isLogin(req, res))
		res.render('dashboard/Teacher/UsuallyTestManager/AddUsuallyTest', {
			html: html
		});
};
exports.UsuallyTestCorrect = function(req, res) {
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
						ManagementAPI.AddRead2People(req, res, query.email, {
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
	if (ManagementAPI.isLogin(req, res)) {
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
	res.render('dashboard/Teacher/HomeworkManager/HomeworkUpdate', {});
};

/**
 * Feature POST
 *
 */
exports.AddStudentPost = function(req, res) {
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
		staticdb('fcstu','class').findAll(function(row){
			row['0'].rollcall[lastname+name] = {"email":email,"class":Class,"check":[]};
			console.log(row['0']);
			staticdb('fcstu','class').override({key:'class'},row['0']);
		});
		
		//initialzation Homework Database(push up)
		staticdb('fcstu','homework').insert({"email":email,"name":lastname+name,"class":Class,"homework":[],"scope":[]});
		//initialzation Message Database (insert)
		staticdb('fcstu','message').insert({"email":email,"notRead":[],"AllMessage":[]});
		//initialzation studentUsually Database(insert)
		staticdb('fcstu','studentUsually').insert({"email":email,"class":Class,"name":lastname+name,"test":[],"scope":[]});
		
		res.redirect('/dashboard?foward=astu&ok=1');
	}
	else {
		res.redirect('/dashboard?foward=astu&err=1');
	}
}
exports.RollCollPost = function(req, res) {
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'teacher');
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
					ManagementAPI.AddRead2People(req, res, query.email, {
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