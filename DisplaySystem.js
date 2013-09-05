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

  // setup fps
  var stats = new Stats();
  stats.setMode(0); // 0: fps, 1: ms
  stats.domElement.style.position = 'relative';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  this._stats = stats;
  // end - setup fps

  document.body.appendChild( stats.domElement );

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
  this._stats.begin();

  var ents = this._world.getEntities('position', 'sprite');
  for (var i = 0, ent; !!(ent = ents[i]); i++) {
    var view = this._displayObjects[ent.id];
    if (view) {
      // set sprite
      var sprite = ent.get('sprite');
      view.image = sprite.image;
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
  
  this._stats.end();
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
    if (sprite.imgid) {
      sprite.image = this._res.images[sprite.imgid];
      sprite.imgid = null;
    }
    var view = new createjs.Bitmap(sprite.image);
    view.sourceRect = new createjs.Rectangle(sprite.x, sprite.y, sprite.w, sprite.h);
    view.x = position.x - 0.5 * sprite.w;
    view.y = position.y - 0.5 * sprite.h;
    this._stage.addChild(view);
    this._displayObjects[entity.id] = view;
  }
};

DisplaySystem.prototype.entityRemoved = function(entity) {

  var view = this._displayObjects[entity.id];
  if (view) {
    this._stage.removeChild(view);
    this._displayObjects[entity.id] = null;
  }
};