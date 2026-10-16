import { Vec2 } from "./Vec2.js";

export class PhysicsWorld {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.bodies = [];
    this.gravity = new Vec2(0, 980);
    this.subSteps = 8;
  }

  addBody(body) {
    this.bodies.push(body);
  }

  clear() {
    this.bodies = [];
  }

  step(dt) {
    const subDt = dt / this.subSteps;

    for (let step = 0; step < this.subSteps; step++) {
      for (const b of this.bodies) {
        if (b.invMass > 0) {
          b.applyForce(this.gravity.mult(b.mass));
          b.integrate(subDt);
        }
      }

      for (let i = 0; i < this.bodies.length; i++) {
        for (let j = i + 1; j < this.bodies.length; j++) {
          this.resolveCollision(this.bodies[i], this.bodies[j]);
        }
      }

      for (const b of this.bodies) {
        this.resolveWallCollisions(b);
      }
    }
  }

  resolveCollision(b1, b2) {
    const delta = b2.pos.sub(b1.pos);
    const distSq = delta.magSq();
    const minDist = b1.radius + b2.radius;

    if (distSq >= minDist * minDist || distSq === 0) return;

    const dist = Math.sqrt(distSq);
    const normal = delta.norm();

    const penetration = minDist - dist;
    const totalInvMass = b1.invMass + b2.invMass;
    if (totalInvMass === 0) return;

    const correction = normal.mult(penetration / totalInvMass);
    b1.pos = b1.pos.sub(correction.mult(b1.invMass));
    b2.pos = b2.pos.add(correction.mult(b2.invMass));

    const relVel = b2.vel.sub(b1.vel);
    const velAlongNormal = relVel.dot(normal);

    if (velAlongNormal > 0) return;

    const e = Math.min(b1.restitution, b2.restitution);
    const impulseScalar = (-(1 + e) * velAlongNormal) / totalInvMass;
    const impulse = normal.mult(impulseScalar);

    b1.vel = b1.vel.sub(impulse.mult(b1.invMass));
    b2.vel = b2.vel.add(impulse.mult(b2.invMass));
  }

  resolveWallCollisions(b) {
    if (b.pos.x - b.radius < 0) {
      b.pos.x = b.radius;
      b.vel.x = -b.vel.x * b.restitution;
    } else if (b.pos.x + b.radius > this.width) {
      b.pos.x = this.width - b.radius;
      b.vel.x = -b.vel.x * b.restitution;
    }

    if (b.pos.y - b.radius < 0) {
      b.pos.y = b.radius;
      b.vel.y = -b.vel.y * b.restitution;
    } else if (b.pos.y + b.radius > this.height) {
      b.pos.y = this.height - b.radius;
      b.vel.y = -b.vel.y * b.restitution;
      b.vel.x *= 0.98;
    }
  }
}

export default PhysicsWorld;