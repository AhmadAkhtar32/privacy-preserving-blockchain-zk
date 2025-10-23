import { readFileSync } from "fs";
import { verifyMessage } from "ethers";

// Read JSON file manually
const data = JSON.parse(
    readFileSync(new URL("./noisy_aggregate.json", import.meta.url), "utf-8")
);

const walletAddr = data.signerAddress;
const message = JSON.stringify({
    noisySum: data.noisySum,
    commitment: data.commitment,
    epsilon: data.epsilon
});
const signature = data.signature;

async function verify() {
    try {
        // ethers v6 verify
        const recovered = await verifyMessage(message, signature);

        console.log("🔎 Recovered address:", recovered);
        console.log("🧾 Original signer:  ", walletAddr);
        console.log("✅ Matches signer:", recovered.toLowerCase() === walletAddr.toLowerCase());
    } catch (error) {
        console.error("❌ Verification failed:", error);
    }
}

verify();
