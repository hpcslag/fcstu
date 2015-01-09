var sd = require('./lib/staticdb');
var app = new sd('fcstu','users');
var md5 = require('./lib/hash');

var Class = new sd('fcstu','class');
//新增學生資料
//app.insert({"name":"Mac","firstname":"Taylor","email":"cslag@hotmail.com.tw",'StuID':'0215161078','class':'五功二甲','password':'e10adc3949ba59abbe56e057f20f883e','identity':'student'});

//新增老師資料
//app.insert({"name":"Keyboard","Lee":"Taylor","email":"cslag@hotmail.com.tw",'password':'e10adc3949ba59abbe56e057f20f883e','identity':'teacher'});

//新增班課資料
Class.insert({});

//登入測試資料
var email = "keyboard@gmail.com";
var password = "123456";

/*app.findOne({"email":email},function(data){
	if(!!data){
	    if(data.password == md5(password)){
	        console.log("ok ,"+data.identity);
	    }else{
	        console.log("username or password is fail!");
	    }
	}else{
	    console.log("username or password is fail!!");
	}
//	if(data.password == md5(password));
});*/