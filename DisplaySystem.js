//--------------------
/**
 * DisplaySystem
 **/
var DisplaySystem = function(stage, resources) {

  this._res = resources;
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
    var view = this._displayObjects[ent.id];
    if (view) {
      // set sprite
      var sprite = ent.get('sprite');
      view.image = this._res.images[sprite.imgid];
      var rect = view.sourceRect;
      rect.x = sprite.x;
      rect.y = sprite.y;
      rect.width = sprite.w;
      rect.heigth = sprite.h;
    
      // set position
      var position = ent.get('position');
      view.x = position.x - 0.5 * rect.width;
      view.y = position.y - 0.5 * rect.heigth;
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
    var bitmap = new createjs.Bitmap(null);
    bitmap.image = this._res.images[sprite.imgid];
    bitmap.sourceRect = new createjs.Rectangle(sprite.x, sprite.y, sprite.w, sprite.h);
    bitmap.x = position.x - 0.5 * sprite.w;
    bitmap.y = position.y - 0.5 * sprite.h;
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