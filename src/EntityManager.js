
(function(root) {

//--------------------
/**
 * EntityManager
 **/
var EntityManager = function(){
  this._componentMappers = {};
  this._idPool = new IdentifierPool();
};

/**
 * createEntity() -> {Entity}
 **/
EntityManager.prototype.createEntity = function(){
  return new Entity(this._idPool.get(), this);
};

root.EntityManager = EntityManager;

})(this);