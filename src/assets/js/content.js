chrome.runtime.sendMessage({
    'title': document.title,
    'url'  : window.location.href,
});



// if($scope.config.orderBy && $scope.config.orderBy != 'custom' && $scope.config.orderBy != 'lastVisited'){
//     $scope.bookmarks = $filter('orderBy')($scope.bookmarks, $scope.config.orderBy).reverse();
//     if($scope.config.orderBy == 'name' || $scope.config.orderBy == 'link') $scope.bookmarks.reverse();
// }

// // For Popup
// function onPageDetailsReceived(pageDetails)  {
//     $scope.bookmark.name = pageDetails.title;
//     $scope.bookmark.link = pageDetails.url;
// }

// window.addEventListener('load', function(evt) {
//     chrome.runtime.getBackgroundPage(function(eventPage) {
//         eventPage.getPageDetails(onPageDetailsReceived);
//     });
// });