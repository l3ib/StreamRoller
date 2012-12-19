ConsecutivePlayer = function(serverAddress, startingId) {
  this.player = new SoundManagerPlayer(serverAddress);
  var that = this;
  this.player.on("audio-ended", function() {
    that.skip();
  });
  this.currentId = startingId;
}

ConsecutivePlayer.prototype.play = function() {
  this.player.stop();
  this.player.play(this.currentId);
};
ConsecutivePlayer.prototype.pause = function() {
  this.player.pause();
};
ConsecutivePlayer.prototype.skip = function() {
  this.currentId += 1;
  this.player.stop();
  this.player.play(this.currentId);
};
ConsecutivePlayer.prototype.prev = function() {
  this.currentId -= 1;
  this.player.stop();
  this.player.play(this.currentId);
};

