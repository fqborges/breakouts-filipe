
var root = this;

(function() {

//--------------------
  /**
   * Entity
   **/
  var Entity = function(id, em) {

    this.id = id;
    this.em = em;

    this._components = {};
  };

  /**
   * add( {string}, {object} )
   **/
  Entity.prototype.add = function(name, component) {
    this.em.addComponent(name, this.id, component);
    this._components[name] = component;
  };

  /**
   * get( {string} ) -> {object}
   **/
  Entity.prototype.get = function(name) {
    return this._components[name];
  };

  /**
   * has( {string} ) -> {boolean}
   **/
  Entity.prototype.has = function(name) {
    return name in this._components;
  };

  /**
   * has( {string} ) -> {boolean}
   **/
  Entity.prototype.del = function(name) {
    delete this._components[name];
    this.em.deleteComponent(name, this.id);
  };

  /**
   * toString() -> {string}
   **/
  Entity.prototype.toString = function() {
    return '[Entity id=' + this.id + ']';
  };

  root.Entity = Entity;

})();