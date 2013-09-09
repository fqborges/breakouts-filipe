//--------------------
/**
 * DisplaySystem
 **/
var DisplaySystem = function(stage, resources) {

  this._res = resources;
  this._stage = stage;
  this._spriteViews = {};
  this._textViews = {};
};

DisplaySystem.prototype.addToWorld = function(world) {

  // setup fps
  var stats = new Stats();
  stats.setMode(0); // 0: fps, 1: ms
  stats.domElement.style.position = 'fixed';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  this._stats = stats;
  document.body.appendChild(stats.domElement);
  // end - setup fps

  this._world = world;
};

DisplaySystem.prototype.removeFromWorld = function() {
  var stats = this._stats;
  document.body.removeChild(stats.domElement);

  this._stats = null;
  this._world = null;
};

DisplaySystem.prototype.step = function() {
  var world = this._world;

  // removed sprites
  for (var eid in this._spriteViews) {
    var ent = world.getEntityById(eid);
    if (!ent || !ent.has('sprite')) {
      var view = this._spriteViews[eid];
      this._stage.removeChild(view);
      delete this._spriteViews[eid];
    }
  }

  // removed text
  for (var eid in this._textViews) {
    var ent = world.getEntityById(eid);
    if (!ent || !ent.has('text')) {
      var view = this._textViews[eid];
      this._stage.removeChild(view);
      delete this._textViews[eid];
    }
  }

  // sync each sprite with its view
  var ents = world.getEntities('sprite');
  for (var i = 0, ent; !!(ent = ents[i]); i++) {
    // if not has position, ignore
    var position = ent.get('position');
    if (!position) {
      position = {x: 0, y: 0};
      ent.add('position', position);
    }
    // get sprite and check image
    var sprite = ent.get('sprite');
    if (sprite.imgid) {
      sprite.image = this._res.images[sprite.imgid];
      sprite.imgid = null;
    }
    // if sprite not has a view, create it
    var view = this._spriteViews[ent.id];
    if (!view) {
      view = this._createSpriteView(ent);
    }
    // sync sprite attributes to view
    view.image = sprite.image;
    var rect = view.sourceRect;
    rect.x = sprite.x;
    rect.y = sprite.y;
    rect.width = sprite.w;
    rect.height = sprite.h;
    view.x = position.x - 0.5 * rect.width;
    view.y = position.y - 0.5 * rect.height;
  }

  // sync each sprite with its view
  var ents = world.getEntities('text');
  for (var i = 0, ent; !!(ent = ents[i]); i++) {
    // if not has position, ignore
    var position = ent.get('position');
    if (!position) {
      position = {x: 0, y: 0};
      ent.add('position', position);
    }
    // if sprite not has a view, create it
    var text = ent.get('text');
    var view = this._textViews[ent.id];
    if (!view) {
      view = this._createTextView(ent);
    }
    view.text = text.value;
    view.textAlign = text.align;
    // sync text to view
    view.x = position.x;
    view.y = position.y;
  }

  this._stage.update();

  this._stats.update();
};

DisplaySystem.prototype._createSpriteView = function(entity) {
  var view = new createjs.Bitmap(null);
  view.sourceRect = new createjs.Rectangle(0, 0, 1, 1);
  this._stage.addChild(view);
  this._spriteViews[entity.id] = view;
  return view;
}

DisplaySystem.prototype._createTextView = function(entity) {
  var view = new createjs.Text("--", "20px Arial", "#ff7700");
  this._stage.addChild(view);
  this._textViews[entity.id] = view;
  return view;
}

DisplaySystem.prototype.entityAdded = function(entity) {

  var bg = entity.get('background');
  if (bg)
  {
    var background = new createjs.Bitmap(bg.image);
    this._stage.addChildAt(background, 0);
  }

};
