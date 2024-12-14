export const createParticle = (x: number, y: number, color: string) => {
  return {
    x,
    y,
    radius: Math.random() * 3 + 2,
    color,
    velocity: {
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 4
    },
    life: 100
  }
}
