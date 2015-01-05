var sd = require('./lib/static_database');
var app = new sd('fcstu','play');

app.insert({"name":"MacTaylor"});

app.findOne({"name":"MacTaylor"},function(data){
	console.log(data);
});