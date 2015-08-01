angular
	.module('FileService', [])
	.factory('File', function($timeout){
		// Configuration:
		var config = {
			type: window.TEMPORARY,
			size: 5 * 1024 * 1024, // 5 MB
		};
		// Error Handeler
	    var err = function(e) { console.log(e.message); };
		// Service Object
		return {
			showCurrentState: function(folderName) {
				webkitRequestFileSystem(config.type, config.size, function(fs) {
					fs.root.getDirectory(folderName, {}, function(dirEntry){
					  	var dirReader = dirEntry.createReader();
					  	dirReader.readEntries(function(entries) {
					    	for(var i = 0; i < entries.length; i++) {
					      		var entry = entries[i];
					      		if(entry.isDirectory) console.log('Directory: ' + entry.fullPath);
					      		else if(entry.isFile) console.log('File: '      + entry.fullPath);
					    	}
					  	}, err);
					}, err);
				}, err);
			},
			uploadFile : function(file, fileName) {
				if(file == undefined) return;
				webkitRequestFileSystem(config.type, config.size, function(fs) {
				    fs.root.getFile(fileName, { create: true }, function(fileEntry) {
				        fileEntry.createWriter(function(fileWriter) {
		                    fileWriter.onerror = err;
	                        fileWriter.write(file);
				        }, err);
				    }, err);
				}, err);
			},
			readFile: function() {
				
			},
			writeFile: function() {
				webkitRequestFileSystem(config.type, config.size, function(fs) {
				    fs.root.getFile(fileName, { create: true }, function(fileEntry) {
				        fileEntry.createWriter(function(fileWriter) {
							
				        }, err);
				    }, err);
				}, err);
			},
			deleteFile : function(fileName) {
				webkitRequestFileSystem(config.type, config.size, function(fs) {
					fs.root.getFile(fileName, {create: false}, function(fileEntry) {
						fileEntry.remove(function() {
						}, err);
					}, err);
				}, err);
			},
			setURL: function(path, fileName) {
				webkitRequestFileSystem(config.type, config.size, function(fs) {
				    fs.root.getFile(path + fileName, {}, function(fileEntry) {
				    	document.getElementById(fileName).src = fileEntry.toURL();
				    }, err);
				}, err);
			},
			getURL: function(fileName) {
				return document.getElementById(fileName).src;
			},
			createFolder: function(folderName) {
				webkitRequestFileSystem(config.type, config.size, function(fs) {
				  	fs.root.getDirectory(folderName, {create: true}, function(dirEntry) {
				  	}, err);
				}, err);
			},
			deleteFolderRecursively: function(folderName) {
				webkitRequestFileSystem(config.type, config.size, function(fs) {
				  	fs.root.getDirectory(folderName, {}, function(dirEntry) {
					    dirEntry.removeRecursively(function() {
					  	}, err);
				  	}, err);
				}, err);
			},
			moveFile: function(src, des) {
				webkitRequestFileSystem(config.type, config.size, function(fs) {
					fs.root.getFile(src, {}, function(fileEntry) {
						fs.root.getDirectory(des, {}, function(dirEntry) {
							fileEntry.moveTo(dirEntry);
						}, err);
					}, err);
				}, err);
			}
		};
	});