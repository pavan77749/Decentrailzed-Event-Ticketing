// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IEventTicket.sol";

contract EventTicket is ERC721, Ownable, IEventTicket {
    uint256 private _tokenIdCounter;
    
    struct TicketInfo {
        uint256 eventId;
        address originalOwner;
        bool isUsed;
    }
    
    mapping(uint256 => TicketInfo) public ticketInfo;
    mapping(uint256 => mapping(address => uint256)) public ticketBalances;
    mapping(address => bool) public authorizedMinters;
    
    event TicketMinted(address indexed to, uint256 indexed tokenId, uint256 indexed eventId);
    event TicketTransferred(address indexed from, address indexed to, uint256 indexed tokenId);
    
    constructor() ERC721("EventTicket", "ETK") {}
    
    modifier onlyAuthorized() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    function setAuthorizedMinter(address _minter, bool _authorized) external onlyOwner {
        authorizedMinters[_minter] = _authorized;
    }
    
    function mintTicket(address _to, uint256 _eventId) external override onlyAuthorized {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _mint(_to, tokenId);
        
        ticketInfo[tokenId] = TicketInfo({
            eventId: _eventId,
            originalOwner: _to,
            isUsed: false
        });
        
        ticketBalances[_eventId][_to]++;
        
        emit TicketMinted(_to, tokenId, _eventId);
    }
    
    function transferTicket(address _to, uint256 _tokenId) external override {
        require(ownerOf(_tokenId) == msg.sender, "Not ticket owner");
        require(!ticketInfo[_tokenId].isUsed, "Ticket already used");
        
        uint256 eventId = ticketInfo[_tokenId].eventId;
        
        ticketBalances[eventId][msg.sender]--;
        ticketBalances[eventId][_to]++;
        
        _transfer(msg.sender, _to, _tokenId);
        
        emit TicketTransferred(msg.sender, _to, _tokenId);
    }
    
    function balanceOfEvent(address _owner, uint256 _eventId) external view override returns (uint256) {
        return ticketBalances[_eventId][_owner];
    }
    
    function useTicket(uint256 _tokenId) external onlyAuthorized {
        require(_exists(_tokenId), "Ticket does not exist");
        ticketInfo[_tokenId].isUsed = true;
    }
    
    function getTicketInfo(uint256 _tokenId) external view returns (TicketInfo memory) {
        require(_exists(_tokenId), "Ticket does not exist");
        return ticketInfo[_tokenId];
    }
}