import { Vec2 } from "./Vec2.js";

export class CircleBody {
  constructor(x, y, radius, mass = 1, color = "#3b82f6") {
    this.pos = new Vec2(x, y);
    this.vel = new Vec2(0, 0);
    this.acc = new Vec2(0, 0);
    this.radius = radius;
    this.mass = mass;
    this.invMass = mass === 0 ? 0 : 1 / mass;
    this.restitution = 0.75;
    this.color = color;
  }

  applyForce(force) {
    this.acc = this.acc.add(force.mult(this.invMass));
  }

  integrate(dt) {
    if (this.invMass === 0) return;
    this.vel = this.vel.add(this.acc.mult(dt));
    this.pos = this.pos.add(this.vel.mult(dt));
    this.acc = new Vec2(0, 0);
  }
}

// Support both import styles (named and default)
export default CircleBody;