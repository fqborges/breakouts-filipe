//--------------------
/**
 * PhysicsSystem
 **/

(function() {

  // Box2d vars
  var b2Vec2 = Box2D.Common.Math.b2Vec2;
  var b2BodyDef = Box2D.Dynamics.b2BodyDef;
  var b2Body = Box2D.Dynamics.b2Body;
  var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
  var b2World = Box2D.Dynamics.b2World;
  var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
  var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
  var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
  var b2Listener = Box2D.Dynamics.b2ContactListener;

  var SCALE = 16;
  var TIMESTEP = 1 / 60;

  var PhysicsSystem = function() {
    this.world = null;
    this.b2world = null;
    this.bodies = null;
    this.bodiesByEntity = null;

    this.contacts = [];
    this.fixedTimestepAccumulator = 0;
  };

  PhysicsSystem.prototype.addToWorld = function(world) {

    // world of entities
    this.world = world;

    // box2d world
    this.b2world = new b2World(new b2Vec2(0, 0), false);
    this.bodies = [];
    this.bodiesByEntity = {};

    //contact listener
    var system = this;
    var listener = new b2Listener();
    listener.PostSolve = function(contact, impulse) {
      var entA = contact.GetFixtureA().GetBody().GetUserData();
      var entB = contact.GetFixtureB().GetBody().GetUserData();

      system.contacts.push({a: entA, b: entB});

      //console.log('colision [' + entA.id + ', ' + entB.id + '] | ' + system.contacts.length);
      //if (contact.GetFixtureA().GetBody().GetUserData() == 'ball' || contact.GetFixtureB().GetBody().GetUserData() == 'ball') {
      //    var impulse = impulse.normalImpulses[0];
      //    if (impulse < 0.2) return; //threshold ignore small impacts
      //    world.ball.impulse = impulse > 0.6 ? 0.5 : impulse;
      //    console.log(world.ball.impulse);
      //}
    };
    this.b2world.SetContactListener(listener);

    // debugDraw
    /*
    var debugDraw = new b2DebugDraw();
    var debugCanvas = document.getElementById('debugCanvas');
    var debugContext = debugCanvas.getContext('2d');
    debugDraw.SetSprite(debugContext);
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFillAlpha(0.7);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    this.b2world.SetDebugDraw(debugDraw);
    */
  };

  PhysicsSystem.prototype.removeFromWorld = function() {
    this.world = null;
    this.b2world = null;
    this.bodies = null;
  };

  PhysicsSystem.prototype.step = function(delta) {

    this.movePaddle();

    var updated = false;
    this.fixedTimestepAccumulator += delta / 1000.0;
    while (this.fixedTimestepAccumulator >= TIMESTEP) {
      this.b2world.Step(TIMESTEP, 8, 3);
      this.fixedTimestepAccumulator -= TIMESTEP;
      updated = true;
    }

    if (updated) {
      var bodies = this.bodies;
      for (var i = 0, l = bodies.length; i < l; i++) {
        var body = bodies[i];
        var entity = body.GetUserData();
        var position = entity.get('position');
        position.x = body.GetWorldCenter().x * SCALE;
        position.y = body.GetWorldCenter().y * SCALE;
      }
    }

    this.b2world.ClearForces();
    //this.b2world.DrawDebugData();

    for (var i = 0, len = this.contacts.length; i < len; i++) {
      var contact = this.contacts[i];
      //console.log('colision [' + contact.a.id + ', ' + contact.b.id + ']');
      var colisionA = contact.a.get('colision');
      var colisionB = contact.b.get('colision');
      if (colisionA && colisionB) {
        if (colisionA.type === 'brick') {
          this.world.removeEntity(contact.a);
        } else if (colisionB.type === 'brick') {
          this.world.removeEntity(contact.b);
        }
      }
    }
    this.contacts.length = 0;
  };

  PhysicsSystem.prototype.movePaddle = function() {

    var ent = this.world.getEntities('moveTo')[0];
    if (ent) {
      var posX = ent.get('moveTo').x;
      ent.del('moveTo');

      var bodyToMove = null;
      var bodies = this.bodies;
      for (var i = 0, l = bodies.length; i < l; i++) {
        var body = bodies[i];
        if (body.GetUserData().id === ent.id)
        {
          bodyToMove = body;
          break;
        }
      }
      if (bodyToMove) {
        var p = bodyToMove.GetPosition();
        p.x = posX / SCALE;
        bodyToMove.SetPosition(p);
      }
    }
  };

  PhysicsSystem.prototype.entityAdded = function(entity) {

    var colision = entity.get('colision'),
        physics = entity.get('position'),
        position = entity.get('position'),
        velocity = entity.get('velocity');

    if (colision && position) {
      var bodyTypeMap = {
        'static': b2Body.b2_staticBody,
        'kinematic': b2Body.b2_kinematicBody,
        'dynamic': b2Body.b2_dynamicBody
      };

      // ent.add('colision', {type:'brick', w: 2 * BLOCK, h: 1 * BLOCK});
      var fixture = new b2FixtureDef;
      fixture.density = 1;
      fixture.restitution = 1;
      fixture.friction = 0;

      if (colision.type === 'ball' && false) {
        var rad = 0.5 * colision.w;
        fixture.shape = new b2CircleShape(rad / SCALE);
      } else {
        fixture.shape = new b2PolygonShape;
        fixture.shape.SetAsBox(0.5 * colision.w / SCALE, 0.5 * colision.h / SCALE);
      }

      var bodyDef = new b2BodyDef;
      // get body def by colision type
      bodyDef.type = bodyTypeMap[colision.bodyType];
      bodyDef.position.x = position.x / SCALE;
      bodyDef.position.y = position.y / SCALE;
      bodyDef.fixedRotation = true;
      var body = this.b2world.CreateBody(bodyDef);
      body.CreateFixture(fixture);
      body.SetUserData(entity);

      if (velocity) {
        body.SetLinearVelocity(new b2Vec2(velocity.x, velocity.y));
      }

      this.bodies.push(body);
      this.bodiesByEntity[entity.id] = body;
    }

  };

  PhysicsSystem.prototype.entityRemoved = function(entity) {

    var body = this.bodiesByEntity[entity.id];

    if (body) {
      this.bodiesByEntity[entity.id] = null;
      this.b2world.DestroyBody(body);

      var bodies = this.bodies;
      for (var i = 0, len = bodies.length; i < len; i++) {
        if (bodies[i] === body) {
          this.bodies.splice(i, 1);
          break;
        }
      }
    }

  };

  window.PhysicsSystem = PhysicsSystem;
})();