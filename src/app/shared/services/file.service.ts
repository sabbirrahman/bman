import { Injectable } from '@angular/core';
// Services
// import { ConfigService } from './config.service';
declare let webkitRequestFileSystem: any;
declare let window: any;

@Injectable()
export class FileService {
  config = {
    type: window.TEMPORARY,
    size: 5 * 1024 * 1024, // 5 MB
  };
  constructor() { }

  // Error Handeler
  err(e) { console.log(e.message); };

	showCurrentState(folderName) {
		// webkitRequestFileSystem(this.config.type, this.config.size, function(fs) {
		// 	fs.root.getDirectory(folderName, {}, function(dirEntry){
		// 	  	var dirReader = dirEntry.createReader();
		// 	  	dirReader.readEntries(function(entries) {
		// 	    	for(var i = 0; i < entries.length; i++) {
		// 	      		var entry = entries[i];
		// 	      		if(entry.isDirectory) console.log('Directory: ' + entry.fullPath);
		// 	      		else if(entry.isFile) console.log('File: '      + entry.fullPath);
		// 	    	}
		// 	  	}, this.err);
		// 	}, this.err);
		// }, this.err);
	}

  upload(file, fileName, callback?) {
		if(file === undefined) return;
		webkitRequestFileSystem(this.config.type, this.config.size, (fs) => {
	    fs.root.getFile(fileName, { create: true }, (fileEntry) => {
        fileEntry.createWriter((fileWriter) => {
          // fileWriter.onthis.error = this.err;
          fileWriter.write(file);
          if (callback) callback();
        }, this.err);
	    }, this.err);
		}, this.err);
	}

  move(src, des, callback?) {
    webkitRequestFileSystem(this.config.type, this.config.size, (fs) => {
      fs.root.getFile(src, {}, (fileEntry) => {
        fs.root.getDirectory(des, {}, (dirEntry) => {
          fileEntry.moveTo(dirEntry);
          if (callback) callback();
        }, this.err);
      }, this.err);
    }, this.err);
  }

  getUrl(path, fileName, callback?) {
		webkitRequestFileSystem(this.config.type, this.config.size, (fs) => {
		    fs.root.getFile(path + fileName, {}, (fileEntry) => {
          if (callback) callback(fileEntry.toURL());
		    }, this.err);
		}, this.err);
	}

	writeFile() {
		// webkitRequestFileSystem(this.config.type, this.config.size, function(fs) {
		//     fs.root.getFile(fileName, { create: true }, function(fileEntry) {
		//         fileEntry.createWriter(function(fileWriter) {
    //
		//         }, this.err);
		//     }, this.err);
		// }, this.err);
	}

  deleteFile(fileName) {
		// webkitRequestFileSystem(this.config.type, this.config.size, function(fs) {
		// 	fs.root.getFile(fileName, {create: false}, function(fileEntry) {
		// 		fileEntry.remove(function() {
		// 		}, this.err);
		// 	}, this.err);
		// }, this.err);
	}

  createFolder(folderName, callback?) {
		webkitRequestFileSystem(this.config.type, this.config.size, (fs) => {
		  	fs.root.getDirectory(folderName, {create: true}, (dirEntry) => {
          if (callback) callback();
		  	}, this.err);
		}, this.err);
	}

  deleteFolderRecursively(folderName, callback?) {
		webkitRequestFileSystem(this.config.type, this.config.size, (fs) => {
		  	fs.root.getDirectory(folderName, {}, (dirEntry) => {
			    dirEntry.removeRecursively(() => {
            if (callback) callback();
			  	}, this.err);
		  	}, this.err);
		}, this.err);
	}
}
