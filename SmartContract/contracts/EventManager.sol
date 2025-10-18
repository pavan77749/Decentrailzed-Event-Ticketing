// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IEventTicket.sol";

contract EventManager is Ownable, ReentrancyGuard {
    struct Event {
        uint256 id;
        string name;
        string description;
        uint256 date;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 ticketsSold;
        address payable organizer;
        bool isActive;
        string venue;
    }
    
    mapping(uint256 => Event) public events;
    IEventTicket public ticketContract;
    uint256 public eventCount;
    uint256 public platformFeePercentage = 250; // 2.5%
    
    event EventCreated(
        uint256 indexed eventId, 
        string name, 
        uint256 date, 
        address indexed organizer,
        uint256 ticketPrice,
        uint256 maxTickets
    );
    
    event TicketPurchased(
        uint256 indexed eventId, 
        address indexed buyer, 
        uint256 price,
        uint256 ticketsCount
    );
    
    event EventCancelled(uint256 indexed eventId);
    
    constructor(address _ticketContract) {
        ticketContract = IEventTicket(_ticketContract);
    }
    
    function createEvent(
        string memory _name,
        string memory _description,
        uint256 _date,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        string memory _venue
    ) external {
        require(_date > block.timestamp, "Event date must be in the future");
        require(_maxTickets > 0, "Must have at least one ticket");
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(bytes(_name).length > 0, "Event name cannot be empty");
        
        events[eventCount] = Event({
            id: eventCount,
            name: _name,
            description: _description,
            date: _date,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            ticketsSold: 0,
            organizer: payable(msg.sender),
            isActive: true,
            venue: _venue
        });
        
        emit EventCreated(eventCount, _name, _date, msg.sender, _ticketPrice, _maxTickets);
        eventCount++;
    }
    
    function buyTickets(uint256 _eventId, uint256 _quantity) external payable nonReentrant {
        Event storage eventData = events[_eventId];
        
        require(eventData.isActive, "Event is not active");
        require(eventData.date > block.timestamp, "Event has passed");
        require(_quantity > 0, "Must buy at least one ticket");
        require(eventData.ticketsSold + _quantity <= eventData.maxTickets, "Not enough tickets available");
        
        uint256 totalCost = eventData.ticketPrice * _quantity;
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Calculate platform fee
        uint256 platformFee = (totalCost * platformFeePercentage) / 10000;
        uint256 organizerAmount = totalCost - platformFee;
        
        // Update event data
        eventData.ticketsSold += _quantity;
        
        // Mint tickets
        for (uint256 i = 0; i < _quantity; i++) {
            ticketContract.mintTicket(msg.sender, _eventId);
        }
        
        // Transfer payments
        eventData.organizer.transfer(organizerAmount);
        
        // Refund excess payment
        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }
        
        emit TicketPurchased(_eventId, msg.sender, totalCost, _quantity);
    }
    
    function cancelEvent(uint256 _eventId) external {
        Event storage eventData = events[_eventId];
        require(msg.sender == eventData.organizer || msg.sender == owner(), "Not authorized");
        require(eventData.isActive, "Event already cancelled");
        
        eventData.isActive = false;
        emit EventCancelled(_eventId);
    }
    
    function getEvent(uint256 _eventId) external view returns (Event memory) {
        return events[_eventId];
    }
    
    function getActiveEvents() external view returns (Event[] memory) {
        uint256 activeCount = 0;
        
        // Count active events
        for (uint256 i = 0; i < eventCount; i++) {
            if (events[i].isActive && events[i].date > block.timestamp) {
                activeCount++;
            }
        }
        
        // Create array of active events
        Event[] memory activeEvents = new Event[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < eventCount; i++) {
            if (events[i].isActive && events[i].date > block.timestamp) {
                activeEvents[index] = events[i];
                index++;
            }
        }
        
        return activeEvents;
    }
    
    function setPlatformFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercentage = _feePercentage;
    }
    
    function withdrawPlatformFees() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function setTicketContract(address _ticketContract) external onlyOwner {
        ticketContract = IEventTicket(_ticketContract);
    }
}