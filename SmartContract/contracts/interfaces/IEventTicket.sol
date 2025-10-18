// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IEventTicket {
    function mintTicket(address _to, uint256 _eventId) external;
    function transferTicket(address _to, uint256 _eventId) external;
    function balanceOfEvent(address _owner, uint256 _eventId) external view returns (uint256);
}