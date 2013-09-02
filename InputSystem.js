//--------------------
/**
 * InputSystem
 **/
var InputSystem = function(stage) {

  this._stage = stage;
};

InputSystem.prototype.addToWorld = function(world) {
  this._world = world;

  this._stage.addEventListener('stagemousemove', this.onStageMouseMove.bind(this));
};

InputSystem.prototype.onStageMouseMove = function(mouseEvent) {
  var x = mouseEvent.stageX;

  this._world.mouseX = x;

  var ent = this._world.getEntities('input')[0];
  if (ent) {
    ent.add('moveTo', {x: x});
  }
}

InputSystem.prototype.removeFromWorld = function() {

  this._world = null;
};

InputSystem.prototype.step = function() {

};
