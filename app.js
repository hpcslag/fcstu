var express = require('express'),
	app = new express(),
	ejs = require('ejs'),
	router = require('./router');

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

app.get('/',router.index);
app.get('/ba',function(req,res){
	res.cookie('userdata',{name:"Mac",username:'hpcslag',email:'cslag@hotmail.com.tw'},{maxAge: new Date(Date.now() + 1000), httpOnly: true});
	res.redirect('/bb');
});
app.get('/bb',function(req,res){
	var data = req.cookies.userdata;
	res.send(data);
});

app.listen(process.env.PORT);
