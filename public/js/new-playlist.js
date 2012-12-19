Playlist = function(serverAddress, list) {
  this.list = list;
  this.index = 0;
  this.player = new SoundManagerPlayer(serverAddress);

  var that = this;
  this.player.on("audio-ended", function() {
    that.next();
  });
}

Playlist.prototype.next = function() {
  if(this.index == this.list.length) {
    console.log("End of playlist reached, stopping.");
    return;
  }

  console.log("Switching to next song");
  this.player.stop();
  this.index = this.index + 1;
  this.playCurrent();
};

Playlist.prototype.skip = function() {
  this.next();
}

Playlist.prototype.prev = function() {
  if(this.index == 0) {
    console.log("Beginning of playlist reached, stopping");
    return;
  }

  console.log("Switching to previous song");
  this.player.stop();
  this.index = this.index - 1;
  this.playCurrent();
};

Playlist.prototype.pause = function() {
  this.player.pause();
};

Playlist.prototype.playCurrent = function() {
  this.player.play(this.list[this.index]);
};
