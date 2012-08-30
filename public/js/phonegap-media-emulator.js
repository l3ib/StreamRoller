Media = function(source, mediaSuccess, mediaError, mediaStatus) {
  if(!mediaSuccess) {
    mediaSuccess = function(){}
  }
  if(!mediaError) {
    mediaError = function(){}
  }
  if(!mediaStatus) {
    mediaStatus = function(){}
  }

  this.audio = new Audio(source);
  console.log("New audio created");
  this.mediaSuccess = mediaSuccess;
  this.mediaError = mediaError;
  this.mediaStatus = mediaStatus;

  var that = this;

  $(this.audio).on("ended", function() {
    that.mediaSuccess(4);
  });
};

Media.prototype.play = function() {
  this.audio.play();
}

Media.prototype.stop = function() {
  this.audio.currentTime = 0;
  this.audio.pause();
}

Media.prototype.pause = function() {
  this.audio.pause();
}

Media.prototype.release = function() {};

Media.prototype.getCurrentPosition = function(callback, error_callback) {
  callback(this.audio.currentTime)
};