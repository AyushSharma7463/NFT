const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const Ticket = await hre.ethers.getContractFactory("TicketNFT");
  const ticket = await Ticket.deploy();

  await ticket.deployed();

  const address = ticket.address;
  const envPath = path.join(__dirname, "..", "frontend", ".env.local");

  fs.writeFileSync(
    envPath,
    `REACT_APP_CONTRACT_ADDRESS=${address}\n`,
    "utf8"
  );

  console.log("DEPLOYED:", address);
  console.log("UPDATED_FRONTEND_ENV:", envPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
