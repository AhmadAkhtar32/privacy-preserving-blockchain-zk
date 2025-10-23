pragma circom 2.0.0;

// ✅ Use correct include path for installed circomlib
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";


template TransferCircuit() {
    // Public Inputs
    signal input newCommitment;  // New balance commitment or leaf to be published

    // Private Inputs
    signal input oldBalance;  // Old balance (secret)
    signal input amount;      // Amount to transfer (secret)
    signal input secretKey;   // Secret input to generate new commitment

    // Check that oldBalance >= amount
    component isLessEq = LessEqThan(32); // compare 32-bit numbers
    isLessEq.in[0] <== amount;
    isLessEq.in[1] <== oldBalance;
    isLessEq.out === 1; // enforce oldBalance >= amount

    // Compute new balance = oldBalance - amount
    signal newBalance;
    newBalance <== oldBalance - amount;

    // Generate Poseidon hash commitment of newBalance and secretKey
    component hash = Poseidon(2);
    hash.inputs[0] <== newBalance;
    hash.inputs[1] <== secretKey;

    // Constrain public commitment to match computed Poseidon hash
    hash.out === newCommitment;
}

component main = TransferCircuit();
