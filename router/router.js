var md5 = require('../lib/hash');
exports.index = function(req,res){
	if(1==1){
		//if is logined
		res.render('singin',{logined:true,name:"Mac",gravatar:'http://www.gravatar.com/avatar/'+md5("cslag@hotmail.com.tw")+'?s=200',username:"hpcslag"});
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
				res.redict('/index?error=1');
			}
		})
		*/
	}
}

exports.dashboard = function(req,res){
	//first check cookie "username". if no, check form "username" and "password". and reading
};