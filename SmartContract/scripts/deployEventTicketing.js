const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Event Ticketing System...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy EventTicket contract first
  const EventTicket = await ethers.getContractFactory("EventTicket");
  const eventTicket = await EventTicket.deploy();
  await eventTicket.deployed();
  console.log("EventTicket deployed to:", eventTicket.address);

  // Deploy EventManager contract
  const EventManager = await ethers.getContractFactory("EventManager");
  const eventManager = await EventManager.deploy(eventTicket.address);
  await eventManager.deployed();
  console.log("EventManager deployed to:", eventManager.address);

  // Set EventManager as authorized minter for EventTicket
  await eventTicket.setAuthorizedMinter(eventManager.address, true);
  console.log("EventManager authorized as minter for EventTicket");

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log("EventTicket:", eventTicket.address);
  console.log("EventManager:", eventManager.address);
  
  // Save deployment addresses to a file
  const fs = require('fs');
  const deploymentInfo = {
    network: "localhost", // Change this based on your network
    eventTicket: eventTicket.address,
    eventManager: eventManager.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    'deployment-addresses.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment addresses saved to deployment-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });