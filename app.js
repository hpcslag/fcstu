var express = require('express'),
	app = new express(),
	ejs = require('ejs'),
	router = require('./router'),
	md5 = require('./lib/hash');

app.configure(function(){
	app.use(express.static(__dirname+'/www'));
	app.use(express.cookieParser());
	app.use(express.session({secret:'MD5HeapMap'}));
	/**
	*Long Alive Server session
	
	app.use(express.cookieSession({
		key:'cookie',
		secret:'https://www.youtube.com/watch?v=SR6iYWJxHqs'
	}));*/
	app.use(express.bodyParser()); //open GER,POST body parser
	app.set('views',__dirname+'/www'); //views engine path
	app.set('view engine','ejs');
	app.use(app.router);//open router
});

app.get('/',function(req,res){
	if(1==1){
		//if is logined
		res.render('singin',{logined:true,username:"Mac",gravatar:'http://www.gravatar.com/avatar/'+md5("cslag@hotmail.com.tw")+'?s=200'});
	}else{
		//if never login
		res.render('singin',{logined:false});	
	}
	
});

app.listen(5555);
