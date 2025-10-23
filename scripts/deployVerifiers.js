// deployVerifiers.js
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with", deployer.address);

    const Attribute = await ethers.getContractFactory("AttributeVerifier");
    const attr = await Attribute.deploy();
    await attr.deployed();
    console.log("Attribute Verifier:", attr.address);

    const Transfer = await ethers.getContractFactory("TransferVerifier");
    const t = await Transfer.deploy();
    await t.deployed();
    console.log("Transfer Verifier:", t.address);
}

main().catch((e) => { console.error(e); process.exit(1); });
