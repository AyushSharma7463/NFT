import { useState } from "react";
import "./App.css";

const testAddresses = [
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
];

function App() {
  const [selectedAddress, setSelectedAddress] = useState(testAddresses[0]);
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");

  async function mintTicket() {
    try {
      const response = await fetch("http://localhost:5001/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer: selectedAddress, price: "0.01" }),
      });
      const data = await response.json();
      if (data.success) {
        alert("✅ Ticket Minted! TX: " + data.txHash);
      } else {
        alert("❌ Mint failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Mint failed");
    }
  }

  async function listTicket() {
    try {
      const response = await fetch("http://localhost:5001/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId: parseInt(tokenId), price: parseInt(price) }),
      });
      const data = await response.json();
      if (data.success) {
        alert("✅ Ticket Listed! TX: " + data.txHash);
      } else {
        alert("❌ List failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ List failed");
    }
  }

  async function buyTicket() {
    try {
      const response = await fetch("http://localhost:5001/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId: parseInt(tokenId), buyer: selectedAddress }),
      });
      const data = await response.json();
      if (data.success) {
        alert("✅ Purchased! TX: " + data.txHash);
      } else {
        alert("❌ Buy failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Buy failed");
    }
  }

  async function getSalePrice() {
    try {
      const response = await fetch(`http://localhost:5001/sale-price/${tokenId}`);
      const data = await response.json();
      alert("Sale Price: " + data.price);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to get price");
    }
  }

  async function getTicketsOwned() {
    try {
      const response = await fetch(`http://localhost:5001/tickets/${selectedAddress}`);
      const data = await response.json();
      alert("Tickets Owned: " + data.count);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to get tickets");
    }
  }

  return (
    <div className="container">
      <h1>NFT Ticket Marketplace</h1>

      <div className="section">
        <label htmlFor="address-select">Select Address</label>
        <select
          id="address-select"
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
        >
          {testAddresses.map((address) => (
            <option key={address} value={address}>
              {address}
            </option>
          ))}
        </select>
      </div>

      <div className="section">
        <button onClick={mintTicket}>Mint Ticket</button>
      </div>

      <div className="section">
        <input
          type="number"
          placeholder="Token ID"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price (wei)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button onClick={listTicket}>List Ticket</button>
      </div>

      <div className="section">
        <button onClick={buyTicket}>Buy Ticket</button>
      </div>

      <div className="section">
        <button onClick={getSalePrice}>Get Sale Price</button>
        <button onClick={getTicketsOwned}>Get Tickets Owned</button>
      </div>
    </div>
  );
}

export default App;