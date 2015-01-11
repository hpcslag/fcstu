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
/*sd('fcstu','usually').findAll(function(row){
	var length = Object.keys(row).length-1;
	sd('fcstu','studentUsually').findAll(function(data){
		for(var i = 0;i<Object.keys(data).length;i++){
			//可批改條件 沒有分數 且 有答案，跟數量一樣
			if(!!data[i].scope[length] == false && data[i].test.length == length+1){
				console.log("電子信箱"+data[i].email+" "+data[i].name + "  實作網址: "+data[i].test[length].url + " , 回答內容: "+data[i].test[length].context);//test[0] == 考試的第幾次數
			}
		}
	});
});*/

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
/*sd('fcstu','studentUsually').findOne({email:"cslag@hotmail.com.tw"},function(row){
	var ss = row.scope;
	var now = ss[ss.length-1].scope-ss[ss.length-2].scope;
	console.log(now >= 0?"進步"+now:"退步 "+now*-1);
	//console.log("本次平時考分數: "+(!!row.scope[row.scope.length-1]?row.scope[row.scope.length-1].scope:"沒有任何考試紀錄(NaN)")+" 比上次進步: "+(!!row.scope[row.scope.length-2]?(row.scope[row.scope.length-1]-row.scope[row.scope.length-2].scope):"上次沒有成績(NaN)"));
	//console.log("上次平時考分數: "+(!!row.scope[row.scope.length-3]?row.scope[row.scope.length-3].scope:"沒有成績(NaN)")+" 比上次進步: "+(!!row.scope[row.scope.length-3]?row.scope[row.scope.length-3].scope:"上次沒有成績(NaN)"));
});*/


//回家作業新增
//sd('fcstu','homeworkqus').insert({homework:[{deadline:"2015-15",context:'<p>內容更新</p>'},{deadline:"2015-15",context:'<p>內容更新</p>'}]});


var deadline = "2/15日";
var context = "內容更新了唷";

//回家作業更新
/*sd('fcstu','homeworkqus').findOne({key:"homeworkqus"},function(row){
	//檢查有沒有填入
	row.homework.push({deadline:deadline,context:context});
	sd('fcstu','homeworkqus').override({key:"homeworkqus"},row);
});*/

//翻出本次回家作業 / 可不可以作回家作業?
/*sd('fcstu','homeworkqus').findAll(function(row){
	//console.log(row);
	//可不可以作回家作業
	if(row[Object.keys(row)].homework.length == 0){
		console.log("目前沒有作業可以做");
	}else{
		console.log("目前第幾字號題目: "+row[Object.keys(row)].homework.length);
		//找到現在這位學生有沒有做過了?
		sd('fcstu','homework').findOne({email:"cslag@hotmail.com.tw"},function(data){
			if(data.test.length<row[Object.keys(row)].homework.length){
				var homework = row[Object.keys(row)].homework[row[Object.keys(row)].homework.length-1];
				//render()
			}else{
				console.log("你已經做過這項作業了");
			}
		});
	}
});*/


//學生做作業
/*sd('fcstu','homework').findOne({email:"cslag@hotmail.com.tw"},function(row){
	//檢查有沒有填入
	row.homework.push({deadline:deadline,context:context});
	sd('fcstu','homework').override({email:"cslag@hotmail.com.tw"},row);
});*/


//老師 - 管理作業 - 顯示繳交學生
/*sd('fcstu','homeworkqus').findAll(function(row){
	var length = row[Object.keys(row)].homework.length;
	sd('fcstu','homework').findAll(function(data){
		var student = [];
		for(var i = 0;i<Object.keys(data).length;i++){
			//可批改條件 沒有分數 且 有答案，跟數量一樣
			if(data[i].homework.length == length && !!data[i].scope[length-1] == false){
				student.push(data[i]);
				console.log("這位學生可以交作業: "+data[i].name);
			}else{
				console.log("這位學生不能交作業: "+data[i].name);
			}
		}
		console.log("可批改學生:");
		console.log(student);
		//render
		//if(data.length < 0)-> 沒有學生可以批改
	});
});*/

var scope = 12;
var tag = '你還不行';
//回家作業批改
/*sd('fcstu','homeworkqus').findAll(function(row){
	var length = row[Object.keys(row)].homework.length;
	sd('fcstu','homework').findOne({email:"cslag@hotmail.com.tw"},function(data){
		if(data.homework.length == length && !!data.scope[length-1] == false){
			data.homework.push({scope:scope,tag:tag});
			sd('fcstu','homework').override({email:"cslag@hotmail.com.tw"},data);
		}else{
			console.log("這個學生已經批改過了");
		}
	});
});*/

//找到老師
sd('fcstu','users').findAll(function(data){
	console.log(data);
})






//註冊必要初始化值:

//回家作業批改與學生
//sd('fcstu','homework').insert({"email":"ted99rw@gmail.com","name":"馬修","class":"五設三甲","homework":[],"scope":[]});
