
(function(root) {

//--------------------
/**
 * System
 **/
var System = function(){
  this.initialize();
};

/**
 */
System.inherits = function(childCtor) {
  function tempCtor() {};
  tempCtor.prototype = System.prototype;
  childCtor.superClass_ = System.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};

System.prototype.init = function() {};

System.prototype.addToWorld = function(world) {};

System.prototype.removeFromWorld = function (world) {};

System.prototype.step = function(delta, entities) {};

root.System = System;

})(this);