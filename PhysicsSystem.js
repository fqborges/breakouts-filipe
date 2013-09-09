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
  var TIMESTEP = 1 / 30;

  var PhysicsSystem = function() {
    this.world = null;
    this.b2world = null;
    this.bodies = null;
    this.staticBodies = null;

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
    this.staticBodies = [];
    this.bodiesByEntity = {};

    //contact listener
    var system = this;
    var listener = new b2Listener();
    listener.PostSolve = function(contact, impulse) {
      var entA = contact.GetFixtureA().GetBody().GetUserData();
      var entB = contact.GetFixtureB().GetBody().GetUserData();

      system.contacts.push({a: entA, b: entB});
    };
    this.b2world.SetContactListener(listener);

    /* debugDraw
     var debugDraw = new b2DebugDraw();
     var debugCanvas = document.getElementById('debugCanvas');
     var debugContext = debugCanvas.getContext('2d');
     debugDraw.SetSprite(debugContext);
     debugDraw.SetDrawScale(SCALE);
     debugDraw.SetFillAlpha(0.7);
     debugDraw.SetLineThickness(1.0);
     debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
     this.b2world.SetDebugDraw(debugDraw);
     //*/
  };

  PhysicsSystem.prototype.removeFromWorld = function() {
    this.world = null;
    this.b2world = null;
    this.bodies = null;
    this.staticBodies = null;
  };

  PhysicsSystem.prototype.step = function(delta) {
    var bodies = this.bodies;
    var world = this.world;
    var bodiesByEntity = this.bodiesByEntity;

    // delete removed bodies
    for (var eid in bodiesByEntity) {
      var ent = world.getEntityById(eid);
      if (!ent || !ent.has('rigidBody')) {
        var body = bodiesByEntity[eid];
        this.b2world.DestroyBody(body);
        delete bodiesByEntity[eid];
      }
    }

    // fix bodies without position
    var entsWithBody = this.world.getEntities('rigidBody');
    for (var i = 0, ent; !!(ent = entsWithBody[i]); i++) {
      // bodies must have position
      var position = ent.get('position');
      if (!position) {
        position = {x: 0, y: 0};
        ent.add('position', position);
      }
    }

    // create added bodies
    for (var i = 0, ent; !!(ent = entsWithBody[i]); i++) {
      // if ent does not have a body, create it
      var body = bodiesByEntity[ent.id];
      if (!body) {
        body = this._createBody(ent);
      }
    }

    this.clearCollisions();

    this.handleMoveTo();

    //* == position ==
    for (var i = 0, l = bodies.length; i < l; i++) {
      var body = bodies[i];
      var entity = body.GetUserData();
      var position = entity.get('position');
      position.x = body.GetWorldCenter().x * SCALE;
      position.y = body.GetWorldCenter().y * SCALE;
    }
    // == position == */

    // ==velocity==
    var velEnts = this.world.getEntities('velocity');
    for (var i = 0, ent; !!(ent = velEnts[i]); i++) {
      var velocity = ent.get('velocity');
      var dBody = this.bodiesByEntity[ent.id];
      var v = dBody.GetLinearVelocity();
      v.x = velocity.x;
      v.y = velocity.y;
      dBody.SetLinearVelocity(v);
      //ent.del('velocity');
    }
    // ==velocity==

    this.stepBox2DWorld(delta);

    this.updateBodiesPosition();

    // ==velocity==
    var velEnts = this.world.getEntities('velocity');
    for (var i = 0, ent; !!(ent = velEnts[i]); i++) {
      var velocity = ent.get('velocity');
      var dBody = this.bodiesByEntity[ent.id];
      var v = dBody.GetLinearVelocity();
      if (v.x || v.y) {
        velocity.x = v.x;
        velocity.y = v.y;
      } else {
        ent.del('velocity');
      }
    }
    // ==velocity== 

    this.setCollisions();

  };

  PhysicsSystem.prototype.clearCollisions = function() {
    var collidedEnts = this.world.getEntities('collision');
    for (var i = 0, ent; !!(ent = collidedEnts[i]); i++) {
      ent.del('collision');
    }
  };

  PhysicsSystem.prototype.stepBox2DWorld = function(delta) {
    this.fixedTimestepAccumulator += delta / 1000.0;
    while (this.fixedTimestepAccumulator >= TIMESTEP) {
      this.b2world.Step(TIMESTEP, 8, 3);
      this.fixedTimestepAccumulator -= TIMESTEP;
    }

    //this.b2world.DrawDebugData();
  };

  PhysicsSystem.prototype.updateBodiesPosition = function() {
    var bodies = this.bodies;
    for (var i = 0, l = bodies.length; i < l; i++) {
      var body = bodies[i];
      var entity = body.GetUserData();
      var position = entity.get('position');
      position.x = body.GetWorldCenter().x * SCALE;
      position.y = body.GetWorldCenter().y * SCALE;
    }
  };

  PhysicsSystem.prototype.setCollisions = function() {
    for (var i = 0, len = this.contacts.length; i < len; i++) {
      var contact = this.contacts[i];
      contact.a.add('collision', {other: contact.b});
      contact.b.add('collision', {other: contact.a});
    }
    this.contacts.length = 0;
  };

  PhysicsSystem.prototype.handleMoveTo = function() {

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

  PhysicsSystem.prototype._createBody = function(entity) {

    var rigidBody = entity.get('rigidBody'),
        position = entity.get('position');

    if (rigidBody.bodyType !== 'static') {
      var bodyTypeMap = {
        'kinematic': b2Body.b2_kinematicBody,
        'dynamic': b2Body.b2_dynamicBody
      };

      // ent.add('rigidBody', {bodyType : 'dynamic', w: 2 * BLOCK, h: 1 * BLOCK});
      var fixture = new b2FixtureDef;
      fixture.density = 1;
      fixture.restitution = 1;
      fixture.friction = 0;

      if (rigidBody.type === 'ball' && false) {
        var rad = 0.5 * rigidBody.w;
        fixture.shape = new b2CircleShape(rad / SCALE);
      } else {
        fixture.shape = new b2PolygonShape;
        fixture.shape.SetAsBox(0.5 * rigidBody.w / SCALE, 0.5 * rigidBody.h / SCALE);
      }

      var bodyDef = new b2BodyDef;
      // get body def by colision type
      bodyDef.type = bodyTypeMap[rigidBody.bodyType];
      bodyDef.position.x = position.x / SCALE;
      bodyDef.position.y = position.y / SCALE;
      bodyDef.fixedRotation = true;
      var body = this.b2world.CreateBody(bodyDef);
      body.CreateFixture(fixture);

      body.SetUserData(entity);
      this.bodies.push(body);
      this.bodiesByEntity[entity.id] = body;

      return body;
    } else {

      // == body ==
      var bodyDef = new b2BodyDef;
      bodyDef.type = b2Body.b2_staticBody;
      bodyDef.position.x = position.x / SCALE;
      bodyDef.position.y = position.y / SCALE;
      // == body ==
      var body = this.b2world.CreateBody(bodyDef);
      // == body ==

      // == fixture ==
      var fixtureDef = new b2FixtureDef;
      fixtureDef.density = 1;
      fixtureDef.restitution = 1;
      fixtureDef.friction = 0;
      fixtureDef.shape = new b2PolygonShape;
      fixtureDef.shape.SetAsBox(0.5 * rigidBody.w / SCALE, 0.5 * rigidBody.h / SCALE);
      // == fixture ==
      body.CreateFixture(fixtureDef);
      // == fixture ==

      // ==
      body.SetUserData(entity);
      this.bodies.push(body);
      this.bodiesByEntity[entity.id] = body;

      return body;
    }

  };

  window.PhysicsSystem = PhysicsSystem;
})();