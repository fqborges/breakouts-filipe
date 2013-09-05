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

  var balls = this._world.getEntities('ball');
  var bricks = this._world.getEntities('brick');
  
  if (balls.length === 0) {
    var ball = world.createEntity();
    ball.add('sprite', {imgid: 'img_tiles', w: BLOCK, h: BLOCK, x: 7 * BLOCK, y: 4 * BLOCK});
    ball.add('position', {x: 2 * BLOCK, y: 10 * BLOCK});
    ball.add('velocity', {x: 8, y: 8});
    ball.add('rigidBody', {bodyType: 'dynamic', w: 1 * BLOCK, h: 1 * BLOCK});
    ball.add('animated', {animation: 'anim_ball'});
    ball.add('ball', {} );
    world.addEntity(ball);
  }

  for(var i = 0, brick; !!(brick = bricks[i]); i++ ) {
    var collision = brick.get('collision');
    if(collision) {
      // brick.del('rigidBody');
      // brick.add('animated', {animation: 'anim_brick_destroy'});
      // brick.add('destroy', {timeout : '1000'} );
      this._world.removeEntity(brick);
    }
  }
  
  if (bricks.length === 0) {
    for (var ix = 5; ix < 15; ix += 3) {
      for (var iy = 5; iy < 10; iy += 2) {
        var color = Math.floor(Math.random() * 4);
        var brick = world.createEntity();
        brick.add('sprite', {imgid: 'img_tiles', x: 0 * BLOCK, y: color * BLOCK, w: 2 * BLOCK, h: 1 * BLOCK});
        brick.add('position', {x: (ix + 0.5 * 2) * BLOCK, y: (iy + 0.5 * 1) * BLOCK});
        brick.add('rigidBody', {bodyType: 'static', w: 2 * BLOCK, h: 1 * BLOCK});
        brick.add('brick', {} );
        world.addEntity(brick);
      }
    }

    for (var i = 0, l = balls.length; i < l; i++) {
      this._world.removeEntity(balls[i]);
    }
  }


};


