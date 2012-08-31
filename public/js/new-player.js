Player = function(serverAddress) {
  this.serverAddress = serverAddress;
  _.extend(this, Backbone.Events);

  this.on("stopped", function() {
    console.log("'stopped' callback running", this);
    if(this.audio) {
      this.audio.release();
      this.audio = null;
    }
  });

  this.manualChange = false;
}

Player.prototype.play = function(songId) {
  if(!this.audio || (songId != this.audio.songId)) {
    this.stop();
    this.audio = this.makeNewAudio(songId);
  }
  this.audio.play();
}

Player.prototype.stop = function() {
  if(this.audio) {
    this.audio.stop();
  }
}

Player.prototype.pause = function() {
  this.audio.pause();
}

Player.prototype.manually = function(callback, context) {
  if(!context) {
    console.log("context: ", this);
    context = this;
  }

  this.manualChange = true;
  callback.call(context);
}

Player.prototype.makeNewAudio = function(songId) {
  var that = this;

  var onStatusChange = function(status) {
    console.log("status changed to " + status);
    if(status == 4) {
      that.trigger("stopped");
      if(that.manualChange === false) {
        that.trigger("audio-ended");
      }
    }

    that.manualChange = false;
  }

  var songPath = this.serverAddress + "/get/" + songId;
  var media = new Media(songPath, function(){}, function(){}, onStatusChange);
  media.songId = songId;
  return media;
}
