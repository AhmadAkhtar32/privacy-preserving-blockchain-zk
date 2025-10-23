// scripts/aggregate_dp.js
// Node.js script: compute sum, add Laplace noise, commit seed, sign result
const fs = require('fs');
const crypto = require('crypto');
const { ethers } = require('ethers');

// ---- Config ----
const DATA_PATH = 'data/values.json';
const OUTPUT_PATH = 'scripts/noisy_aggregate.json';

// Laplace sampling via inverse CDF
// scale b (b = sensitivity / epsilon). For sum sensitivity = max_value_range (here assume 1) => choose b = 1/epsilon
function sampleLaplace(seedBuffer, b) {
    // Use seedBuffer as a deterministic random source: derive a uniform in (0,1)
    // We'll use HMAC-SHA256 with incremental counter to build entropy bytes
    const h = crypto.createHmac('sha256', seedBuffer);
    h.update('laplace-sample');
    const digest = h.digest(); // 32 bytes
    // Convert digest to a number in (0,1)
    const intVal = BigInt('0x' + digest.toString('hex'));
    const twoPow = (BigInt(1) << BigInt(digest.length * 8));
    // Uniform u in (0,1)
    const u = Number(intVal) / Number(twoPow);
    // shift to (-0.5, 0.5)
    const uShift = u - 0.5;
    // inverse CDF of Laplace:
    // noise = -b * sgn(uShift) * ln(1 - 2|uShift|)
    const sign = (uShift === 0) ? 1 : Math.sign(uShift);
    const absTerm = Math.abs(uShift);
    const noise = -b * sign * Math.log(1 - 2 * absTerm);
    return noise;
}

function hashHex(buf) {
    return '0x' + crypto.createHash('sha256').update(buf).digest('hex');
}

async function main() {
    // 1) load data
    const values = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')).map(Number);
    const sum = values.reduce((a, b) => a + b, 0);

    // 2) sample a random seed (32 bytes)
    const seed = crypto.randomBytes(32);
    const commitment = hashHex(seed);

    // 3) choose DP params
    // For demo: epsilon = 1.0 (you can change). sensitivity = 1 (if each record changes by at most 1)
    const epsilon = 1.0;
    const sensitivity = 1.0;
    const b = sensitivity / epsilon; // Laplace scale

    // 4) deterministically derive a Laplace noise from seed
    const noise = sampleLaplace(seed, b);
    const noisySum = sum + noise;

    // 5) Sign the result with an example private key (for demo only)
    // WARNING: Use ephemeral key for demo; do NOT publish a real private key.
    const demoPrivateKey = '0x59c6995e998f97a5a004497e5c8b5e1f0e8b8e3a5b7d0f2f86aeea1f6e8b7e97'; // example from ethersjs docs
    const wallet = new ethers.Wallet(demoPrivateKey);
    const message = JSON.stringify({
        noisySum: noisySum,
        commitment: commitment,
        epsilon: epsilon
    });
    const signature = await wallet.signMessage(message);

    // 6) Save output (we include seed for reproducibility demo — in prod seed is secret!)
    const out = {
        sum,
        noisySum,
        noise,
        seed: seed.toString('hex'),
        commitment,
        signature,
        signerAddress: wallet.address,
        epsilon,
        b
    };
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2));
    console.log('Noisy aggregate produced and saved to', OUTPUT_PATH);
    console.log('Signer address:', wallet.address);
    console.log('Commitment (H(seed)):', commitment);
}

main().catch(err => { console.error(err); process.exit(1); });
