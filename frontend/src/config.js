// Contract addresses from deployment
export const CONTRACT_ADDRESSES = {
  EVENT_MANAGER: "0x1088fAb41AB416A6968d6219857Ae085ee593237",
  EVENT_TICKET: "0xd49Ac8899558EBc3d4dc75e59f6FFCe3FAe44827"
};

// Contract ABIs (simplified for demo)
export const EVENT_MANAGER_ABI = [
  "function createEvent(string memory _name, string memory _description, uint256 _date, uint256 _ticketPrice, uint256 _maxTickets, string memory _venue) external",
  "function buyTickets(uint256 _eventId, uint256 _quantity) external payable",
  "function getEvent(uint256 _eventId) external view returns (tuple(uint256 id, string name, string description, uint256 date, uint256 ticketPrice, uint256 maxTickets, uint256 ticketsSold, address organizer, bool isActive, string venue))",
  "function getActiveEvents() external view returns (tuple(uint256 id, string name, string description, uint256 date, uint256 ticketPrice, uint256 maxTickets, uint256 ticketsSold, address organizer, bool isActive, string venue)[])",
  "function eventCount() external view returns (uint256)",
  "event EventCreated(uint256 indexed eventId, string name, uint256 date, address indexed organizer, uint256 ticketPrice, uint256 maxTickets)",
  "event TicketPurchased(uint256 indexed eventId, address indexed buyer, uint256 price, uint256 ticketsCount)"
];

export const EVENT_TICKET_ABI = [
  "function balanceOfEvent(address _owner, uint256 _eventId) external view returns (uint256)",
  "function getTicketInfo(uint256 _tokenId) external view returns (tuple(uint256 eventId, address originalOwner, bool isUsed))",
  "function transferTicket(address _to, uint256 _tokenId) external"
];

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia
  chainName: "Sepolia Test Network",
  rpcUrls: ["https://sepolia.infura.io/v3/"],
  blockExplorerUrls: ["https://sepolia.etherscan.io/"]
};