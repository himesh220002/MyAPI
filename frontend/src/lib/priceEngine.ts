// 1. Volatility Profiles
export const PROFILES: Record<string, { base: number; max: number }> = {
    crypto: { base: 0.05, max: 0.15 },
    currency: { base: 0.01, max: 0.03 },
    mineral: { base: 0.04, max: 0.10 },
    trade: { base: 0.05, max: 0.12 }
};

// 2. Gaussian Noise Generator (For realistic randomness)
export function gaussianNoise(stdDev = 1) {
    let u1 = Math.random(), u2 = Math.random();
    return Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2) * stdDev;
}

// 3. The Variation Calculator
export function calculateNewPrice(currentAsset: any, type: string = 'crypto') {
    const profile = PROFILES[type] || PROFILES.crypto;
    const currentPrice = currentAsset.price || 0;
    const history = currentAsset.history || {};

    // Determine Bias based on Trend
    let bias = 0;
    if (currentAsset.market?.trend === 'bullish') bias = 0.005;
    if (currentAsset.market?.trend === 'bearish') bias = -0.005;

    // Generate Variation using Gaussian Noise + Trend Bias
    const variation = gaussianNoise(profile.base) + bias;

    // Clamp variation to Max Daily Change
    const clampedVariation = Math.max(-profile.max, Math.min(profile.max, variation));

    let newPrice = currentPrice * (1 + clampedVariation);

    // Update History stats
    const newHistory = {
        avg: Number(((history.avg || newPrice) * 0.9 + newPrice * 0.1).toFixed(2)),
        low: Number(Math.min(history.low || newPrice, newPrice).toFixed(2)),
        high: Number(Math.max(history.high || newPrice, newPrice).toFixed(2))
    };

    return {
        price: Number(newPrice.toFixed(2)),
        change: Number((clampedVariation * 100).toFixed(2)),
        history: newHistory
    };
}
