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
/*sd('fcstu','class').insert(
	{"rollcall":
		{
		"游崇祐":{"class":"五工二甲","check":[true,true,false,false,true,true]},
		"劉哲銘":{"class":"夜二工三甲","check":[true,false,false,false,false,true]},
		"鄭智霖":{"class":"五媒二甲","check":[true,true,false,false,false,false]},
		"野格":{"class":"四工三甲","check":[false,false,false,false,false,true]},
		"你很邱":{"class":"四子一甲","check":[false,false,false,true,true,false]}
		}
	,"time":[new Date(),new Date(),new Date(),new Date(),new Date(),new Date(),new Date()]});
*/
//到課資料查詢
/*Class.findAll(function(data){
	for(var i =0;i<Object.keys(data).length;i++){ //這次課堂
		//console.log(data['0'].rollcall['游崇祐'].class);
		//console.log(Object.keys(data[i].rollcall)[0]);
		//console.log(data[i].rollcall['游崇祐'].check);
		console.log()
		for (var j = 0; j < Object.keys(data[i].rollcall).length; j++) { //班級人數
			var studentName = Object.keys(data[i].rollcall)[j];
			var cc = 0;
			var vclass = data[Object.keys(data)].rollcall[studentName].check;
			for(var k = 0;k<vclass.length;k++){
				if(vclass[k]){
					cc++;
				}
			}
			var inClass = 100 / (vclass.length / cc);
			console.log("學生: " +studentName+", 班級: "+data[Object.keys(data)].rollcall[studentName].class+", 本次是否到課? "+(data[Object.keys(data)].rollcall[studentName].check ? "有到課":"缺課") + ", 到課率: "+inClass);
		}
	//}
	//console.log(Object.keys(data['0'].rollcall));
	//for(var i = 0;i<Object.keys(data).length;i++){
	//	console.log("學生: ");
	}
});*/

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

//密碼修改測試
//sd('fcstu','users').update({"email":email},{"password":"fcea920f7412b5da7be0cf42b8c93759"})

//幫野格增加資料
//sd('fcstu','class').update({"name":"野格"},{"password":"fcea920f7412b5da7be0cf42b8c93759"})

//sd('fcstu','class').findAll(function(data){
	/*sd('fcstu','class').findOne({emai:(Object.keys(data)[0].rollcall) },function(one){
		console.l
	});*/
	/*var roll = data[Object.keys(data)[0]].rollcall;
	for(var i = 0;i<Object.keys(roll).length;i++){
		var name = Object.keys(roll)[i];
		//console.log(roll[name].check);
		roll[name].check.push(false);
		sd('fcstu','class').findOne(data,function(na){
			console.log(na);
		});
		//console.log(roll[name].check)
	}*/
	//console.log(data);
	//list[Object.keys(list)].rollcall[Object.keys(list[i].rollcall)[j]].check
//});



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

/*sd('fcstu','usually').findAll(function(data){
	if(!!data){
		console.log(data[Object.keys(data).length-1]);
	}else{
		console.log("沒有任何資料新增");
	}
});*/



//平時考
//插入學生考試過的資料出去
//sd('fcstu','studentUsually').insert({"email":"ted99rw@gmail.com","name":"馬修",test:[{"url":'http://google.com','context':'18 5 3 2 6 6'}],scope:[]});


/*平時考 - 學生檢查考過了沒?

sd('fcstu','studentUsually').findOne({email:"cslag@hotmail.com.tw"},function(data){
	console.log(data);
});*/


//老師 - 管理平時考 - 顯示學生
sd('fcstu','usually').findAll(function(row){
	var length = Object.keys(row).length-1;
	sd('fcstu','studentUsually').findAll(function(data){
		for(var i = 0;i<Object.keys(data).length;i++){
			//可批改條件 沒有分數 且 有答案，跟數量一樣
			if(!!data[i].scope[length] == false && data[i].test.length == length+1){
				console.log("電子信箱"+data[i].email+" "+data[i].name + "  實作網址: "+data[i].test[length].url + " , 回答內容: "+data[i].test[length].context);//test[0] == 考試的第幾次數
			}
		}
	});
});

//學生 - 想要考試
/*sd('fcstu','studentUsually').findOne({email:"ted99rw@gmail.com"},function(row){
	console.log("可不可以考這次的考試呢?");
	sd('fcstu','usually').findAll(function(data){
		var length = Object.keys(data).length;
		if(row.scope.length == length){
			console.log("你不可以考試");
		}else{
			console.log("你可以考試唷");
		}
	});
})*/
/*sd('fcstu','studentUsually').findOne({email:"cslag@hotmail.com.tw"},function(data){
	data.test.push({url:"https;fa","context":"野格"});
	sd('fcstu','studentUsually').override({email:"cslag@hotmail.com.tw"},data);
});*/
//新增考試成績
/*sd('fcstu','studentUsually').findOne({email:"cslag@hotmail.com.tw"},function(data){
	data.scope.unshift();
	sd('fcstu','studentUsually').override({email:"cslag@hotmail.com.tw"},{scope:data.scope});
});*/
//取得近期考試成績