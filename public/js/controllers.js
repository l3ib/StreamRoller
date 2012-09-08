// controller for tabbed nav
function NavigationCtrl($scope, $playlist) {
  var self = this;

  // where the browse tab should link to
  $scope.url = '';
  // which button should be hilighted
  $scope.currentNav = 'browse';

  $scope.$on('navChanged', function(e, o) {
    if ( o.url ) { $scope.url = o.url; }
    if ( o.section ) { $scope.currentNav = o.section };
  });

  // update playlist badge
  $scope.playlist = $playlist;
  $scope.$watch("playlist.playlist.length", function() {
    $scope.numSongs = $playlist.playlist.length;
  });

  // use in the template to determine if section is active
  $scope.getClass = function(name) {
    return name == $scope.currentNav ? 'active' : ''
  };
}

// controller for player at top of page
function PlayerCtrl($scope, $player, $playlist) {
  $scope.player = $player;

  $scope.$watch("player.paused", function() {
    $scope.paused = $player.paused;
  });

  $scope.$watch("player.song", function() {
    $scope.song = $player.song;
  });

  $scope.$watch("player.progress", function() {
    $scope.progress = $player.progress;
  })

  $scope.$watch("player.timeElapsed", function() {
    $scope.timeElapsed = $player.timeElapsed;
  });

  $scope.$watch("player.timeLeft", function() {
    $scope.timeLeft = $player.timeLeft;
  });

  $scope.togglePause = function() {
    $player.togglePause();
  };

  $scope.changeVolume = function(amt) {
    $player.changeVolume(amt);
  }

  $scope.skipSong = function(amt) {
    $playlist.skipSong(amt);
  }

  $scope.getPlayString = function() {
    return $scope.paused ? 'play' : 'pause';
  };
}

// controller for playlist tab
function PlaylistCtrl($rootScope, $scope, $http, $playlist) {
  $scope.PlaylistService = $playlist;

  $scope.play = function(i) {
    $playlist.play(i);
  };

  $scope.clear = function() {
    $playlist.clear();
    $scope.playlist = $playlist.playlist;
  };

  $scope.generateM3U = function() {
    $playlist.generateM3U();
  };

  $scope.$watch("PlaylistService.playing", function() {
    $scope.playing = $scope.PlaylistService.playing;
  })

  $rootScope.$broadcast('navChanged', {section: 'playlist'});

  // copy over playlist from playlist module
  $scope.playlist = $playlist.playlist;
}

// controller for left pane artist -> album list
function ArtistListCtrl($scope, $http, $routeParams) {
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

  $scope.queueAlbum = function( album ) {
    for ( var i = 0; i < album.tracks.length; i++ ) {
      $playlist.queue( album.tracks[i] );
    }
  };

  // if the url doesn't have /:artist/
  if ( !$routeParams.artist ) {
    return;
  }

  // generate a 'nice' url for the browse button
  var url = '/' + $routeParams.artist;
  if ( $routeParams.album ) url += '/'+ $routeParams.album;

  $rootScope.$broadcast('navChanged', {section: 'browse', url: url});

  // url the actual json call is made at
  url = '/browse' + url;

  $http.get(url).success( function(data) {
    $scope.albums = {};
    var len = data.length;
    // transform what we receive from the server
    // group by album, with an array of songs inside
    for ( var i = 0; i < len; i++ ) {
      var song = data[i];

      if ( !$scope.albums[ song.id3_album ] ) {
        $scope.albums[ song.id3_album ] = { 'name': song.id3_album, 'date': song.id3_date, 'art': song.id, 'tracks': [] };
      }
      $scope.albums[ song.id3_album ].tracks.push( song );
    }
  });
}