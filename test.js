var test1 = require('./lib/ohmyapk');


test1('./test.apk', function(err, data){
	if (err) {
		return console.log(err);	
	} 

	console.log(data);
});