//--------------------
/**
 * ExpirationSystem
 **/
var ExpirationSystem = function() {
  this._world = null;
};

ExpirationSystem.prototype.addToWorld = function(world) {
  this._world = world;
};

ExpirationSystem.prototype.removeFromWorld = function() {
  this._world = null;
};

ExpirationSystem.prototype.step = function(delta) {

  var expirableEnts = this._world.getEntities('expires');
  for (var i = 0, ent; !!(ent = expirableEnts[i]); i++) {
    var expires = ent.get('expires');
    expires.timeout -= delta / 1000.0;
    if (expires.timeout <= 0) {
      this._world.removeEntity(ent);
    }
  }

};


