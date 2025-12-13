// server/utils/perlinNoise.js
class PerlinNoise {
    constructor(seed = Math.random()) {
        this.seed = seed;
        this.gradients = {};
        this.memory = {};
    }

    randomGradient(ix, iy) {
        const key = `${ix},${iy}`;
        if (this.gradients[key]) return this.gradients[key];
        
        const random = 2920 * Math.sin(ix * 21942 + iy * 171324 + 8912) * Math.cos(ix * 23157 * iy * 217832 + 9758);
        const gradient = { x: Math.cos(random), y: Math.sin(random) };
        this.gradients[key] = gradient;
        return gradient;
    }

    dotGridGradient(ix, iy, x, y) {
        const gradient = this.randomGradient(ix, iy);
        const dx = x - ix;
        const dy = y - iy;
        return dx * gradient.x + dy * gradient.y;
    }

    interpolate(a0, a1, w) {
        return (a1 - a0) * ((w * (w * 6.0 - 15.0) + 10.0) * w * w * w) + a0;
    }

    noise(x, y) {
        const x0 = Math.floor(x);
        const x1 = x0 + 1;
        const y0 = Math.floor(y);
        const y1 = y0 + 1;

        const sx = x - x0;
        const sy = y - y0;

        const n0 = this.dotGridGradient(x0, y0, x, y);
        const n1 = this.dotGridGradient(x1, y0, x, y);
        const ix0 = this.interpolate(n0, n1, sx);

        const n2 = this.dotGridGradient(x0, y1, x, y);
        const n3 = this.dotGridGradient(x1, y1, x, y);
        const ix1 = this.interpolate(n2, n3, sx);

        return this.interpolate(ix0, ix1, sy);
    }

    octaveNoise(x, y, octaves = 4, persistence = 0.5) {
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.noise(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= 2;
        }

        return total / maxValue;
    }
}

module.exports = PerlinNoise;