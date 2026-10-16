# BounceLab

A lightweight 2D circle-body physics engine written from scratch with HTML5 Canvas and React. It features impulse-based collision resolution, momentum transfer between bodies, interactive mouse launching, and sub-stepping to reduce tunneling.

<!-- Add a screenshot or GIF here: ![Demo](docs/demo.gif) -->
<!-- Add a live demo link here if deployed. -->

---

## 🚀 Features

- **Semi-Implicit Euler Integration**: Velocity is updated before position, which is more stable than explicit Euler.
- **Impulse-Based Collision Resolution**: Resolves circle-circle collisions using conservation of linear momentum and a coefficient of restitution ($e$).
- **Positional Penetration Correction**: Pushes overlapping bodies apart in proportion to their inverse masses, reducing sinking and jitter in resting contacts.
- **Sub-Stepping**: Splits each rendered frame into 8 physics ticks (`subSteps = 8`) to reduce tunneling at high speeds. It does not eliminate it: there is no continuous collision detection, so extremely fast bodies can still pass through each other.
- **Interactive Mouse Slingshot**: Click and drag on the canvas to launch a body with variable force and direction.
- **Live Controls**: Adjust gravity, restitution (bounciness), and projectile mass in real time.

---

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) (18 or 19)
- **Bundler / Dev Server**: [Vite](https://vitejs.dev/)
- **Rendering**: HTML5 Canvas API (via React `useRef` + `requestAnimationFrame`)
- **Styling**: Vanilla CSS

---

## 📂 Project Structure

```text
src/
├── physics/
│   ├── Vec2.js            # 2D vector math (dot, normalize, magnitude)
│   ├── CircleBody.js      # Body state (position, velocity, mass, restitution)
│   └── PhysicsWorld.js    # Simulation loop, collision detection, and solver
├── components/
│   ├── Controls.jsx       # UI sliders and buttons
│   └── PhysicsCanvas.jsx  # Canvas lifecycle, input handling, and rendering
├── App.jsx                # Root layout
├── main.jsx               # Entry point
└── index.css              # Global styles
```

---

## ⚙️ Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/codewith-Ranjeet/BounceLab.git
cd BounceLab
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open http://localhost:5173 (or the port shown in your terminal).

### 4. Build for production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## 🎮 Using the Simulation

- **Launch a body (slingshot)**: Click on the canvas, drag backwards to aim, and release to shoot. A dashed red line shows direction and launch power.
- **Bounciness slider**: Sets the coefficient of restitution. `0.0` is perfectly inelastic (like clay); `1.0` is perfectly elastic.
- **Gravity slider**: Set to `0` for zero-gravity billiards, or raise it to simulate heavy planetary gravity.
- **Mass slider**: Increase the projectile's mass to launch heavy bodies that push lighter ones aside.
- **Spawn Batch**: Drops a random assortment of bodies to test stacking and collision stability under load.
- **Clear**: Removes all bodies from the canvas.

---

## 📐 Physics Reference

### 1. Semi-Implicit Euler Integration

$$
\vec{v}_{t+1} = \vec{v}_t + \vec{a}\,\Delta t
$$

$$
\vec{x}_{t+1} = \vec{x}_t + \vec{v}_{t+1}\,\Delta t
$$

### 2. Impulse Magnitude

For two bodies with masses $m_1, m_2$, relative velocity $\vec{v}_{rel}$, and collision normal $\hat{n}$:

$$
J = \frac{-(1 + e)\,(\vec{v}_{rel} \cdot \hat{n})}{\frac{1}{m_1} + \frac{1}{m_2}}
$$

Each body's velocity changes by $\pm J\hat{n}/m_i$.

### 3. Penetration Correction

The total correction is split between the bodies by inverse mass, so the lighter body moves more:

$$
\Delta \vec{p}_i = \pm\,\hat{n}\cdot \text{penetration}\cdot\frac{1/m_i}{\frac{1}{m_1} + \frac{1}{m_2}}
$$

---

## 🧭 Limitations & Roadmap

**Current limitations**
- Circle-circle collisions only (no polygons or rotation)
- No continuous collision detection, so very fast bodies can still tunnel
- Positional correction is basic; deep stacks may jitter

**Planned**
- [ ] Rigid polygon bodies (SAT collision detection)
- [ ] Angular velocity and friction
- [ ] Spatial partitioning (grid or quadtree) to replace O(n²) collision checks

## 👤 Author

Built by [Ranjeet Shinde](https://github.com/codewith-Ranjeet) to learn how physics engines work from the ground up: integration, impulse resolution, and collision handling, all implemented without a physics library.
