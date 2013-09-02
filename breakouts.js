/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

(function() {

  var breakouts = {
    BLOCK: 16,
    setup: function() {

      var stage = new createjs.Stage('breakouts');
      stage.autoClear = true;
      stage.tickOnUpdate = false;
      createjs.Touch.enable(stage);

      var world = this.world = new World();
      world.addSystem(new InputSystem(stage));
      world.addSystem(new PhysicsSystem());
      world.addSystem(new OutOfLevelSystem());
      world.addSystem(new GameWorkflowSystem());
      world.addSystem(new DisplaySystem(stage));

    },
    run: function() {
      var world = this.world;

      createjs.Ticker.useRAF = true;
      createjs.Ticker.setFPS(60);
      createjs.Ticker.addEventListener('tick',
          function(event) {
            world.step(event.delta);
          }
      );
    },
    scene: function() {
      var BLOCK = breakouts.BLOCK;

      var world = this.world;

      // BACKGROUND
      var bg = world.createEntity();
      bg.add('background', {src: 'res/bg_prerendered.png'});
      world.addEntity(bg);

      // WALLS
      var wallTop = world.createEntity();
      wallTop.add('colision', {type: 'wall', bodyType : 'static', w: 20 * BLOCK, h: 1 * BLOCK});
      wallTop.add('position', {x: 0.5 * 20 * BLOCK, y: 0.5 * 1 * BLOCK});
      world.addEntity(wallTop);

      var wallLeft = world.createEntity();
      wallLeft.add('colision', {type: 'wall', bodyType : 'static',w: 1 * BLOCK, h: 26 * BLOCK});
      wallLeft.add('position', {x: 0.5 * 1 * BLOCK, y: 0.5 * 26 * BLOCK});
      world.addEntity(wallLeft);

      var wallRight = world.createEntity();
      wallRight.add('colision', {type: 'wall', bodyType : 'static',w: 1 * BLOCK, h: 26 * BLOCK});
      wallRight.add('position', {x: (19 + 0.5 * 1) * BLOCK, y: 0.5 * 26 * BLOCK});
      world.addEntity(wallRight);

      // PADDLE
      var paddle = world.createEntity();
      paddle.add('sprite', {src: 'res/tiles.png', w: 3 * BLOCK, h: BLOCK, x: 0 * BLOCK, y: 4 * BLOCK});
      paddle.add('position', {x: (9 + 0.5 * 3) * BLOCK, y: (23 + 0.5 * 1) * BLOCK});
      paddle.add('colision', {type: 'paddle', bodyType : 'kinematic', w: 3 * BLOCK, h: 1 * BLOCK});
      paddle.add('input', {});
      world.addEntity(paddle);
    }
  };

  window.addEventListener('load', function() {
    breakouts.setup();
    breakouts.run();
    breakouts.scene();
  }, false);

})();