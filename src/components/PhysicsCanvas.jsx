import React, { useRef, useEffect, useState } from "react";
import { Vec2 } from "../physics/Vec2";
import { CircleBody } from "../physics/CircleBody";

export function PhysicsCanvas({ world, spawnMass, restitution }) {
  const canvasRef = useRef(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragCurrent, setDragCurrent] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.033);
      lastTime = currentTime;

      world.step(dt);

      // Clear Canvas
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, world.width, world.height);

      // Render Bodies
      world.bodies.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff44";
        ctx.stroke();

        // Velocity vector trail
        ctx.beginPath();
        ctx.moveTo(b.pos.x, b.pos.y);
        ctx.lineTo(b.pos.x + b.vel.x * 0.05, b.pos.y + b.vel.y * 0.05);
        ctx.strokeStyle = "#ffffff88";
        ctx.stroke();
      });

      // Render slingshot aim line
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
  }, [world, dragStart, dragCurrent]);

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
    const colorChoices = ["#38bdf8", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6"];
    const randomColor = colorChoices[Math.floor(Math.random() * colorChoices.length)];

    const ball = new CircleBody(dragStart.x, dragStart.y, radius, spawnMass, randomColor);
    ball.restitution = restitution;
    ball.vel = dragStart.sub(dragCurrent).mult(5); // Launch force

    world.addBody(ball);
    setDragStart(null);
    setDragCurrent(null);
  };

  return (
    <div className="border-4 border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <canvas
        ref={canvasRef}
        width={world.width}
        height={world.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="cursor-crosshair block"
      />
    </div>
  );
}