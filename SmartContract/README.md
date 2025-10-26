# EventChain - Decentralized Event Ticketing Platform

[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.26.1-yellow.svg)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-4.9.0-green.svg)](https://openzeppelin.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A fully decentralized event ticketing platform built on Ethereum, featuring NFT-based tickets, secure payments, and transparent event management. This project eliminates intermediaries, prevents ticket fraud, and enables seamless peer-to-peer ticket transfers.

## 🌟 Features

### Core Functionality
- **NFT Tickets**: Each ticket is a unique ERC-721 token preventing counterfeiting
- **Event Management**: Complete CRUD operations for event organizers
- **Secure Payments**: Smart contract-based escrow with platform fees
- **Ticket Transfers**: Seamless P2P ticket transfers with ownership verification
- **Anti-Fraud**: Blockchain-based verification prevents double-spending

### Smart Contract Architecture
- **EventManager.sol**: Main contract handling event creation and ticket sales
- **EventTicket.sol**: ERC-721 implementation for NFT tickets
- **IEventTicket.sol**: Interface ensuring contract interoperability
- **Upgradeable**: Built with OpenZeppelin's upgradeable contracts pattern

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  EventManager   │    │  EventTicket    │
│   (React)       │◄──►│   Contract      │◄──►│   (ERC-721)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MetaMask      │    │   Ethereum      │    │   IPFS          │
│   Wallet        │    │   Network       │    │   (Metadata)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn
- MetaMask wallet
- Ethereum testnet ETH (Sepolia)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/eventchain-ticketing.git
cd eventchain-ticketing
```

2. **Install dependencies**
```bash
# Smart contracts
cd SmartContract
npm install

# Frontend
cd ../frontend
npm install
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.sample .env

# Add your configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

### Deployment

1. **Compile contracts**
```bash
npx hardhat compile
```

2. **Run tests**
```bash
npx hardhat test
```

3. **Deploy to local network**
```bash
# Terminal 1: Start local node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deployEventTicketing.js --network localhost
```

4. **Deploy to Sepolia testnet**
```bash
npx hardhat run scripts/deployEventTicketing.js --network sepolia
```

5. **Start frontend**
```bash
cd frontend
npm start
```

## 📋 Smart Contract API

### EventManager Contract

#### Core Functions
```solidity
function createEvent(
    string memory _name,
    string memory _description,
    uint256 _date,
    uint256 _ticketPrice,
    uint256 _maxTickets,
    string memory _venue
) external

function buyTickets(uint256 _eventId, uint256 _quantity) external payable

function getActiveEvents() external view returns (Event[] memory)

function cancelEvent(uint256 _eventId) external
```

#### Events
```solidity
event EventCreated(uint256 indexed eventId, string name, uint256 date, address indexed organizer, uint256 ticketPrice, uint256 maxTickets)

event TicketPurchased(uint256 indexed eventId, address indexed buyer, uint256 price, uint256 ticketsCount)
```

### EventTicket Contract (ERC-721)

#### Core Functions
```solidity
function mintTicket(address _to, uint256 _eventId) external

function transferTicket(address _to, uint256 _tokenId) external

function balanceOfEvent(address _owner, uint256 _eventId) external view returns (uint256)

function getTicketInfo(uint256 _tokenId) external view returns (TicketInfo memory)
```

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test file
npx hardhat test test/EventTicketing.test.js
```

### Test Coverage
- ✅ Event creation and validation
- ✅ Ticket purchasing with various scenarios
- ✅ Access control and permissions
- ✅ Edge cases and error handling
- ✅ Gas optimization verification

## 🔧 Configuration

### Network Configuration
```javascript
// hardhat.config.js
networks: {
  hardhat: {
    chainId: 31337
  },
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

### Contract Addresses

#### Sepolia Testnet
- **EventManager**: `0x1088fAb41AB416A6968d6219857Ae085ee593237`
- **EventTicket**: `0xd49Ac8899558EBc3d4dc75e59f6FFCe3FAe44827`

## 🛡️ Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Role-based permissions using OpenZeppelin
- **Input Validation**: Comprehensive parameter validation
- **Overflow Protection**: SafeMath integration for arithmetic operations
- **Pausable**: Emergency pause functionality for critical situations

## 💰 Tokenomics

- **Platform Fee**: 2.5% (configurable by owner)
- **Gas Optimization**: Efficient contract design minimizes transaction costs
- **Batch Operations**: Support for bulk ticket purchases
- **Refund Mechanism**: Automatic refunds for cancelled events

## 🔄 Upgrade Path

The contracts are designed with upgradeability in mind:

1. **Proxy Pattern**: Uses OpenZeppelin's upgradeable contracts
2. **Storage Layout**: Maintains compatibility across versions
3. **Migration Scripts**: Automated upgrade deployment scripts

## 📊 Gas Optimization

| Function | Gas Cost | Optimization |
|----------|----------|--------------|
| createEvent | ~180,000 | Struct packing |
| buyTickets | ~120,000 | Batch minting |
| transferTicket | ~85,000 | Direct transfer |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Solidity style guide
- Add comprehensive tests for new features
- Update documentation for API changes
- Ensure gas optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Frontend Demo**: [https://eventchain-demo.vercel.app](https://eventchain-demo.vercel.app)
- **Documentation**: [https://docs.eventchain.dev](https://docs.eventchain.dev)
- **Etherscan**: [View on Etherscan](https://sepolia.etherscan.io/address/0x1088fAb41AB416A6968d6219857Ae085ee593237)

---

**Built with ❤️ by the PAVAN GUPTA **
