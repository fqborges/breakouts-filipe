//--------------------
/**
 * MainMenuSystem
 **/
var MainMenuSystem = function(stage) {

  this._userClicked = false;
  this._stage = stage;
};

MainMenuSystem.prototype.addToWorld = function(world) {
  this._world = world;

  this._onStageMouseUpListener = this.onStageMouseUp.bind(this);
  this._stage.addEventListener('stagemouseup', this._onStageMouseUpListener);
};

MainMenuSystem.prototype.onStageMouseUp = function(mouseEvent) {
  console.log(mouseEvent);
  this._userClicked = true;
}

MainMenuSystem.prototype.removeFromWorld = function() {
  this._stage.removeEventListener('stagemouseup', this._onStageMouseUpListener);

  this._world = null;
};

MainMenuSystem.prototype.step = function() {
  if (this._userClicked) {
    this._userClicked = false;
    
    Game.scene(Game.breakoutsScene);
  }
};
