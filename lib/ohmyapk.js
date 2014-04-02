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

			return extractManifestInformation(output, callback);
	});
};

/**
 * some of the stirng in manifest will be returned with 'RAW(smth)' text
 * current function extracts this information and returns correct string
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
function excludeRaw(string) {
	//1. extract only part of the string before 'Raw'
	//2. remove first symbol of '"' in the beginning of the string
	return string.substring(1, string.indexOf('" (Raw: "'));
};

/**
 * extracting information received from the apk file from aapt tool
 * @param  {array}   data      list of resources returned from aapt tool
 * @param  {Function} callback function which will be called after parsing file 
 */
function extractManifestInformation(data, callback){
	
	if (!data){
		return callback('No data received from APK.')
	}

	var lines = data.split('\n');

	var lineNumber = getAndroidManifestLineNumber(lines);

	var stack = [{}];

	var working_element = {};

	if (lineNumber < 0 ){
		return callback('No manifest line number found');
	}

	lineNumber++;

	for (var i = lineNumber; i < lines.length; i++){
		//read current line
		var line = lines[i];


		matches = line.match(/( +)(A|E): ([\w:\-]+)(.*)/);
		if (!matches){
			console.log('Unparsable line in manifest:', line);
			continue;
		}

		var input = matches[0], 
			//indent is used to find element parents or childs
			//like:
			//  E: uses-permission (line=33)
			//    A: android:name(0x01010003)="com.google.android.c2dm.permission.RECEIVE" (Raw: "com.google.android.c2dm.permission.RECEIVE")
			//which is show that 'E' element is a parent for 'A' element. 
			//difference between parent and child is two symbols
			indent = matches[1], 
			//get the type of the element
			type = matches[2], 
			//name of the element
			name = matches[3], 
			//rest of the string. in most cases value of the element is stored here.
			rest = matches[4];

		//well this is xml, so we need to build depth.
		var depth = indent.length / 2;
		var parent = stack[depth - 1];
		
		//finding parent element
		var parent = stack[depth - 1];
		
		//ok, we've spoted element object
		if (type == 'E'){

			var element = {};

			//removing not required elements
			while(stack.length > depth){
				stack.pop();
			}

			//add element
			if (stack.length == depth){
				stack.push(element);
			}
			
			//if there is no such element yet, just add it
			if (!parent[name]) {
				parent[name] = [];
			}

			//adding same element to parent, so when element will be added to tree-  
		    parent[name].push(element);
		} else if (type == 'A') {
			//refactor this. parsing taking from apk-parser file
			var value = null;
				
			if (rest.substring(0, 2) === '="') {
				value = excludeRaw(rest.substring(1));
			} else if (rest.substring(0, 12) === '=(type 0x12)') {
				value = rest[14] === '1';
			} else {
				parts = rest.match(/^\(0x[0-9a-f]+\)\=(.*)$/);
				if (!parts) {
				  return cb(new Error('Cannot parse value: ' + rest));
				}
				if (parts[1][0] === '"') {
				  value = excludeRaw(parts[1]);
				} else {
				  if (parts[1].substring(0, 11) === '(type 0x10)') {
				    value = parseInt(parts[1].substring(13), 16);
				  } else {
				    value = parts[1];
				  }
				}
	      	}
			parent['@' + name] = value;
	    }
	    console.log(line);
	}


	//console.log(parent);
}

/**
 * search for line number where android data starts
 * @param  {array} lines content of the data returned from aapt tool
 */
function getAndroidManifestLineNumber(lines){

	for (var i = 0; i < lines.length; i++){
		//read current line
		var line = lines[i];

		//check if we found line from which manifest description started
		if (line.trim() == 'Android manifest:'){
			return i;
		}
	}

	return -1;
}

module.exports = parseApk;