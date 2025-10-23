# Privacy ZK Prototype - README

Prereqs: Node.js, npm, circom, snarkjs, Hardhat

1. compile and setup
   circom circuits/transfer.circom --r1cs --wasm --sym -o circuits/build
   snarkjs powersoftau new bn128 12 pot12_0000.ptau
   snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="first" -v
   snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau
   snarkjs groth16 setup circuits/build/transfer.r1cs pot12_final.ptau circuits/build/transfer_0000.zkey
   snarkjs zkey contribute circuits/build/transfer_0000.zkey circuits/build/transfer_final.zkey --name="contrib" -v
   snarkjs zkey export verificationkey circuits/build/transfer_final.zkey circuits/build/verification_key.json

2. generate witness and proof
   node circuits/build/generate_witness.js circuits/build/transfer.wasm circuits/input.json circuits/witness.wtns
   snarkjs groth16 prove circuits/build/transfer_final.zkey circuits/witness.wtns proofs/proof.json proofs/public.json
   snarkjs groth16 verify circuits/build/verification_key.json proofs/public.json proofs/proof.json

3. deploy verifier (Hardhat)
   npx hardhat run scripts/deploy_verifier.js --network localhost

4. verify on chain
   node scripts/verifyOnChain.js
