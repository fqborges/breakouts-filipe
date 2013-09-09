//--------------------
/**
 * GameStateSystem
 **/
var GameStateSystem = function() {
  this._world = null;
};

GameStateSystem.prototype.addToWorld = function(world) {
  this._world = world;
};

GameStateSystem.prototype.removeFromWorld = function() {
  this._world = null;
};

GameStateSystem.prototype.step = function(delta) {

  var world = this._world;
  var gamedata = null;

  var result = this._world.getEntities('gamedata');
  if (result.length === 0) {
    gamedata = world.createEntity();
    gamedata.add('gamedata', {state: 'SETUP'}); // 
    world.addEntity(gamedata);
  } else {
    gamedata = result[0];
  }

  this.processGameState(gamedata);
};

GameStateSystem.prototype.processGameState = function(gamedataEnt) {

  var gamedata = gamedataEnt.get('gamedata');

  var world = this._world;
  var BLOCK = 16;

  var balls = this._world.getEntities('ball');
  var bricks = this._world.getEntities('brick');
  var powerups = this._world.getEntities('powerup');
  var powerdowns = this._world.getEntities('powerdown');

  //  === SETUP ===
  if (gamedata.state === 'SETUP') {

    // next state is COUNTDOWN
    gamedata.state = 'COUNTDOWN';

    // remove any entity left
    var allEnts = [].concat(balls, bricks, powerups, powerdowns);
    for (var i = 0, l = allEnts.length; i < l; i++) {
      this._world.removeEntity(allEnts[i]);
    }

    // create countdown entity
    var countdown = world.createEntity();
    countdown.add('position', {x: 320 / 2, y: 480 / 2});
    countdown.add('sprite', {});
    countdown.add('animated', {animation: 'anim_countdown'});
    countdown.add('expires', {timeout: 3});
    countdown.add('countdown', {});
    world.addEntity(countdown);

    // create ball
    var ball = world.createEntity();
    ball.add('sprite', {imgid: 'img_tiles', w: BLOCK, h: BLOCK, x: 7 * BLOCK, y: 4 * BLOCK});
    ball.add('position', {x: 2 * BLOCK, y: 10 * BLOCK});
    ball.add('rigidBody', {bodyType: 'dynamic', w: 1 * BLOCK, h: 1 * BLOCK});
    ball.add('animated', {animation: 'anim_ball'});
    ball.add('ball', {});
    world.addEntity(ball);

    // create bricks
    var colors = ['blue', 'orange', 'red', 'green'];
    for (var ix = 5; ix < 15; ix += 3) {
      for (var iy = 5; iy < 10; iy += 2) {
        var hiddenChance = Math.floor(Math.random() * 2);
        var colorIndex = Math.floor(Math.random() * 4);
        var brick = world.createEntity();
        brick.add('sprite', {imgid: 'img_tiles', x: 0 * BLOCK, y: colorIndex * BLOCK, w: 2 * BLOCK, h: 1 * BLOCK});
        brick.add('position', {x: (ix + 0.5 * 2) * BLOCK, y: (iy + 0.5 * 1) * BLOCK});
        brick.add('rigidBody', {bodyType: 'static', w: 2 * BLOCK, h: 1 * BLOCK});
        brick.add('brick', {color: colors[colorIndex]});
        if (hiddenChance < 1) {
          brick.add('hiddenPowerup', {});
        } else {
          brick.add('hiddenPowerdown', {});
        }
        world.addEntity(brick);
      }
    }

  }
  //  === COUNTDOWN ===
  else if (gamedata.state === 'COUNTDOWN') {
    var countdown = this._world.getEntities('countdown');

    // if countdown expired
    if (countdown.length === 0) {

      // next state is RUNNING
      gamedata.state = 'RUNNING';

      // ball entities start to move
      var balls = this._world.getEntities('ball');
      for (var i = 0, ball; !!(ball = balls[i]); i++) {
        ball.add('velocity', {x: 8, y: 8});
      }
    }
  }
  //  === RUNNING ===
  else if (gamedata.state === 'RUNNING') {

    // remove any bricks hit by a ball
    for (var i = 0, brick; !!(brick = bricks[i]); i++) {
      var collision = brick.get('collision');
      if (collision) {
        var position = brick.get('position');
        var sprite = brick.get('sprite');
        var hiddenPowerup = brick.get('hiddenPowerup');
        var hiddenPowerdown = brick.get('hiddenPowerdown');
        var brickColor = brick.get('brick').color;
        this._world.removeEntity(brick);
        var anim = world.createEntity();
        anim.add('sprite', sprite);
        anim.add('position', position);
        anim.add('animated', {animation: 'anim_brick_destroy_' + brickColor});
        anim.add('expires', {timeout: 0.5});
        world.addEntity(anim);

        if (hiddenPowerup) {
          var pow = world.createEntity();
          pow.add('sprite', {imgid: 'img_tiles', w: BLOCK, h: BLOCK, x: 6 * BLOCK, y: 6 * BLOCK});
          pow.add('rigidBody', {bodyType: 'dynamic', w: 1 * BLOCK, h: 1 * BLOCK, isSensor: true});
          pow.add('velocity', {x: 0, y: 6});
          pow.add('position', {x: position.x, y: position.y});
          pow.add('powerup', {});
          //pow.add('expires', {timeout: 3});
          world.addEntity(pow);
        }
        if (hiddenPowerdown) {
          var pow = world.createEntity();
          pow.add('sprite', {imgid: 'img_tiles', w: BLOCK, h: BLOCK, x: 7 * BLOCK, y: 6 * BLOCK});
          pow.add('rigidBody', {bodyType: 'dynamic', w: 1 * BLOCK, h: 1 * BLOCK, isSensor: true});
          pow.add('velocity', {x: 0, y: 6});
          pow.add('position', {x: position.x, y: position.y});
          pow.add('powerdown', {});
          //pow.add('expires', {timeout: 3});
          world.addEntity(pow);
        }
      }
    }

    // process powerups
    for (var i = 0, powerup; !!(powerup = powerups[i]); i++) {
      var collision = powerup.get('collision');
      if (collision) {
        var other = collision.other;
        if (other.has('paddle')) {
          world.removeEntity(powerup);
          // create ball
          var ball = world.createEntity();
          ball.add('sprite', {imgid: 'img_tiles', w: BLOCK, h: BLOCK, x: 7 * BLOCK, y: 4 * BLOCK});
          ball.add('position', {x: 2 * BLOCK, y: 10 * BLOCK});
          ball.add('velocity', {x: 8, y: 8});
          ball.add('rigidBody', {bodyType: 'dynamic', w: 1 * BLOCK, h: 1 * BLOCK});
          ball.add('animated', {animation: 'anim_ball'});
          ball.add('ball', {});
          world.addEntity(ball);
        }
      }
    }

    // process powerups
    for (var i = 0, powerdown; !!(powerdown = powerdowns[i]); i++) {
      var collision = powerdown.get('collision');
      if (collision) {
        var other = collision.other;
        if (other.has('paddle')) {
          world.removeEntity(powerdown);
          if (balls[0]) {
            world.removeEntity(balls[0]);
          }
        }
      }
    }

    // if there is no more bricks
    if (bricks.length === 0) {

      // create countdown entity
      var delay = world.createEntity();
      delay.add('expires', {timeout: 1});
      delay.add('delay', {});
      world.addEntity(delay);

      gamedata.state = 'WIN';
    }
    // if there is no more balls
    else if (balls.length === 0) {
      gamedata.state = 'LOSE';
    }
  }
  //  === WIN | LOSE ===
  else if (gamedata.state === 'WIN') {
    // wait a delay before setup scene
    var result = this._world.getEntities('delay');
    if (result.length === 0) {
      gamedata.state = 'SETUP';
    }
  }
  else if (gamedata.state === 'LOSE') {
    gamedata.state = 'SETUP';
  }

};


