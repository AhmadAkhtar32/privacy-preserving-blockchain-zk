// verifyOnChain.js
const fs = require('fs');
const { ethers } = require('ethers');

async function main() {
    // Use Hardhat provider
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    const signer = provider.getSigner(0);

    // Addresses: update with deployed addresses from deploy script
    const attrAddr = "<PASTE_ATTRIBUTE_VERIFIER_ADDRESS>";
    const transferAddr = "<PASTE_TRANSFER_VERIFIER_ADDRESS>";

    // Load ABI & connect
    const attrAbi = JSON.parse(fs.readFileSync("artifacts/contracts/AttributeVerifier.sol/AttributeVerifier.json")).abi;
    const attr = new ethers.Contract(attrAddr, attrAbi, signer);

    // Load proof & public signals (example for attribute)
    const proof = JSON.parse(fs.readFileSync("proofs/attribute_proof.json"));
    const publicSignals = JSON.parse(fs.readFileSync("proofs/attribute_public.json"));

    // the contract expects proof as calldata - depends on verifier generation
    // snarkjs provides a helper to build calldata; here we assume you converted it. 
    // If using snarkjs, use `snarkjs zkey export soliditycall` or precompute calldata from proofs.
    // For simplicity in demo, use off-chain verify via snarkjs as primary. If you want, I can convert proof -> calldata for you.
    console.log("Proof loaded. In an on-chain demo you would call verifyProof(...) and check return value.");
}

main();
