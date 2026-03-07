const PARTICLE_CANVAS_CLASS = "sidebar-particles__canvas";
const PARTICLE_CONFIG = Object.freeze({
  density: 0.00008,
  minCount: 26,
  maxCount: 88,
  maxDistance: 120,
  speed: 0.12,
  color: "109, 246, 226",
  lineColor: "45, 212, 191",
});

interface Particle {
  alpha: number;
  size: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

interface RuntimeState {
  animationFrameId: number;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  observer: ResizeObserver;
  particles: Particle[];
}

const runtimeState = new WeakMap<HTMLElement, RuntimeState>();

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const createParticle = (width: number, height: number): Particle => ({
  x: Math.random() * width,
  y: Math.random() * height,
  vx: (Math.random() - 0.5) * PARTICLE_CONFIG.speed,
  vy: (Math.random() - 0.5) * PARTICLE_CONFIG.speed,
  size: 1.4 + Math.random() * 2.2,
  alpha: 0.14 + Math.random() * 0.28,
});

const syncCanvasSize = (
  container: HTMLElement,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
): { height: number; width: number } => {
  const devicePixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(container.clientWidth));
  const height = Math.max(1, Math.floor(container.clientHeight));
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.width = Math.max(1, Math.floor(width * devicePixelRatio));
  canvas.height = Math.max(1, Math.floor(height * devicePixelRatio));
  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  return { width, height };
};

const ensureParticleCount = (particles: Particle[], width: number, height: number): void => {
  const targetCount = clamp(
    Math.round(width * height * PARTICLE_CONFIG.density),
    PARTICLE_CONFIG.minCount,
    PARTICLE_CONFIG.maxCount,
  );

  if (particles.length > targetCount) {
    particles.splice(targetCount);
    return;
  }

  while (particles.length < targetCount) {
    particles.push(createParticle(width, height));
  }
};

const drawFrame = (container: HTMLElement, state: RuntimeState): void => {
  const { canvas, context, particles } = state;
  const { width, height } = syncCanvasSize(container, canvas, context);
  ensureParticleCount(particles, width, height);
  context.clearRect(0, 0, width, height);

  for (const particle of particles) {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x <= 0 || particle.x >= width) {
      particle.vx *= -1;
      particle.x = clamp(particle.x, 0, width);
    }

    if (particle.y <= 0 || particle.y >= height) {
      particle.vy *= -1;
      particle.y = clamp(particle.y, 0, height);
    }

    context.beginPath();
    context.fillStyle = `rgba(${PARTICLE_CONFIG.color}, ${particle.alpha})`;
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
  }

  for (let index = 0; index < particles.length; index += 1) {
    const source = particles[index];
    for (let compareIndex = index + 1; compareIndex < particles.length; compareIndex += 1) {
      const target = particles[compareIndex];
      const deltaX = source.x - target.x;
      const deltaY = source.y - target.y;
      const distance = Math.hypot(deltaX, deltaY);
      if (distance > PARTICLE_CONFIG.maxDistance) {
        continue;
      }

      const opacity = (1 - distance / PARTICLE_CONFIG.maxDistance) * 0.22;
      context.beginPath();
      context.strokeStyle = `rgba(${PARTICLE_CONFIG.lineColor}, ${opacity.toFixed(3)})`;
      context.lineWidth = 1;
      context.moveTo(source.x, source.y);
      context.lineTo(target.x, target.y);
      context.stroke();
    }
  }

  state.animationFrameId = window.requestAnimationFrame(() => drawFrame(container, state));
};

export const resetSidebarParticles = (container: HTMLElement | null): void => {
  if (!container) {
    return;
  }

  const state = runtimeState.get(container);
  if (state) {
    window.cancelAnimationFrame(state.animationFrameId);
    state.observer.disconnect();
    runtimeState.delete(container);
  }

  container.innerHTML = "";
  delete container.dataset.particlesReady;
};

export const initSidebarParticles = async (container: HTMLElement | null): Promise<void> => {
  if (!container) {
    return;
  }

  if (container.dataset.particlesReady === "1") {
    return;
  }

  resetSidebarParticles(container);

  const canvas = document.createElement("canvas");
  canvas.className = PARTICLE_CANVAS_CLASS;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.display = "block";
  container.append(canvas);

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const state: RuntimeState = {
    animationFrameId: 0,
    canvas,
    context,
    observer: new ResizeObserver(() => {
      const { width, height } = syncCanvasSize(container, canvas, context);
      ensureParticleCount(state.particles, width, height);
    }),
    particles: [],
  };

  state.observer.observe(container);
  runtimeState.set(container, state);
  container.dataset.particlesReady = "1";
  drawFrame(container, state);
};
