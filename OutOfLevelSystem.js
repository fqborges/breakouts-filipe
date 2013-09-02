//--------------------
/**
 * OutOfLevelSystem
 **/
var OutOfLevelSystem = function() {
  this._world = null;
};

OutOfLevelSystem.prototype.addToWorld = function(world) {
  this._world = world;
};

OutOfLevelSystem.prototype.removeFromWorld = function() {
  this._world = null;
};

OutOfLevelSystem.prototype.step = function(delta) {
  var levelHeigth = 480;

  var ents = this._world.getEntities('position');
  for (var i = 0, ent; !!(ent = ents[i]); i++) {
    var position = ent.get('position');

    if (position.y > levelHeigth) {
      this._world.removeEntity(ent);
    }
  }
};


