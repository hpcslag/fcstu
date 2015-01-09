var sd = require('./lib/staticdb');
var app = sd('fcstu','users');
var md5 = require('./lib/hash');
var Class = sd('fcstu','class');

//新增學生資料
//app.insert({"name":"Mac","firstname":"Taylor","email":"cslag@hotmail.com.tw",'StuID':'0215161078','class':'五功二甲','password':'e10adc3949ba59abbe56e057f20f883e','identity':'student'});
//app.insert({"name":"智霖","firstname":"鄭","email":"love@gmail.com",'StuID':'0215161071','class':'五媒二甲','password':'e10adc3949ba59abbe56e057f20f883e','identity':'student'});

//新增老師資料
//app.insert({"name":"Keyboard","Lee":"Taylor","email":"cslag@hotmail.com.tw",'password':'e10adc3949ba59abbe56e057f20f883e','identity':'teacher'});

//新增班課資料
/*Class.insert(
	{"rollcall":
		{
		"游崇祐":{"class":"五工二甲","check":[true,true,false,false,true,true]},
		"劉哲銘":{"class":"夜二工三甲","check":[true,false,false,false,false,true]}
		}
	,"time":new Date()});
*/
//到課資料查詢
Class.findAll(function(data){
	for(var i =0;i<Object.keys(data).length;i++){ //這次課堂
		console.log(data['0'].rollcall['游崇祐'].class);
		console.log(Object.keys(data[i].rollcall)[0]);
		console.log(data[i].rollcall['游崇祐'].check);
		console.log()
		for (var j = 0; j < Object.keys(data[i].rollcall).length; j++) { //班級人數
			var studentName = Object.keys(data[i].rollcall)[j];
			
			console.log("學生: " +studentName+", 班級: "+data[Object.keys(data)].rollcall[studentName].class+", 本次是否到課? "+(data[Object.keys(data)].rollcall[studentName].check ? "有到課":"缺課"));
		}
	//}
	//console.log(Object.keys(data['0'].rollcall));
	//for(var i = 0;i<Object.keys(data).length;i++){
	//	console.log("學生: ");
	}
});

//登入測試資料
var email = "keyboard@gmail.com";
var password = "123456";
/*
app.findOne({"email":email},function(data){
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

/*
function setup(relpath){
	return {call:function(){ console.log(relpath) }};
}

function test(){}
test.prototype.set = function(vars){ };

test.prototype.call = function(vars){console.log(vars)};

var a = setup('aa');
a.call();
var b = setup('b');
b.call();
a.call();
*/