angular.module('streamroller', ['player','playlist']).config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/playlist', {templateUrl: '/playlistview.html', controller: PlaylistCtrl}).
      when('/:artist', {templateUrl:'/detailview.html', controller: ArtistDetailCtrl}).
      when('/:artist/:album', {templateUrl:'/detailview.html', controller: ArtistDetailCtrl}).
      otherwise({redirectTo: '/'});
}]);

angular.module('player', [], function($provide) {
  // audio player module
  $provide.factory('$player', function($rootScope) {
    var srv = {};
    var volume = 50;

    srv.nowPlaying = undefined;     // handle to currently playing soundManager handle
    srv.song = undefined;           // song object for currently playing song
    srv.paused = true;              // is the player paused
    srv.progress = 0;               // float 0-100 for song progress
    srv.timeElapsed = '0:00';       // formatted string for song position
    srv.timeLeft = '0:00';          // formatted string for song time left

    // destroy the current handle and start playing the requested song
    // song is a JSON object containing all the song info
    srv.play = function( song ) {
      if ( srv.nowPlaying ) {
        srv.nowPlaying.destruct();
      }

      srv.nowPlaying = soundManager.createSound({
        id: 'audio',
        url: '/get/'+ song.id,
        autoLoad: true,
        autoPlay: true,
        html5Only: true,
        volume: volume,
        whileplaying: function() {
          // update player stats, call $apply since we're not in angular land
          srv.progress = this.position / this.durationEstimate * 100;
          srv.setTimeElapsed( this.position );
          srv.setTimeLeft( this.position, this.durationEstimate );
          $rootScope.$apply();
        },
        onfinish: function() {
          // just send out an event and let the playlist queue up the next song
          $rootScope.$broadcast('songFinished');
          $rootScope.$apply();
        }
      });

      srv.song = song;
      srv.paused = false;
    };

    srv.setTimeElapsed = function( msec ) {
      var val = msec/1000;
      var min = Math.floor(val / 60);
      var sec = Math.floor(val % 60);
      srv.timeElapsed = min +':'+ (sec<10?'0':'') + sec;
    };

    srv.setTimeLeft = function( msec, length ) {
      var val = (length-msec)/1000;
      var min = Math.floor(val / 60);
      var sec = Math.floor(val % 60);
      srv.timeLeft = min +':'+ (sec<10?'0':'') + sec;
    };

    srv.togglePause = function() {
      if ( srv.nowPlaying ) {
        srv.nowPlaying.togglePause();
        srv.paused = srv.nowPlaying.paused;
      }
    };

    srv.changeVolume = function(amt) {
      if ( srv.nowPlaying ) {
        volume = Math.max(0, Math.min(100, volume + amt));
        srv.nowPlaying.setVolume( volume );
      }
    }

    return srv;
  });
});

angular.module('playlist', ['player'], function($provide) {
  // playlist module
  $provide.factory('$playlist', function($rootScope, $player) {
    var srv = {};

    srv.playlist = [];    // list of song objects in the playlist
    srv.playing = 0;      // array index of currently playing song

    // add a song to the end of the playlist
    srv.queue = function( song ) {
      srv.playlist.push( song );

      if ( srv.playlist.length == 1 ) {
        srv.play( 0 );
      }
    };

    // play a song from a playlist with the given index
    // responsible for calling the player service
    srv.play = function(i) {
      if ( !srv.playlist[i] ) {
        return;
      }
      srv.playing = i;
      $player.play( srv.playlist[i] );
    };

    // skip amt places in the playlist, wrap around in both directions
    srv.skipSong = function(amt) {
      var i = (srv.playing + amt) % srv.playlist.length;
      if ( i < 0 ) {
        i = srv.playlist.length - (Math.abs(i) % srv.playlist.length);
      }
      srv.play( i );
    };

    srv.clear = function() {
      srv.playlist = [];
    };

    // post to /m3u endpoint which basically serves back what we send it
    // with an m3u of the current playlist
    srv.generateM3U = function() {
      var m3u = ['#EXTM3U'];
      for (var i=0; srv.playlist[i]; i++) {
        var f = srv.playlist[i];
        m3u.push('#EXTINF:'+ f.length +','+ f.file);
        m3u.push('http://'+ window.location.host +'/get/'+ f.id + '?external=true');
      }
      
      $.ajax({
        url: '/m3u',
        type: 'POST',
        data: {playlist: m3u.join("\n")},
        complete: function(xhr, status) { window.location.href = '/m3u'; }
      });
    };
    
    // dispatched by the player, play the next song in the playlist
    $rootScope.$on('songFinished', function(e) {
      srv.skipSong(1);
    });

    return srv;
  });
});

// soundmanager first-time init
soundManager.setup({
  url: '/swf/',
  onready: function() {
    console.log('Ready to play sound!');
  },
  ontimeout: function() {
    console.log('SM2 start-up failed.');
  }
});

jQuery( function($) {
  // FIXME: need to kill the default beavhior of song clicks here
  // we keep the link href so you can right click -> save songs
  $('.albumList').on('click', '.album ul li a', function(e) {
    return false;
  });

  // bit of a hack, set the artist list size ourselves
  $(window).resize(function() {
    var $artistNav = $('.artistList ul.well');
    $artistNav.height( $(window).height() - 190 +'px');
  });
  setTimeout( function(){ $(window).resize(); }, 100 );
});
