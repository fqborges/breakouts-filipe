/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

(function() {

  var resources = {
    images: {
      'img_tiles': 'res/tiles.png',
      'bg_prerendered': 'res/bg_prerendered.png'
    },
    spriteSheets: {
      'img_tiles_16x16': {
        images: ['img_tiles'],
        frames: {width: 16, height: 16}
      },
      'img_tiles_32x16': {
        images: ['img_tiles'],
        frames: {width: 32, height: 16}
      },
      'img_tiles_32x48': {
        images: ['img_tiles'],
        frames: {width: 32, height: 48}
      }
    },
    animations: {
      'anim_ball': {
        spriteSheet: 'img_tiles_16x16',
        frames: [51, 52, 53, 54, 55],
        loop: true,
        fps: 15
      },
      'anim_countdown': {
        spriteSheet: 'img_tiles_32x48',
        frames: [12, 13, 14, 16],
        fps: 1
      },
      'anim_brick_destroy_blue': {
        spriteSheet: 'img_tiles_32x16',
        frames: [1, 2, 3, 4],
        fps: 8
      },
      'anim_brick_destroy_orange': {
        spriteSheet: 'img_tiles_32x16',
        frames: [7, 8, 9, 10],
        fps: 8
      },
      'anim_brick_destroy_red': {
        spriteSheet: 'img_tiles_32x16',
        frames: [13, 14, 15, 16],
        fps: 8
      },
      'anim_brick_destroy_green': {
        spriteSheet: 'img_tiles_32x16',
        frames: [18, 19, 20, 21],
        fps: 8
      }
    }
  };

  var loadScene = {
    _tickListener: null,
    setup: function() {

      // setup stage
      var stage = new createjs.Stage('breakouts');
      stage.canvas.style.backgroundColor = "#000000";
      stage.autoClear = true;
      stage.tickOnUpdate = false;
      createjs.Touch.enable(stage);

      // setup world
      var world = this._world = new World();
      world.addSystem(new DisplaySystem(stage, resources));

      // text
      var delay = world.createEntity();
      delay.add('position', {x: 160, y: 160});
      delay.add('text', {value: 'Carregando...', align: 'center'});
      world.addEntity(delay);

      // start loading
      this._startLoading();
    },
    step: function(event) {
      this._world.step(event.delta);
    },
    _startLoading: function() {
      var queue = new createjs.LoadQueue(false);
      queue.addEventListener("complete", this._handleComplete.bind(this));
      queue.addEventListener("progress", this._handleProgress.bind(this));
      for (var key in resources.images) {
        var url = resources.images[key];
        queue.loadFile(url, false);
      }
      queue.load();
    },
    _handleProgress: function(event) {
      console.log(event.progress);
    },
    _handleComplete: function(event) {
      var queue = event.target;
      // set images
      for (var key in resources.images) {
        var url = resources.images[key];
        resources.images[key] = queue.getResult(url);
      }
      // set spriteSheets
      for (var key in resources.spriteSheets) {
        var data = resources.spriteSheets[key];
        for (var i = 0; i < data.images.length; i++) {
          data.images[i] = resources.images[ data.images[i] ];
        }
        var spriteSheet = new createjs.SpriteSheet(data);
        resources.spriteSheets[key] = spriteSheet;
      }
      // set animations
      for (var key in resources.animations) {
        var animation = resources.animations[key];
        var spriteSheet = resources.spriteSheets[animation.spriteSheet];
        var frames = animation.frames;
        for (var i = 0; i < frames.length; i++) {
          frames[i] = spriteSheet.getFrame(frames[i]);
        }
      }
      setTimeout(function() {
        Game.scene(menuScene);
      }, 500);
    }
  };

  var menuScene = {
    setup: function() {

      // setup stage
      var stage = new createjs.Stage('breakouts');
      stage.autoClear = true;
      stage.tickOnUpdate = false;
      createjs.Touch.enable(stage);
      // setup world
      var world = this._world = new World();
      world.addSystem(new MainMenuSystem(stage));
      world.addSystem(new DisplaySystem(stage, resources));

      this.scene();

    },
    step: function(event) {
      this._world.step(event.delta);
    },
    scene: function() {
      var BLOCK = 16;
      var world = this._world;
      // BACKGROUND
      var bg = world.createEntity();
      bg.add('background', {image: resources.images['bg_prerendered']});
      world.addEntity(bg);

      // PADDLE
      var paddle = world.createEntity();
      paddle.add('position', {x: (9 + 0.5 * 3) * BLOCK, y: (23 + 0.5 * 1) * BLOCK});
      paddle.add('sprite', {imgid: 'img_tiles', w: 3 * BLOCK, h: BLOCK, x: 0 * BLOCK, y: 4 * BLOCK});
      world.addEntity(paddle);

      // create ball
      var ball = world.createEntity();
      ball.add('sprite', {imgid: 'img_tiles', w: BLOCK, h: BLOCK, x: 7 * BLOCK, y: 4 * BLOCK});
      ball.add('position', {x: 2 * BLOCK, y: 10 * BLOCK});
      ball.add('ball', {});
      world.addEntity(ball);

      // create bricks
      var colors = ['blue', 'orange', 'red', 'green'];
      for (var ix = 5; ix < 15; ix += 3) {
        for (var iy = 5; iy < 10; iy += 2) {
          var colorIndex = Math.floor(Math.random() * 4);
          var brick = world.createEntity();
          brick.add('sprite', {imgid: 'img_tiles', x: 0 * BLOCK, y: colorIndex * BLOCK, w: 2 * BLOCK, h: 1 * BLOCK});
          brick.add('position', {x: (ix + 0.5 * 2) * BLOCK, y: (iy + 0.5 * 1) * BLOCK});
          brick.add('brick', {color: colors[colorIndex]});
          world.addEntity(brick);
        }
      }
      
      // text
      var delay = world.createEntity();
      delay.add('position', {x: 160, y: 260});
      delay.add('text', {value: 'Clique para iniciar.', align: 'center'});
      world.addEntity(delay);
    }
  };

  var breakoutsScene = {
    setup: function() {
      // setup stage
      var stage = new createjs.Stage('breakouts');
      stage.autoClear = true;
      stage.tickOnUpdate = false;
      createjs.Touch.enable(stage);
      // setup world
      var world = this.world = new World();
      world.addSystem(new InputSystem(stage));
      world.addSystem(new PhysicsSystem());
      world.addSystem(new OutOfLevelSystem());
      world.addSystem(new GameStateSystem());
      world.addSystem(new ExpirationSystem());
      world.addSystem(new AnimationSystem(resources));
      world.addSystem(new DisplaySystem(stage, resources));

      this.scene();
    },
    step: function(event) {
      if (!event.paused)
        this.world.step(event.delta);
    },
    pause: function() {
      createjs.Ticker.setPaused(true);
    },
    resume: function() {
      createjs.Ticker.setPaused(false);
    },
    scene: function() {
      var BLOCK = 16;
      var world = this.world;

      // BACKGROUND
      var bg = world.createEntity();
      bg.add('background', {image: resources.images['bg_prerendered']});
      world.addEntity(bg);

      // WALLS
      var wallTop = world.createEntity();
      wallTop.add('rigidBody', {bodyType: 'static', w: 20 * BLOCK, h: 1 * BLOCK});
      wallTop.add('position', {x: 0.5 * 20 * BLOCK, y: 0.5 * 1 * BLOCK});
      world.addEntity(wallTop);

      var wallLeft = world.createEntity();
      wallLeft.add('rigidBody', {bodyType: 'static', w: 1 * BLOCK, h: 26 * BLOCK});
      wallLeft.add('position', {x: 0.5 * 1 * BLOCK, y: 0.5 * 26 * BLOCK});
      world.addEntity(wallLeft);

      var wallRight = world.createEntity();
      wallRight.add('rigidBody', {bodyType: 'static', w: 1 * BLOCK, h: 26 * BLOCK});
      wallRight.add('position', {x: (19 + 0.5 * 1) * BLOCK, y: 0.5 * 26 * BLOCK});
      world.addEntity(wallRight);

      // PADDLE
      var paddle = world.createEntity();
      paddle.add('rigidBody', {bodyType: 'kinematic', w: 3 * BLOCK, h: 1 * BLOCK});
      paddle.add('position', {x: (9 + 0.5 * 3) * BLOCK, y: (23 + 0.5 * 1) * BLOCK});
      paddle.add('sprite', {imgid: 'img_tiles', w: 3 * BLOCK, h: BLOCK, x: 0 * BLOCK, y: 4 * BLOCK});
      paddle.add('input', {});
      paddle.add('paddle', {});
      world.addEntity(paddle);
    }
  };

  var Game = {
    _scene: null,
    run: function() {

      if (!this._tickListener) {
        var game = this;
        this._tickListener = function(event) {
          game._step(event);
        };
      }

      createjs.Ticker.useRAF = false;
      createjs.Ticker.setFPS(60);
      createjs.Ticker.addEventListener('tick', this._tickListener);
    },
    quit: function() {
      createjs.Ticker.removeEventListener('tick', this._tickListener);
    },
    _step: function(event) {
      if (this._scene && this._scene.step)
        this._scene.step(event);
    },
    scene: function(scene) {
      this._scene = scene;
      scene.setup();
    }
  };

  window.addEventListener('load', function() {
    Game.loadScene = loadScene;
    Game.breakoutsScene = breakoutsScene;
    Game.menuScene = menuScene;

    window.Game = Game;

    Game.run();
    Game.scene(loadScene);
    /*breakouts.load(function() {
     breakouts.setup();
     breakouts.scene();
     breakouts.run();
     });*/
  }, false);
  window.addEventListener('blur', function() {
    // breakouts.pause();
    Game.quit();
  }, false);
  window.addEventListener('focus', function() {
    //breakouts.resume();
    //Game.run();
  }, false);
})();