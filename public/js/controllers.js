function AlbumListCtrl($scope, $http) {
  $http.get(window.server_path + "/artists").success(function(data) {

    var model = [];
    var keys = Object.keys(data);

    var artists = _.map(keys, function(key){
      return {
        "name": key,
        "albums": _.map(data[key], function(album) {
          return {"name": album};
        })
      };
    });

    $scope.artists = artists;
  });

  $scope.selectAlbum = function(album) {
    $http.get(window.server_path + "/browse/*/" + album).success(function(data) {
      $("#start-id").val(data[0]["id"]);
    });
  }
}