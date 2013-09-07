
(function(root) {

//--------------------
  /**
   * IdentifierPool
   **/
  var IdentifierPool = function() {
    this._ids = [];
    this._nextID = 0;
  };

  /**
   * get() -> {int}
   **/
  IdentifierPool.prototype.get = function() {
    //return //this._ids.length > 0 ?
    //this._ids.pop() :
    return this._nextID++;
  }

  /**
   * giveBack({int})
   **/
  IdentifierPool.prototype.giveBack = function(id) {
    //this._ids.push(id);
  }

  root.IdentifierPool = IdentifierPool;

})(this);