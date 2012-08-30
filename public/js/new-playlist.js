Playlist = function(list) {
  this.list = list;
  this.index = 0;
}

Playlist.prototype.onComplete = function() {
  console.log("Playback complete.");
  this.next();
};

Playlist.prototype.onStop = function() {
  console.log("Releasing resources");
  this.audio.pause();
  this.audio.release();
};

Playlist.prototype.next = function() {
  this.onStop();
  if(this.index == this.list.length) {
    console.log("End of playlist reached, stopping.");
    return;
  }

  console.log("Switching to next song");
  this.index = this.index + 1;
  this.playCurrent();
};

Playlist.prototype.skip = function() {
  this.skipping = true;
  this.next();
}

Playlist.prototype.prev = function() {
  this.skipping = true;
  this.onStop();

  if(this.index == 0) {
    console.log("Beginning of playlist reached, stopping");
    return;
  }

  console.log("Switching to previous song");
  this.index = this.index - 1;
  this.playCurrent();
};

Playlist.prototype.pause = function() {
  this.audio.pause();
};

Playlist.prototype.onSuccess = function() {};
Playlist.prototype.onError = function() {};

Playlist.prototype.playCurrent = function() {
  var that = this;
  var onStatusChange = function(newStatus) {
    if(newStatus != 4) {
      // We only care about the "stop" event
      return;
    }

    if(that.skipping === true) {
      that.skipping = false;
      return;
    }

    if(newStatus == 4) {
      that.onComplete();
    }
  }

  this.audio = new Media("http://24.212.224.140:4567/get/" + this.list[this.index], this.onSuccess, this.onError, onStatusChange);
  this.audio.play();
};