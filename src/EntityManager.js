
(function(root) {

//--------------------
  /**
   * EntityManager
   **/
  var EntityManager = function(world) {
    // private
    this._idPool = new IdentifierPool();
    this._ents = {};
    this._cms = {};

    // public
    this.world = world;
  };

  /**
   * createEntity() -> {Entity}
   **/
  EntityManager.prototype.createEntity = function() {
    var ent = new Entity(this._idPool.get(), this);
    this._ents[ent.id] = ent;
    return ent;
  };

  /**
   * createEntity() -> {Entity}
   **/
  EntityManager.prototype.deleteEntity = function(entity) {
    var id = entity.id;
    delete this._ents[id];
    for (var name in this._cms) {
      this.deleteComponent(name, id);
    }
  };

  /**
   * 
   **/
  EntityManager.prototype.getEntity = function(id) {
    return this._ents[id];
  };

  /**
   * 
   **/
  EntityManager.prototype.addComponent = function(name, eid, component) {
    var cm = this._cms[name] || (this._cms[name] = {});
    cm[eid] = component;
  };

  /**
   * 
   **/
  EntityManager.prototype.existsComponent = function(name, eid) {
    var cm = this._cms[name] || (this._cms[name] = {});
    return eid in cm;
  };

  /**
   * 
   **/
  EntityManager.prototype.deleteComponent = function(name, eid) {
    var cm = this._cms[name] || (this._cms[name] = {});
    delete cm[eid];
  };

  /**
   * 
   **/
  EntityManager.prototype.getComponentMap = function(name) {
    var cm = this._cms[name] || (this._cms[name] = {});
    return cm;
  };

  root.EntityManager = EntityManager;

})(this);