SoundManagerPlayer = function(serverAddress) {
  this.serverAddress = serverAddress;
  _.extend(this, Backbone.Events);
}

SoundManagerPlayer.prototype.play = function(songId) {
  if(!this.audio || (songId != this.audio.songId)) {
    this.stop();
    this.audio = this.makeNewAudio(songId);
  }
  this.audio.play();
}

SoundManagerPlayer.prototype.stop = function() {
  if(this.audio) {
    this.audio.stop();
    this.audio.destruct();
    this.audio = null;
  }
}

SoundManagerPlayer.prototype.pause = function() {
  this.audio.pause();
}

SoundManagerPlayer.prototype.makeNewAudio = function(songId) {
  var that = this;

  var onFinish = function() {
    that.trigger("audio-ended");
  }

  var onStopped = function() {
    that.trigger("stopped");
  }

  var songPath = this.serverAddress + "/get/" + songId;
  var sound = soundManager.createSound({
    id: "streamroller-" + songId,
    url: [{type: "audio/ogg; codecs=vorbis", url: songPath}],
    autoPlay: true,
    onfinish: onFinish,
    onstopped: onStopped
  });

  sound.songId = songId;
  console.log(sound);
  return sound;
}
