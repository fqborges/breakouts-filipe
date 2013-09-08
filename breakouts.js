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

  var breakouts = {
    BLOCK: 16,
    load: function(loadComplete) {
      var queue = new createjs.LoadQueue(false);
      for (var key in resources.images) {
        var url = resources.images[key];
        queue.loadFile(url, false);
      }
      queue.addEventListener("complete", function() {
        // load images
        for (var key in resources.images) {
          var url = resources.images[key];
          resources.images[key] = queue.getResult(url);
        }
        // load spriteSheets
        for (var key in resources.spriteSheets) {
          var data = resources.spriteSheets[key];
          for (var i = 0; i < data.images.length; i++) {
            data.images[i] = resources.images[ data.images[i] ];
          }
          var spriteSheet = new createjs.SpriteSheet(data);
          resources.spriteSheets[key] = spriteSheet;
        }
        // load animations
        for (var key in resources.animations) {
          var animation = resources.animations[key];
          var spriteSheet = resources.spriteSheets[animation.spriteSheet];
          var frames = animation.frames;
          for (var i = 0; i < frames.length; i++) {
            frames[i] = spriteSheet.getFrame(frames[i]);
          }
        }
        loadComplete && loadComplete();
      });
      queue.load();
    },
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
      world.addSystem(new GameWorkflowSystem());
      world.addSystem(new ExpirationSystem());
      world.addSystem(new AnimationSystem(resources));
      world.addSystem(new DisplaySystem(stage, resources));

    },
    run: function() {
      var world = this.world;

      createjs.Ticker.useRAF = true;
      createjs.Ticker.setFPS(30);
      createjs.Ticker.addEventListener('tick',
          function(event) {
            if (!event.paused)
              world.step(event.delta);
          }
      );
    },
    pause: function() {
      createjs.Ticker.setPaused(true);
    },
    resume: function() {
      createjs.Ticker.setPaused(false);
    },
    scene: function() {
      var BLOCK = breakouts.BLOCK;
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
      world.addEntity(paddle);

      // COUNTDOWN
      var countdown = world.createEntity();
      countdown.add('position', {x: 320 / 2, y: 480 / 2});
      countdown.add('sprite', {});
      countdown.add('animated', {animation: 'anim_countdown'});
      countdown.add('expires', {timeout: 3});
      world.addEntity(countdown);
    }
  };

  window.addEventListener('load', function() {
    breakouts.load(function() {
      breakouts.setup();
      breakouts.run();
      breakouts.scene();
    });
  }, false);

  window.addEventListener('blur', function() {
    breakouts.pause();
  }, false);

  window.addEventListener('focus', function() {
    breakouts.resume();
  }, false);

})();