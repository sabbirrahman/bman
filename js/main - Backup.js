var generateRandomString = function(length) {
    var randomStr;
    do { randomStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, length); } while(randomStr.length != length);
    return randomStr;
}
angular
	.module("B-Man", [  'ngRoute',
						'angularFileUpload',
						'FileService',
						'ColorService'])
    .config(function($routeProvider, $compileProvider){
        // Routes:
        $routeProvider
            .when("/folder/:folderId?", { templateUrl: "view.html"      , controller: "MainView"  } )
            .when("/add",               { templateUrl: "add.html"       , controller: "Add"       } )
            .when("/edit/:index",       { templateUrl: "edit.html"      , controller: "Edit"      } )
            .when("/settings",          { templateUrl: "settings.html"  , controller: "Settings"  } );
        // For Allowing Images & Links in Chrome Apps
        $compileProvider
            .imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension|filesystem:chrome-extension|):|data:image\//)
            .aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|chrome-extension|chrome):/);
    })


    // Main Contoller:
	.controller("Bookmarks", function($scope, $http, $timeout, $filter, File){
        $scope.bookmarks = {};
        $scope.bookmark  = {};
        $scope.config    = {};

        // Fetching Configurations:
        if(localStorage.config == undefined){
            $http.get("/js/config.json").success(function(data, status, headers, config){
                    $scope.config = data;
                    localStorage.config = angular.toJson(data);
            })
        } else { $scope.config = angular.fromJson(localStorage.config); }
        
        // Fetching Bookmarks:
        if(localStorage.bookmarks == undefined){
        	$http.get("/js/bookmarks.json").success(function(data, status, headers, config){
					$scope.bookmarks = data;
            		localStorage.bookmarks = angular.toJson(data);
			})
        } else { $scope.bookmarks = angular.fromJson(localStorage.bookmarks); }
        
        // Creating Image Folder:
        if(localStorage.imgFolder == undefined){
        	File.createFolder("img");
        	localStorage.imgFolder = true;
        }

        // Filter:
        if($scope.config.orderBy && $scope.config.orderBy != 'custom' && $scope.config.orderBy != 'lastVisited'){
            $scope.bookmarks = $filter('orderBy')($scope.bookmarks, $scope.config.orderBy).reverse();
            if($scope.config.orderBy == 'name' || $scope.config.orderBy == 'link') $scope.bookmarks.reverse();
        }

        $scope.colorMaker = function(rgb, a){ return 'rgba(' + rgb + ',' + a + ')'; }
        // Validator:
        Validate = {
            type: function(file, validTypes){
                for(var i=0; i<validTypes.length; i++) if(file.type == validTypes[i]) return true;
                return false;
            },
            size: function(file, size){
                return !(file.size > (size*1024));
            }
        }
	})


    // Main View Controller:
    .controller("MainView", function($scope, $location, $routeParams, $timeout){
        $scope.parentId = $routeParams.folderId? $routeParams.folderId : "";
        $scope.parentEl = $scope.bookmarks.filter(function(obj){
            return obj.id == $scope.parentId;
        })[0];

        // Drag & Drop and Link Actions:
        var srcE = null;
        var handleDragStart = function() { if(!this.dataset.up) srcE = this; }
        var handleDragOver  = function(e) {
            if(!srcE) return;
            if(e.preventDefault)  { e.preventDefault() ; }
            if(e.stopPropagation) { e.stopPropagation(); }
            if($scope.config.orderBy != 'custom') return;
            if(srcE == this) return;
            if(this.dataset.up) return;
            var srcIndex = parseInt(srcE.dataset.id);
            var desIndex = parseInt(this.dataset.id);
            var srcEl    = $scope.bookmarks[srcIndex];
            var desEl    = $scope.bookmarks[desIndex];
            if(desEl.type == 'folder' && $scope.config.editMode) return;
            $scope.bookmarks.splice(srcIndex, 1);
            $scope.bookmarks.splice(desIndex, 0, srcEl);
            $scope.$apply();
            localStorage.bookmarks = angular.toJson($scope.bookmarks);
            return false;
        }
        var handleDrop = function(){
            if(!srcE) return;
            if(!$scope.config.editMode) return;
            if(srcE == this) return;
            var srcIndex = parseInt(srcE.dataset.id);
            if(this.dataset.up){
                $scope.bookmarks[srcIndex].parentId = this.dataset.parentid;
                $scope.$apply();
                localStorage.bookmarks = angular.toJson($scope.bookmarks);
                return;
            }
            var desIndex = parseInt(this.dataset.id);
            var desEl    = $scope.bookmarks[desIndex];
            if(desEl.type != 'folder') return;
            $scope.bookmarks[srcIndex].parentId = desEl.id;
            $scope.$apply();
            localStorage.bookmarks = angular.toJson($scope.bookmarks);
            return false;
        }
        var handleLinkClick = function() {
            if($scope.config.orderBy != 'lastVisited') return;
            var index = parseInt(this.dataset.id);
            var data  = $scope.bookmarks[index];
            if(data.type == 'folder') return;
            $scope.bookmarks.splice(index, 1);
            $scope.bookmarks.splice(0, 0, data);
            localStorage.bookmarks = angular.toJson($scope.bookmarks);
        }
        $timeout(function(){
            var dragableItems = document.querySelectorAll('.dragableItem');
            [].forEach.call(dragableItems, function(dragableItem) {
                dragableItem.addEventListener('dragstart', handleDragStart, false);
                dragableItem.addEventListener('dragover' , handleDragOver , false);
                dragableItem.addEventListener('drop'     , handleDrop     , false);
            });
            var links = document.querySelectorAll('.link');
            [].forEach.call(links, function(link) { link.addEventListener('click', handleLinkClick, false); });
        }, 500);
    })

    // Add Controller:
    .controller("Add", function($scope, $timeout, $location, File, Color){
        $scope.bookmark = {
            id       : generateRandomString(8),
            name     : '',
            img      : 'img/asdjklha0.png',
            rgb      : '119, 119, 119',
            a        : 0.75,
            ext      : '.png',
            type     : 'bookmark',
            parentId : ''
        };
        $scope.createFolder = false;
        $scope.folders = $scope.bookmarks.filter(function(obj){ return obj.type == 'folder'; });
        $timeout(function(){ Color.showImg($scope.bookmark.id + $scope.bookmark.ext, 'canvas1', 100, 100, true); }, 100);
        $scope.add = function(){
            if($scope.bookmark.img != "img/asdjklha0.png" && $scope.bookmark.img != "img/alsdhlas0.png"){
                var fileName = $scope.bookmark.id + $scope.bookmark.ext;
                File.moveFile("temp/" + fileName, "img/");
                $timeout(function(){ $scope.bookmark.img  = $scope.bookmark.img.replace("/temp/", "/img/"); }, 50);
            }
            $scope.bookmark.date = new Date();
            $timeout(function(){
                $scope.bookmarks.push($scope.bookmark);
                localStorage.bookmarks = angular.toJson($scope.bookmarks);
                $location.path('folder/' + $scope.bookmark.parentId).replace();
            }, 100);
        }
        $scope.changeEntryType = function(){
            $scope.createFolder = $scope.createFolder ? false : true;
            if($scope.createFolder){
                $scope.bookmark.type = 'folder';
                $scope.bookmark.link = '#/folder/' + $scope.bookmark.id;
                if($scope.bookmark.img == "img/asdjklha0.png"){
                    $scope.bookmark.img  = 'img/alsdhlas0.png',
                    $timeout(function(){ Color.showImg($scope.bookmark.id + $scope.bookmark.ext, 'canvas1', 100, 100, true); }, 100);
                }
            } else {
                $scope.bookmark.type = 'bookmark';
                $scope.bookmark.link = '';
                if($scope.bookmark.img == "img/alsdhlas0.png"){
                    $scope.bookmark.img  = 'img/asdjklha0.png',
                    $timeout(function(){ Color.showImg($scope.bookmark.id + $scope.bookmark.ext, 'canvas1', 100, 100, true); }, 100);
                }
            }
        }
    })


    // Edit Controler:
    .controller("Edit", function($scope, $routeParams, $location, $timeout, File, Color){
        $scope.bookmark = $scope.bookmarks[$routeParams.index];
        $scope.index = $routeParams.index;
        $scope.folders = $scope.bookmarks.filter(function(obj){ return obj.type == 'folder'; });
        $timeout(function(){ Color.showImg($scope.bookmarks[$scope.index].id + $scope.bookmark.ext, 'canvas1', 100, 100, true); }, 100);
        $scope.edit = function(files){
            if(files) {
                File.moveFile("temp/" + $scope.bookmark.id + $scope.bookmark.ext, "img/");
                $timeout(function() { $scope.bookmark.img = $scope.bookmark.img.replace("/temp/", "/img/"); }, 50);
            }
            $timeout(function(){
                $scope.bookmarks[$scope.index] = $scope.bookmark;
                localStorage.bookmarks = angular.toJson($scope.bookmarks);
                $location.path("folder/" + $scope.bookmark.parentId).replace;
            }, 100);
        }
    })


    // Settings Controller:
    .controller("Settings", function($scope, $http, $timeout, $location, $filter, File){
        // Export Bookmarks & Configuration:
        $scope.export = function(){
            var zip = new JSZip();
            zip.file("bookmarks.json", localStorage.bookmarks);
            zip.file("config.json"   , localStorage.config   );
            var img = zip.folder("img");
            var httpConfig = { url: "", method: 'GET', responseType: 'arraybuffer' }
            for(var i=0; i<$scope.bookmarks.length; i++){
                httpConfig.url = $scope.bookmarks[i].img;
                if(httpConfig.url.match(/^(img\/)/)) continue;
                $http(httpConfig)
                    .success(function(data, status, headers, config){
                        var fileName = config.url.substr(config.url.length-12, config.url.length);
                        img.file(fileName, data, {binary: true});
                    });
            }
            httpConfig.url = $scope.config.wallpaper.link;
            if(!httpConfig.url.match(/^(img\/)/)){
                $http(httpConfig)
                    .success(function(data, status, headers, config){
                        var fileName = config.url.substr(config.url.length-12, config.url.length);
                        img.file(fileName, data, {binary: true});
                    });
            }
            var save = function(){
                var content = zip.generate({type:"blob"});
                saveAs(content, "b-man.backup");
            }
            $timeout(save, 1000);
        }

        // Import Bookmarks & Configuration:
        $scope.import = function(){
            if(!$scope.backup) return;
            if(!$scope.backup[0].name.match(/(backup)$/)){
                $scope.errMsg = "Invalid Backup File!";
                $timeout(function() {$scope.errMsg = "" }, 2000);
                return;
            };
            var fr = new FileReader();
            fr.onloadend = function(){
                var zip = new JSZip(fr.result);
                // Configs
                var newConf = angular.fromJson(zip.file("config.json").asText());
                if(!newConf.wallpaper.link.match(/^(img\/)/)){
                    if(!$scope.config.wallpaper.link.match(/^(img\/)/))
                        File.deleteFile("img/" + $scope.config.wallpaper.name + '.jpg');
                    var fileName = newConf.wallpaper.name + '.jpg';
                    var blob = new Blob([zip.file('img/' + fileName).asArrayBuffer()]);
                    File.uploadFile(blob, fileName);
                    File.moveFile(fileName, "img/");
                }
                $scope.config = newConf;
                localStorage.config = angular.toJson(newConf);
                // Bookmarks
                var newBookmarks = angular.fromJson(zip.file("bookmarks.json").asText());
                for(var i=0; i<newBookmarks.length; i++){
                    var result = $scope.bookmarks.filter(function(obj) {
                        return obj.link == newBookmarks[i].link;
                    });
                    if(result.length < 1){
                        $scope.bookmarks.push(newBookmarks[i]);
                        $scope.bookmark = newBookmarks[i];
                        if(!$scope.bookmark.img.match(/^(img\/)/)) {
                            var fileName = $scope.bookmark.id + $scope.bookmark.ext;
                            var blob = new Blob([zip.file('img/' + fileName).asArrayBuffer()]);
                            File.uploadFile(blob, fileName);
                            File.moveFile(fileName, "img/");
                        }
                    }
                }
                localStorage.bookmarks = angular.toJson($scope.bookmarks);
            }
            fr.readAsArrayBuffer($scope.backup[0]);
            $timeout(function(){ window.location.reload(); }, 1000);
        }

        // Import Bookmarks from Chrome
        $scope.importFromChrome = function(){
        	$scope.bookmark = { ext : ".png", a: 0.75 };
            var rgb = ['119, 119, 119', '175, 200, 238', '213, 244, 226'];
            var str = "[";
            var counterB = 0;
            var counterF = 0
            var getBookmarks = function(bookmarks, parentId){
                for(var i=0; i<bookmarks.length; i++){
                    $scope.bookmark.id       = generateRandomString(8);
                    $scope.bookmark.name     = bookmarks[i].title;
                    $scope.bookmark.parentId = parentId;
                    $scope.bookmark.date  = new Date();
                    if(bookmarks[i].url){
                        $scope.bookmark.link     = bookmarks[i].url;
                        $scope.bookmark.rgb      = rgb[counterB];
                        $scope.bookmark.img      = 'img/asdjklha' + counterB + '.png';
                        $scope.bookmark.type     = "bookmark";
                        str += angular.toJson($scope.bookmark) + ",";
                        counterB = (counterB == 2)? 0 : ++counterB;
                    }
                    else if(bookmarks[i].children){
                        $scope.bookmark.link     = '#/folder/' + $scope.bookmark.id;
                        $scope.bookmark.rgb      = rgb[counterF];
                        $scope.bookmark.img      = 'img/alsdhlas' + counterF + '.png';
                        $scope.bookmark.type     = "folder";
                        str += angular.toJson($scope.bookmark) + ",";
                        counterF = (counterF == 2)? 0 : ++counterF;
                        getBookmarks(bookmarks[i].children, $scope.bookmark.id || '');
                    }
                }
            }
			chrome.bookmarks.getTree(function(result){
				getBookmarks(result[0].children, '');
                str = str.substr(0, str.length-1) + "]";
                var newBookmarks = angular.fromJson(str);
                for(var i=0; i<newBookmarks.length; i++){
                    var result = $scope.bookmarks.filter(function(obj) {
                        return obj.link == newBookmarks[i].link || (obj.type == 'folder' && obj.name == newBookmarks[i].name);
                    });
                    if(result.length < 1) $scope.bookmarks.push(newBookmarks[i]);
                }
                localStorage.bookmarks = angular.toJson($scope.bookmarks);
			});
            $timeout(function(){ window.location = "/index.html#/folder"; }, 1000);
        }

        // Wallpaper Upload:
        $scope.changeWallpaper = function(){
            if(!$scope.wallpaper) return;
            var f = $scope.wallpaper[0];
            if(!Validate.type(f, ['image/jpeg'])){
                $scope.errMsg = "Only jpg Images Please!";
                $timeout(function() {$scope.errMsg = "" }, 2000);
                return;
            }
            if(!Validate.size(f, 1024)){
                $scope.errMsg = "Too Large! Maximum 1 MB (1024 KB).";
                $timeout(function() {$scope.errMsg = "" }, 2000);
                return;
            }
            if(!$scope.config.wallpaper.link.match(/^(img\/)/))
                File.deleteFile("img/" + $scope.config.wallpaper.name + '.jpg');
            $scope.config.wallpaper.name = generateRandomString(8);
            var fileName = $scope.config.wallpaper.name + '.jpg';
            $timeout(function(){ File.uploadFile(f, fileName);                          }, 100);
            $timeout(function(){ File.moveFile(fileName, "img/");                       }, 150);
            $timeout(function(){ File.setURL("img/", fileName);                         }, 200);
            $timeout(function(){ $scope.config.wallpaper.link = File.getURL(fileName);  }, 250);
            $timeout(function(){ localStorage.config = angular.toJson($scope.config);   }, 300);
        }

        // Pattern as Wallpaper
        $scope.setPatterAsWallpaper = function(index){
            $scope.config.wallpaper.name = 'xiawhraw' + index;
            $scope.config.wallpaper.link = 'img/xiawhraw' + index + '.png';
            $scope.config.wallpaper.type = 'repeat';
            localStorage.config = angular.toJson($scope.config);
        }

        // Set Wallpaper Type
        $scope.setWallpaperType = function(){
            localStorage.config = angular.toJson($scope.config);
        }

        // Order By:
        $scope.setOrderBy = function(){
            localStorage.config = angular.toJson($scope.config);
            if($scope.config.orderBy != 'custom' && $scope.config.orderBy != 'lastVisited') {
                window.location.reload();
            }
            $location.path("folder");
        }

        // Shape Shifter:
        $scope.changeShape = function(shape){
            $scope.config.shape = shape;
            localStorage.config = angular.toJson($scope.config);
            $location.path("folder");
        }

        // Restore All Default Settings
        $scope.restoreDefaults = function(){
            if(!$scope.config.wallpaper.link.match(/^(img\/)/))
                File.deleteFile("img/" + $scope.config.wallpaper.name + '.jpg');
            $scope.config.editMode = false;
            $scope.config.orderBy  = "custom";
            $scope.config.shape    = "rectangle";
            $scope.config.wallpaper.name = "xiawhraw";
            $scope.config.wallpaper.link = "img/xiawhraw.jpg";
            $scope.config.wallpaper.type = "repeat";
            localStorage.config = angular.toJson($scope.config);
        }
    })
    

    // Buttons Controller:
    .controller("Buttons", function($scope, $location, File){
        $scope.gotoHome = function($event){
            if($event.srcElement == document.getElementsByClassName('view')[0])
                $location.path('folder');
        }
        $scope.gotoAddPage  = function(){
            $location.path('add');
        }
        $scope.gotoSettings = function(){
            $location.path('settings');
        }
        $scope.toggleEditMode = function(){
            $scope.config.editMode = $scope.config.editMode? false : true;
            localStorage.config = angular.toJson($scope.config);
        }
        $scope.gotoEditMenu = function(index){
            $location.path('edit/' + index);
        }
        $scope.delete = function(index){
            $scope.bookmark = $scope.bookmarks[index];
            if($scope.bookmark.type == 'folder'){
                for(var i=0; i<$scope.bookmarks.length; i++){
                    if($scope.bookmarks[i].parentId == $scope.bookmark.id){
                        $scope.bookmarks[i].parentId = $scope.bookmark.parentId;
                    }
                }
            }
            if(!$scope.bookmark.img.match(/^(img\/)/))
                File.deleteFile("img/" + $scope.bookmarks[index].id + $scope.bookmarks[index].ext);
            $scope.bookmarks.splice(index, 1);
            localStorage.bookmarks = angular.toJson($scope.bookmarks);
        }
    })


    // Form Controller:
    .controller("Form", function($scope, $timeout, File, Color){
        $scope.opacity = $scope.bookmark.a * 100;
        $scope.fixLink = function(){
            if(!$scope.bookmark.link) return;
            if(!$scope.bookmark.link.match(/^http/)) $scope.bookmark.link = 'http://' + $scope.bookmark.link;
        }
        $scope.upload = function(){
            if(!$scope.files) return;
            var f = $scope.files[0];
            if(!Validate.type(f, ['image/png', 'image/jpeg'])){
                $scope.errMsg = "Invalid Image Type";
                $timeout(function() {$scope.errMsg = "" }, 2000);
                return;
            }
            if(!Validate.size(f, 256)){
                $scope.errMsg = "Too Large! Maximum 256 KB.";
                $timeout(function() {$scope.errMsg = "" }, 2000);
                return;
            }
            $scope.bookmark.id  = generateRandomString(8);
            $scope.bookmark.ext = (f.type == 'image/jpeg')? '.jpg' : '.png';
            var fileName = $scope.bookmark.id + $scope.bookmark.ext;
            if(localStorage.tempFolder != undefined) { File.deleteFolderRecursively("temp"); }
            localStorage.tempFolder = true;
            $timeout(function(){ File.createFolder("temp");                    }, 100);
        	$timeout(function(){ File.uploadFile(f, fileName);                 }, 150);
            $timeout(function(){ File.moveFile(fileName, "temp/");             }, 200);
        	$timeout(function(){ File.setURL("temp/", fileName);               }, 250);
        	$timeout(function(){ $scope.bookmark.img = File.getURL(fileName);  }, 300);
            $timeout(function(){ Color.showImg(fileName, 'canvas1', 100, 100); }, 350);
        }
        $scope.changeColorOption = function(){
            var offsetTop = (window.innerWidth <= 480)? 100 : 50;
            $scope.pickColor = function($event, canvasId){
                if((canvasId == 'canvas1' && $scope.colorOption == 'C') || $scope.colorOption == 'A') return;
                var c = Color.pickColorFromImg($event, canvasId, 0, offsetTop);
                $scope.bookmark.rgb = c.r + ', ' + c.g + ', ' + c.b;
            }
        	switch($scope.colorOption){
        		case 'A': $scope.bookmark.rgb = Color.autoDetectColor($scope.bookmark.id + $scope.bookmark.ext); break;
        		case 'C': Color.showImg("colorWheel", "canvas2", 200, 200); break;
        	}
        }
        $scope.setOpacity = function(){ $scope.bookmark.a = $scope.opacity/100; }
    });
// C:\Users\Adhar\AppData\Local\Google\Chrome\User Data\Default\File System