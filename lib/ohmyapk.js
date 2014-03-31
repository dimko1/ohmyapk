var os = require('os')
   ,exec = require('child_process').execFile;

//check if current os is Windows
var isWin32 = (os.type() == "Windows_NT");

/**
 * object containing all required functionality for apk parsing
 */
var parseApk = function(filename, callback){
	return extractInformation(filename, callback);
}

/**
 * starting point of information extracting. first call aapt tool form util directory
 * @param  {string}   filename path to file
 * @param  {Function} callback function which will be called with results
 */
function extractInformation(filename, callback){
	console.log('extract information');


	//aapt tools downloaded to util folder during installation
	if (isWin32){
		var aapt_path = "/../util/aapt.exe";		
	} else {
		var aapt_path = "/../util/aapt";
	}
	console.log(aapt_path);
	//calling appt tool with path to apk file
	exec( __dirname + aapt_path, ['l','-a', filename], 
		{
			maxbuffer: 1024 * 1024
		}, 
		function(err, output){
			


			if (err) return callback(err);

			return extractInformation(output, callback);
	});
};

/**
 * extracting information received from the apk file from aapt tool
 * @param  {array}   data      list of resources returned from aapt tool
 * @param  {Function} callback function which will be called after parsing file 
 */
function extractRawInformation(data, callback){
	console.log(data);
}

module.exports = parseApk;