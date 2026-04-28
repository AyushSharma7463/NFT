// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721, Ownable {

    constructor() ERC721("EventTicket", "ETKT") {}

    uint256 public nextTokenId;
    uint256 public maxTicketsPerWallet = 3;
    uint256 public resaleCooldown = 1 minutes;
    uint256 public maxResalePercent = 110;

    struct TicketData {
        uint256 originalPrice;
        uint256 purchaseTime;
        bool used;
    }

    mapping(uint256 => TicketData) public ticketData;
    mapping(address => uint256) public ticketsOwned;
    mapping(uint256 => uint256) public salePrice;

    event TicketMinted(address buyer, uint256 tokenId, uint256 price);
    event TicketListed(uint256 tokenId, uint256 price);
    event TicketSold(uint256 tokenId, address from, address to, uint256 price);
    event TicketUsed(uint256 tokenId);

    function mintTicket() external payable {
        require(ticketsOwned[msg.sender] < maxTicketsPerWallet, "Limit reached");
        require(msg.value > 0, "Pay required");

        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);

        ticketData[tokenId] = TicketData(msg.value, block.timestamp, false);
        ticketsOwned[msg.sender]++;

        emit TicketMinted(msg.sender, tokenId, msg.value);
    }

    function mintFor(address buyer) external onlyOwner payable {
        require(ticketsOwned[buyer] < maxTicketsPerWallet, "Limit reached");
        require(msg.value > 0, "Pay required");

        uint256 tokenId = nextTokenId++;
        _safeMint(buyer, tokenId);

        ticketData[tokenId] = TicketData(msg.value, block.timestamp, false);
        ticketsOwned[buyer]++;

        emit TicketMinted(buyer, tokenId, msg.value);
    }

    function listTicket(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(!ticketData[tokenId].used, "Used");
        require(price > 0, "Invalid price");

        uint256 maxPrice = (ticketData[tokenId].originalPrice * maxResalePercent) / 100;
        require(price <= maxPrice, "Too high");

        salePrice[tokenId] = price;
        emit TicketListed(tokenId, price);
    }

    function listFor(uint256 tokenId, uint256 price) external onlyOwner {
        require(!ticketData[tokenId].used, "Used");
        require(price > 0, "Invalid price");

        uint256 maxPrice = (ticketData[tokenId].originalPrice * maxResalePercent) / 100;
        require(price <= maxPrice, "Too high");

        salePrice[tokenId] = price;
        emit TicketListed(tokenId, price);
    }

    function cancelListing(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        salePrice[tokenId] = 0;
    }

    function buyTicket(uint256 tokenId) external payable {
        uint256 price = salePrice[tokenId];
        address seller = ownerOf(tokenId);

        require(price > 0, "Not for sale");
        require(msg.value == price, "Wrong price");
        require(msg.sender != seller, "Self buy");

        TicketData storage ticket = ticketData[tokenId];
        require(block.timestamp >= ticket.purchaseTime + resaleCooldown, "Cooldown");

        // effects
        salePrice[tokenId] = 0;
        ticket.purchaseTime = block.timestamp;

        ticketsOwned[seller]--;
        ticketsOwned[msg.sender]++;

        _transfer(seller, msg.sender, tokenId);

        // interaction
        (bool success,) = seller.call{value: msg.value}("");
        require(success, "Payment failed");

        emit TicketSold(tokenId, seller, msg.sender, msg.value);
    }

    function buyFor(uint256 tokenId, address buyer) external onlyOwner payable {
        uint256 price = salePrice[tokenId];
        address seller = ownerOf(tokenId);

        require(price > 0, "Not for sale");
        require(msg.value == price, "Wrong price");
        require(buyer != seller, "Self buy");

        TicketData storage ticket = ticketData[tokenId];
        require(block.timestamp >= ticket.purchaseTime + resaleCooldown, "Cooldown");

        // effects
        salePrice[tokenId] = 0;
        ticket.purchaseTime = block.timestamp;

        ticketsOwned[seller]--;
        ticketsOwned[buyer]++;

        _transfer(seller, buyer, tokenId);

        // interaction
        (bool success,) = seller.call{value: msg.value}("");
        require(success, "Payment failed");

        emit TicketSold(tokenId, seller, buyer, msg.value);
    }

    function validateTicket(uint256 tokenId) external onlyOwner {
        require(!ticketData[tokenId].used, "Already used");
        ticketData[tokenId].used = true;
        emit TicketUsed(tokenId);
    }

    function validateFor(uint256 tokenId) external onlyOwner {
        require(!ticketData[tokenId].used, "Already used");
        ticketData[tokenId].used = true;
        emit TicketUsed(tokenId);
    }

    function withdraw() external onlyOwner {
        (bool success,) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    function switchOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        transferOwnership(newOwner);
    }

    function setCooldown(uint256 newCooldown) external onlyOwner {
        resaleCooldown = newCooldown;
    }

    function _transfer(address from, address to, uint256 tokenId) internal override {
        require(msg.sender == address(this), "Use marketplace");
        super._transfer(from, to, tokenId);
    }

    function approve(address, uint256) public pure override {
        revert("Disabled");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Disabled");
    }
}