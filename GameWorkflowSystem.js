//--------------------
/**
 * GameWorkflowSystem
 **/
var GameWorkflowSystem = function() {
  this._world = null;
};

GameWorkflowSystem.prototype.addToWorld = function(world) {
  this._world = world;
};

GameWorkflowSystem.prototype.removeFromWorld = function() {
  this._world = null;
};

GameWorkflowSystem.prototype.step = function(delta) {
  var world = this._world;
  var BLOCK = 16;

  var balls = [];
  var ballCount = 0;
  var brickCount = 0;
  var ents = this._world.getEntities('colision');
  for (var i = 0, l = ents.length; i < l; i++) {
    var ent = ents[i];
    var group = ent.get('colision').type;
    if (group === 'ball') {
      ballCount++;
      balls.push(ent);
    } else if (group === 'brick') {
      brickCount++;
    }
  }

  if (ballCount === 0) {
    var ball = world.createEntity();
    ball.add('sprite', {imgid: 'tiles', w: BLOCK, h: BLOCK, x: 7 * BLOCK, y: 4 * BLOCK});
    ball.add('position', {x: 2 * BLOCK, y: 10 * BLOCK});
    ball.add('velocity', {x: 8, y: 8});
    ball.add('colision', {type: 'ball', bodyType: 'dynamic', w: 1 * BLOCK, h: 1 * BLOCK});
    ball.add('animated', {animation: 'ball'});
    world.addEntity(ball);
  }

  if (brickCount === 0) {
    for (var ix = 5; ix < 15; ix += 3) {
      for (var iy = 5; iy < 10; iy += 2) {
        var color = Math.floor(Math.random() * 4);
        var brick = world.createEntity();
        brick.add('sprite', {imgid: 'tiles', x: 0 * BLOCK, y: color * BLOCK, w: 2 * BLOCK, h: 1 * BLOCK});
        brick.add('position', {x: (ix + 0.5 * 2) * BLOCK, y: (iy + 0.5 * 1) * BLOCK});
        brick.add('colision', {type: 'brick', bodyType: 'static', w: 2 * BLOCK, h: 1 * BLOCK});
        //brick.add('animated', {animation: 'brick'});
        world.addEntity(brick);
      }
    }

    for (var i = 0, l = balls.length; i < l; i++) {
      this._world.removeEntity(balls[i]);
    }
  }


};


