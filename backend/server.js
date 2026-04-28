const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5001;

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const abi = [
  "function mintTicket() payable",
  "function mintFor(address) payable",
  "function listTicket(uint256,uint256)",
  "function listFor(uint256,uint256)",
  "function buyTicket(uint256) payable",
  "function buyFor(uint256,address) payable",
  "function salePrice(uint256) view returns(uint256)",
  "function ownerOf(uint256) view returns(address)",
  "function switchOwnership(address)",
  "function validateTicket(uint256)",
  "function ticketsOwned(address) view returns(uint256)",
  "function ticketData(uint256) view returns(uint256,uint256,bool)",
  "function setCooldown(uint256)"
];

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);

let events = [];


app.get("/events", (req, res) => {
  res.json(events);
});


app.post("/events", (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const newEvent = {
    id: Date.now(),
    name,
    price
  };

  events.push(newEvent);
  res.json(newEvent);
});

// Contract interaction endpoints
app.post("/mint", async (req, res) => {
  try {
    const { buyer, price } = req.body;
    const tx = await contract.mintFor(buyer, { value: ethers.parseEther(price.toString()) });
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/list", async (req, res) => {
  try {
    const { tokenId, price } = req.body;
    const tx = await contract.listFor(tokenId, price);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/buy", async (req, res) => {
  try {
    const { tokenId, buyer } = req.body;
    let salePrice = await contract.salePrice(tokenId);

    if (typeof salePrice === "string") {
      salePrice = BigInt(salePrice);
    }

    if (salePrice === 0n || salePrice === 0) {
      return res.status(400).json({ error: "Ticket not for sale" });
    }

    const tx = await contract.buyFor(tokenId, buyer, { value: salePrice });
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/tickets/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const count = await contract.ticketsOwned(address);
    res.json({ count: count.toNumber() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/sale-price/:tokenId", async (req, res) => {
  try {
    const tokenId = req.params.tokenId;
    const price = await contract.salePrice(tokenId);
    res.json({ price: price.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/switch-ownership", async (req, res) => {
  try {
    const { newOwner } = req.body;
    const tx = await contract.switchOwnership(newOwner);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/set-cooldown", async (req, res) => {
  try {
    const { cooldown } = req.body; // in seconds
    const tx = await contract.setCooldown(cooldown);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
