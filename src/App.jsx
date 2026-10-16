import React, { useRef, useEffect, useState } from "react";

// --- VECTOR 2D ---
class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
  mult(n) { return new Vec2(this.x * n, this.y * n); }
  dot(v) { return this.x * v.x + this.y * v.y; }
  magSq() { return this.x * this.x + this.y * this.y; }
  mag() { return Math.sqrt(this.magSq()); }
  norm() {
    const m = this.mag();
    return m === 0 ? new Vec2(0, 0) : new Vec2(this.x / m, this.y / m);
  }
}

// --- RIGID BODY ---
class CircleBody {
  constructor(x, y, radius, mass = 1, color = "#38bdf8") {
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

// --- PHYSICS ENGINE ---
class PhysicsWorld {
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

// --- MAIN REACT COMPONENT (Inline Styles, Zero Dependencies) ---
export default function App() {
  const canvasRef = useRef(null);
  const worldRef = useRef(new PhysicsWorld(800, 500));

  const [gravityY, setGravityY] = useState(980);
  const [restitution, setRestitution] = useState(0.75);
  const [spawnMass, setSpawnMass] = useState(2);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);

  useEffect(() => {
    worldRef.current.gravity.y = Number(gravityY);
  }, [gravityY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const world = worldRef.current;

    let animId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.033);
      lastTime = currentTime;

      world.step(dt);

      // Background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, world.width, world.height);

      // Draw Balls
      world.bodies.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff44";
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(b.pos.x, b.pos.y);
        ctx.lineTo(b.pos.x + b.vel.x * 0.05, b.pos.y + b.vel.y * 0.05);
        ctx.strokeStyle = "#ffffffaa";
        ctx.stroke();
      });

      // Draw Slingshot Line
      if (dragStart && dragCurrent) {
        ctx.beginPath();
        ctx.moveTo(dragStart.x, dragStart.y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [dragStart, dragCurrent]);

  const getCanvasCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return new Vec2(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleMouseDown = (e) => {
    const pos = getCanvasCoords(e);
    setDragStart(pos);
    setDragCurrent(pos);
  };

  const handleMouseMove = (e) => {
    if (!dragStart) return;
    setDragCurrent(getCanvasCoords(e));
  };

  const handleMouseUp = () => {
    if (!dragStart || !dragCurrent) return;

    const radius = Math.max(12, Math.sqrt(spawnMass) * 14);
    const colors = ["#38bdf8", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const ball = new CircleBody(dragStart.x, dragStart.y, radius, spawnMass, color);
    ball.restitution = Number(restitution);
    ball.vel = dragStart.sub(dragCurrent).mult(5);

    worldRef.current.addBody(ball);
    setDragStart(null);
    setDragCurrent(null);
  };

  const handleBatch = () => {
    for (let i = 0; i < 15; i++) {
      const radius = 10 + Math.random() * 15;
      const x = 50 + Math.random() * 700;
      const y = 50 + Math.random() * 150;
      const b = new CircleBody(x, y, radius, radius * 0.1, "#06b6d4");
      b.restitution = restitution;
      worldRef.current.addBody(b);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
      <h2>BounceLAB</h2>
      <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "0" }}>
        Click & drag on the canvas to slingshot balls.
      </p>

      {/* Control Bar */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "16px", background: "#1e293b", padding: "12px 20px", borderRadius: "8px" }}>
        <label style={{ display: "flex", flexDirection: "column", fontSize: "12px" }}>
          Gravity: {gravityY}
          <input
            type="range"
            min="0"
            max="2500"
            value={gravityY}
            onChange={(e) => setGravityY(e.target.value)}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", fontSize: "12px" }}>
          Bounciness: {restitution}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={restitution}
            onChange={(e) => setRestitution(e.target.value)}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", fontSize: "12px" }}>
          Mass: {spawnMass} kg
          <input
            type="range"
            min="0.5"
            max="15"
            step="0.5"
            value={spawnMass}
            onChange={(e) => setSpawnMass(e.target.value)}
          />
        </label>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={handleBatch}
            style={{ padding: "6px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Spawn Batch
          </button>
          <button
            onClick={() => worldRef.current.clear()}
            style={{ padding: "6px 12px", background: "#e11d48", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: "2px solid #334155", borderRadius: "8px", cursor: "crosshair" }}
      />
    </div>
  );
}