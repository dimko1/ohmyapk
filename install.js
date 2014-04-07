var  http = require('http')
    ,fs = require('fs')
    ,os = require('os')
    ,exec = require('child_process').exec;

var utilsFolder = __dirname + '/util/';

//check if utils folder exist
if (!fs.existSync(utilsFolder)){
    fs.mkdirSync(utilsFolder);
}

var platform = null;

//detect platform by its type. 
//this is required to donwload android tools for specific platform as well as 
//to save it as right executable
if (os.type() == 'Darwin') {
    platform = 'macosx';
} else if (os.type() == 'Linux') {
    platform = 'linux';
} else if (os.type() == 'Windows_NT'){
    platform = 'windows';
} else {
    throw new Error('Unable to detect operational systme!');
}

//attempt to download android tools
function attemptDownload() {
    //url to android tool repository
    var urlToDownload = "http://dl-ssl.google.com/android/repository/platform-tools_r16-" + platform + ".zip";
    
    var temporaryFile = "/temp/android_tools_" + (new Date().getTime()) + ".zip";

    var file = fs.createWriteStream(tempFile);
}
