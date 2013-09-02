
(function(root) {

//--------------------
  /**
   * World
   **/
  var World = function() {
    this._systems = [];
    this._ents = [];

    this._added = [];
    this._removed = [];

    this._em = new EntityManager();
  };

  /**
   * createEntity -> {Entity}
   **/
  World.prototype.createEntity = function() {
    return this._em.createEntity();
  };

  /**
   * addEntity( {Entity} )
   **/
  World.prototype.addEntity = function(entity) {
    this._added.push(entity);
  };

  /**
   * addEntity( {Entity} )
   **/
  World.prototype.removeEntity = function(entity) {
    var index = this._removed.indexOf(entity);
    console.log('removeEntity>' + index);
    if (index === -1) {
      this._removed.push(entity);
    }
  };

  /**
   * getEntities() -> {Array}
   **/
  World.prototype.getEntities = function() {
    if (arguments.length === 0) {
      return this._ents.slice(0);
    }
    else {
      var ents = [];
      for (var ie = 0, ent; !!(ent = this._ents[ie]); ie++) {
        for (var ia = 0, la = arguments.length; ia < la; ia++) {
          if (!ent.has(arguments[ia])) {
            ent = null;
            break;
          }
        }
        if (ent) {
          ents.push(ent);
        }
      }
      return ents;
    }
  };

  /**
   * step( {number} )
   **/
  World.prototype.step = function(delta) {
    var systems = this._systems;
    var ents = this._ents;
    var added = this._added;
    var removed = this._removed;

    // handle added entities
    for (var e = 0, ent; !!(ent = added[e]); e++) {
      ents.push(ent);
    }

    for (var i = 0, sys; !!(sys = systems[i]); i++) {
      for (var e = 0, ent; !!(ent = added[e]); e++) {
        if (sys.entityAdded)
          sys.entityAdded(ent);
      }
    }
    added.length = 0;

    // handle removed entities
    for (var e = 0, ent; !!(ent = removed[e]); e++) {
      var index = ents.indexOf(ent);
      console.log('handle removed entities>' +index);
      if (index !== -1) {
        ents.splice(index, 1);
      }
    }
    for (var i = 0, sys; !!(sys = systems[i]); i++) {
      for (var e = 0, ent; !!(ent = removed[e]); e++) {
        if (sys.entityRemoved)
          sys.entityRemoved(ent);
      }
    }
    removed.length = 0;

    for (var i = 0, sys; !!(sys = systems[i]); i++) {
      if (sys.step)
        sys.step(delta, this._ents);
    }
  }

  /**
   * addSystem( {object} )
   **/
  World.prototype.addSystem = function(system) {
    this._systems.push(system);
    system.addToWorld(this);
  }

  root.World = World;

})(this);