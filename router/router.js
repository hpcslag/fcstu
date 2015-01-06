var url = require('url'),
	md5 = require('../lib/hash'),
	colors = require('colors');

exports.index = function(req,res){
	/** found get method*/
	var url_parts = url.parse(req.url, true),
		query = url_parts.query; //query username if find
	/** if want clean user cookie, clean*/
	if(query.clean == "true"){
		console.log("clean");
		res.clearCookie('userdata');
		res.redirect('/');
	}
	//如果有cookie才找username，不是本人就刪除cookie即可,資訊全部撈cookie的資料
	if(!!req.cookies.userdata){
		//if is logined
		var cookie = req.cookies.userdata;
		res.render('singin',{logined:true,name:cookie.name,gravatar:'http://www.gravatar.com/avatar/'+md5(cookie.email)+'?s=200',username:cookie.username});
	}else{
		//if never login
		res.render('singin',{logined:false});	
	}
};

function checkLogin(userName,passWord){
	if(!!req.cookies.username){
		//use req.cookie.likename login.

	}else{
		//check
		/**
		db.findOne({username:userName},function(data){
			if(data.password === password){
				logined!
			}else{
				res.redict('/?error=1');
			}
		})
		*/
	}
}

exports.dashboard = function(req,res){
	//first check cookie "username". if no, check form "username" and "password". and reading
};