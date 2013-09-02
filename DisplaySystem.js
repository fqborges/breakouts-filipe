//--------------------
/**
 * DisplaySystem
 **/
var DisplaySystem = function(stage) {

  this._stage = stage;
  this._displayObjects = {};
};

DisplaySystem.prototype.addToWorld = function(world) {
  this._world = world;

  var ents = this._world.getEntities();
  for (var i = 0, ent; !!(ent = ents[i]); i++) {
    this.entityAdded(ent);
  }
};

DisplaySystem.prototype.removeFromWorld = function() {

  var ents = this._world.getEntities('position', 'sprite');
  for (var i = 0, ent; !!(ent = ents[i]); i++) {
    this.entityRemoved(ent);
  }
  this._world = null;
};

DisplaySystem.prototype.step = function() {

  var ents = this._world.getEntities('position', 'sprite');
  for (var i = 0, ent; !!(ent = ents[i]); i++) {
    var position = ent.get('position');
    var view = this._displayObjects[ent.id];

    if (view) {
      view.x = position.x - 0.5 * view.w;
      view.y = position.y - 0.5 * view.h;
    }
  }

  this._stage.update();
};

DisplaySystem.prototype.entityAdded = function(entity) {

  var bg = entity.get('background');
  if (bg)
  {
    var background = new createjs.Bitmap(bg.src);
    this._stage.addChildAt(background, 0);
    this._displayObjects[bg.id] = background;
  }

  var sprite = entity.get('sprite'),
      position = entity.get('position');
  if (sprite && position)
  {
    var bitmap = new createjs.Bitmap(sprite.src);
    bitmap.sourceRect = new createjs.Rectangle(sprite.x, sprite.y, sprite.w, sprite.h);
    bitmap.w = sprite.w;
    bitmap.h = sprite.h;
    bitmap.x = position.x - 0.5 * bitmap.w;
    bitmap.y = position.y - 0.5 * bitmap.h;
    this._stage.addChild(bitmap);
    this._displayObjects[entity.id] = bitmap;
  }
};

DisplaySystem.prototype.entityRemoved = function(entity) {

  var view = this._displayObjects[entity.id];
  if (view) {
    this._stage.removeChild(view);
    this._displayObjects[entity.id] = null;
  }
};