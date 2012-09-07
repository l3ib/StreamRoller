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

    // handle to currently playing soundManager handle
    srv.nowPlaying = undefined;
    srv.song = undefined;
    srv.paused = true;

    // destroy the current handle and start playing the requested song
    // song is a JSON object containing all the song info
    srv.play = function( song ) {
      if ( srv.nowPlaying ) {
        srv.nowPlaying.destruct();
      }

      //$('.player .progress').addClass('progress-striped active');
      srv.nowPlaying = soundManager.createSound({
        id: 'audio',
        url: '/get/'+ song.id,
        autoLoad: true,
        autoPlay: true,
        html5Only: true,
        volume: volume,
        whileplaying: function() {
          // FIXME: bad place to update progress
          var pct = 0;
          /*if ( this.bytesLoaded != this.bytesTotal ) {
            pct = this.bytesLoaded / this.bytesTotal * 100;
          } else {
            pct = this.position / this.durationEstimate * 100;
          }*/
          pct = this.position / this.durationEstimate * 100;
          $('.player .progress .bar').css('width', pct + '%');

          var val = this.position/1000;
          var min = Math.floor(val / 60);
          var sec = Math.floor(val % 60);
          $('.player .timeElapsed').text(min +':'+ (sec<10?'0':'') + sec);

          var val = (this.durationEstimate-this.position)/1000
          var min = Math.floor(val / 60);
          var sec = Math.floor(val % 60);
          $('.player .timeLeft').text('-'+ min +':'+ (sec<10?'0':'') + sec);
        },
        onload: function() {
          //$('.player .progress').removeClass('progress-striped active');
        },
        onfinish: function() {
          $rootScope.$broadcast('songFinished');
        }
      });

      srv.song = song;
      srv.paused = false;

      $rootScope.$broadcast('playerChanged');

    };

    srv.togglePause = function() {
      if ( srv.nowPlaying ) {
        srv.nowPlaying.togglePause();
        srv.paused = srv.nowPlaying.paused;
        $rootScope.$broadcast('pauseChanged');
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
    var playing = 0;

    srv.playlist = [];

    srv.getPlaying = function() {
      return playing;
    };

    srv.queue = function( song ) {
      srv.playlist.push( song );
      $rootScope.$broadcast('playlistChanged');

      if ( srv.playlist.length == 1 ) {
        srv.play( 0 );
      }

    };

    srv.play = function(i) {
      if ( !srv.playlist[i] ) {
        return;
      }
      playing = i;
      $player.play( srv.playlist[i] );
    };

    srv.skipSong = function(amt) {
      var i = (playing + amt) % srv.playlist.length;
      if ( i < 0 ) {
        i = srv.playlist.length - (Math.abs(i) % srv.playlist.length);
      }
      srv.play( i );
    };

    srv.clear = function() {
      srv.playlist = [];
      $rootScope.$broadcast('playlistChanged');
    };

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
    
    $rootScope.$on('songFinished', function(e) {
      srv.skipSong(1);
    });

    return srv;
  });
});


soundManager.setup({
  url: '/swf/',
  onready: function() {
    console.log('Ready to play sound!');
  },
  ontimeout: function() {
    console.log('SM2 start-up failed.');
  }
});

// FIXME: need to kill the default beavhior here
jQuery( function($) {
  $('.albumList').on('click', '.album ul li a', function(e) {
    return false;
  });
});
