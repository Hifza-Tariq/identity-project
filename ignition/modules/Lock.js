// ignition/modules/Lock.js

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const LockModule = buildModule("LockModule", (m) => {
    // Get the current timestamp
    const currentTimestamp = Math.floor(Date.now() / 1000);
    // Add 24 hours (in seconds) to current timestamp for unlock time
    const unlockTime = currentTimestamp + 86400; // 24 hours from now

    // Deploy the Lock contract with unlock time and value of 0.1 ETH
    const lock = m.contract("Lock", [unlockTime], {
        value: m.etherValue("0.1")  // Send 0.1 ETH during deployment
    });
    
    return { lock };
});

module.exports = LockModule;