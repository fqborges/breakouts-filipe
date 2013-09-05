//--------------------
/**
 * AnimationSystem
 **/
var AnimationSystem = function(resources) {
  this._world = null;
  this._res = resources;
};

AnimationSystem.prototype.addToWorld = function(world) {
  this._world = world;
};

AnimationSystem.prototype.removeFromWorld = function() {
  this._world = null;
};

AnimationSystem.prototype.step = function(delta) {
  var res = this._res;

  var ents = this._world.getEntities('animated', 'sprite');
  for (var i = 0, ent; !!(ent = ents[i]); i++) {
    var animated = ent.get('animated');
    var animation = res.animations[animated.animation];
    var timestep = 1 / animation.fps;
    var updated = false;

    var frameIndex = animated.currentFrameIndex;
    if (!frameIndex && frameIndex !== 0) {
      frameIndex = 0;
      animated.frameElapsed = 0;
      updated = true;
    } else {
      animated.frameElapsed += delta / 1000.0;
      while (animated.frameElapsed >= timestep) {
        animated.frameElapsed -= timestep;
        frameIndex++;
        if (!animation.frames[frameIndex]) {
          frameIndex = 0;
        }
        updated = true;
      }
    }
    if (updated) {
      var frame = animation.frames[frameIndex];
      var sprite = ent.get('sprite');
      sprite.image = frame.image;
      var rect = frame.rect;
      sprite.x = rect.x;
      sprite.y = rect.y;
      sprite.w = rect.width;
      sprite.h = rect.height;

      animated.currentFrameIndex = frameIndex;
    }
    console.log(frameIndex);
  }
};
