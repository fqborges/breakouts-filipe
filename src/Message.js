
var MessageRegistry = function() {
  this._listeners = {};
};

MessageRegistry.addEventListener = function(type, listener) {
  
  this.removeEventListener(type, listener);
  
  var arr = listeners[type];
  if (!arr) {
    arr = listeners[type] = [];
  }
  arr.push(listener);
  return listener;
};

MessageRegistry.removeEventListener = function(type, listener) {
  var arr = listeners[type];
  if (!arr) {
    return;
  }
  for (var i = 0, l = arr.length; i < l; i++) {
    if (arr[i] == listener) {
      if (l == 1) {
        delete(listeners[type]);
      } // allows for faster checks.
      else {
        arr.splice(i, 1);
      }
      break;
    }
  }
};

MessageRegistry.removeAllEventListeners = function(type) {
  if (!type) {
    this._listeners = {};
  }
  else if (this._listeners) {
    delete(this._listeners[type]);
  }
};

MessageRegistry.dispatchEvent = function(eventObj, target) {
  var ret = false, listeners = this._listeners;
  if (eventObj && listeners) {
    if (typeof eventObj == "string") {
      eventObj = {type: eventObj};
    }
    var arr = listeners[eventObj.type];
    if (!arr) {
      return ret;
    }
    eventObj.target = target || this;
    arr = arr.slice(); // to avoid issues with items being removed or added during the dispatch
    for (var i = 0, l = arr.length; i < l; i++) {
      var o = arr[i];
      if (o.handleEvent) {
        ret = ret || o.handleEvent(eventObj);
      }
      else {
        ret = ret || o(eventObj);
      }
    }
  }
  return !!ret;
};

MessageRegistry.hasEventListener = function(type) {
  var listeners = this._listeners;
  return !!(listeners && listeners[type]);
};