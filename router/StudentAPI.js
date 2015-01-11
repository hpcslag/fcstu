var url = require('url'),
	md5 = require('../lib/hash'),
	colors = require('colors'),
	encode = require('../lib/encode'),
	staticdb = require('../lib/staticdb'),
	async = require('async'),
	fs = require('fs'),
	ManagementAPI = require('./ManagementAPI.js');
/**
* Student()
* : put all method in Object.
*/
exports.Student = function(){};


/**
* getStudentInfo()
* @return {Object}{name,firstname,studentId,email,class}
* 
*/
exports.getStudentInfo = function(){
    return {};
};
/**
 * Student All Page
 */
exports.Assets = function(req, res) {
	ManagementAPI.isLogin(req, res);
	res.render('dashboard/management/Assets', {});
};
exports.UsuallyTest = function(req, res) {
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'student');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'student');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'student');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'student');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'student');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'student');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'student');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'student');
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'student');
	if (!!req.body.url && !!req.body.response && !!req.body.keyword) {
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
	ManagementAPI.isLogin(req, res);
	ManagementAPI.OnlyParticularPerson(req, res, 'student');
	if (!!req.body.title && !!req.body.feedback) {
		staticdb('fcstu', 'users').findAll(function(data) {
			for (var i = 0; i < Object.keys(data).length; i++) {
				if (data[Object.keys(data)[i]].identity == 'teacher') {
					ManagementAPI.AddRead2People(req, res, data[i].email, {
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