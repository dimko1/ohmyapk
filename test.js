var test1 = require('./lib/ohmyapk');


test1('./test.apk', function(err){
	console.log(err);
});