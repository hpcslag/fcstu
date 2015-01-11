var url = require('url'),
	md5 = require('../lib/hash'),
	colors = require('colors'),
	encode = require('../lib/encode'),
	staticdb = require('../lib/staticdb'),
	async = require('async'),
	fs = require('fs'),
	ManagementAPI = require('./ManagementAPI.js'),
	TeacherAPI = require('./TeacherAPI.js'),
	StudentAPI = require('./StudentAPI.js');

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
	ManagementAPI.isLogin(req, res);
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