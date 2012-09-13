// controller for tabbed nav
function NavigationCtrl($scope, $playlist) {
  var self = this;

  $scope.url = '';                  // where the browse tab should link to
  $scope.currentNav = 'browse';     // which button should be hilighted
  $scope.playlist = $playlist;      // playlist service for view


  // controllers wishing to change the nav broadcast on $rootScope
  $scope.$on('navChanged', function(e, o) {
    if ( o.url ) { $scope.url = o.url; }
    if ( o.section ) { $scope.currentNav = o.section };
  });

  // use in the template to determine if section is active
  $scope.getClass = function(name) {
    return name == $scope.currentNav ? 'active' : ''
  };
}

// controller for player at top of page
function PlayerCtrl($scope, $player, $playlist, $rootScope) {
  $scope.rootScope = $rootScope;
  $scope.player = $player;
  $scope.playlist = $playlist;

  // used to set the proper icon
  $scope.getPlayString = function() {
    return $player.paused ? 'play' : 'pause';
  };
}

// controller for playlist tab
function PlaylistCtrl($rootScope, $scope, $http, $playlist) {
  $scope.playlist = $playlist;     // expose the playlist service to the view

  // indicate to navigation controller where we are
  $rootScope.$broadcast('navChanged', {section: 'playlist'});

}

// controller for left pane artist -> album list
function ArtistListCtrl($scope, $http, $routeParams, $rootScope) {

  $scope.rootScope = $rootScope;

  // handle highlighting logic. if viewing an album,
  // only highlight the album and not the artist.
  $scope.getClass = function(name, isAlbum) {
    if ($routeParams.album) {
      if ( isAlbum ) {
        return $routeParams.album == name ? 'active': '';
      } else {
        return '';
      }
    } else if ($routeParams.artist && !isAlbum) {
      return $routeParams.artist == name ? 'active' : '';
    }
  };

  $http.get('/artists/').success( function(data) {
    // transform what we receive from the server
    // array of objects, name is artist name, albums is list of strings
    // if we change server format, this won't be necessary.
    $scope.artists = [];
    for ( var i in data ) {
      var o = { 'name': i, 'albums': data[i] };
      $scope.artists.push(o);
    }
  });
}

// controller for right pane containing a number of albums with tracks inside
function ArtistDetailCtrl($rootScope, $scope, $http, $routeParams, $playlist, $player) {
  // call in template to queue a song, song is the JSON model
  $scope.queueTrack = function( song ) {
    $playlist.queue( song );
  };

  // similar to above, but queue the whole album that was clicked on
  $scope.queueAlbum = function( album ) {
    for ( var i = 0; i < album.tracks.length; i++ ) {
      $playlist.queue( album.tracks[i] );
    }
  };

  // generate a 'nice' url for the browse button
  var url = '/' + $routeParams.artist;
  if ( $routeParams.album ) url += '/'+ $routeParams.album;
  $rootScope.$broadcast('navChanged', {section: 'browse', url: url});

  // if the url doesn't have /:artist/ we have nothing to do
  if ( !$routeParams.artist ) {
    return;
  }

  // url the actual json call is made at
  url = '/browse' + url;

  $http.get(url).success( function(data) {
    $scope.albums = {};
    var len = data.length;
    // transform what we receive from the server
    // group by album, with an array of songs inside
    // if we change server format, this won't be necessary.
    for ( var i = 0; i < len; i++ ) {
      var song = data[i];

      if ( !$scope.albums[ song.id3_album ] ) {
        $scope.albums[ song.id3_album ] = { 'name': song.id3_album, 'date': song.id3_date, 'art': song.id, 'tracks': [] };
      }
      $scope.albums[ song.id3_album ].tracks.push( song );
    }
  });
}