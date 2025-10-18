import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function UserTickets({ eventManagerContract, eventTicketContract, account }) {
  const [userTickets, setUserTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserTickets();
  }, [eventManagerContract, eventTicketContract, account]);

  const loadUserTickets = async () => {
    if (!eventManagerContract || !eventTicketContract || !account) return;

    try {
      setLoading(true);
      setError('');

      // Get total number of events
      const eventCount = await eventManagerContract.eventCount();
      const tickets = [];

      // Check each event for user's tickets
      for (let i = 0; i < eventCount.toNumber(); i++) {
        try {
          const ticketBalance = await eventTicketContract.balanceOfEvent(account, i);
          
          if (ticketBalance.toNumber() > 0) {
            const event = await eventManagerContract.getEvent(i);
            
            tickets.push({
              eventId: i,
              eventName: event.name,
              eventDescription: event.description,
              eventDate: new Date(event.date.toNumber() * 1000),
              venue: event.venue,
              ticketCount: ticketBalance.toNumber(),
              organizer: event.organizer,
              isActive: event.isActive
            });
          }
        } catch (error) {
          console.error(`Error checking tickets for event ${i}:`, error);
        }
      }

      setUserTickets(tickets);
    } catch (error) {
      console.error('Error loading user tickets:', error);
      setError('Failed to load your tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventPast = (eventDate) => {
    return eventDate < new Date();
  };

  const getEventStatus = (ticket) => {
    if (!ticket.isActive) return { text: 'Cancelled', color: '#d63031' };
    if (isEventPast(ticket.eventDate)) return { text: 'Past Event', color: '#636e72' };
    return { text: 'Upcoming', color: '#00b894' };
  };

  if (loading) {
    return <div className="loading">Loading your tickets...</div>;
  }

  if (error) {
    return (
      <div className="component-card">
        <div className="error">{error}</div>
        <button onClick={loadUserTickets} className="btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="component-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>My Tickets</h2>
        <button onClick={loadUserTickets} className="btn btn-secondary">
          Refresh
        </button>
      </div>

      {userTickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h3>No tickets found</h3>
          <p>You haven't purchased any tickets yet.</p>
          <p>Browse available events to get started!</p>
        </div>
      ) : (
        <>
          <div style={{ 
            background: '#e3f2fd', 
            padding: '1rem', 
            borderRadius: '10px', 
            marginBottom: '1.5rem',
            border: '1px solid #bbdefb'
          }}>
            <p><strong>Total Events:</strong> {userTickets.length}</p>
            <p><strong>Total Tickets:</strong> {userTickets.reduce((sum, ticket) => sum + ticket.ticketCount, 0)}</p>
          </div>

          <div className="event-grid">
            {userTickets.map((ticket) => {
              const status = getEventStatus(ticket);
              
              return (
                <div key={ticket.eventId} className="event-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3>{ticket.eventName}</h3>
                    <span style={{ 
                      background: status.color, 
                      color: 'white', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '15px', 
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {status.text}
                    </span>
                  </div>

                  <p><strong>📍 Venue:</strong> {ticket.venue}</p>
                  <p><strong>📅 Date:</strong> {formatDate(ticket.eventDate)}</p>
                  <p><strong>📝 Description:</strong> {ticket.eventDescription}</p>

                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    margin: '1rem 0',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea' }}>
                      🎫 {ticket.ticketCount} Ticket{ticket.ticketCount > 1 ? 's' : ''}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                      Event ID: {ticket.eventId}
                    </p>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#888' }}>
                    Organizer: {ticket.organizer.slice(0, 6)}...{ticket.organizer.slice(-4)}
                  </p>

                  {!ticket.isActive && (
                    <div style={{ 
                      background: '#ffe6e6', 
                      color: '#d63031', 
                      padding: '0.5rem', 
                      borderRadius: '5px', 
                      marginTop: '1rem',
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>
                      ⚠️ This event has been cancelled
                    </div>
                  )}

                  {ticket.isActive && isEventPast(ticket.eventDate) && (
                    <div style={{ 
                      background: '#f0f0f0', 
                      color: '#636e72', 
                      padding: '0.5rem', 
                      borderRadius: '5px', 
                      marginTop: '1rem',
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>
                      📅 This event has ended
                    </div>
                  )}

                  {ticket.isActive && !isEventPast(ticket.eventDate) && (
                    <div style={{ 
                      background: '#e6f7e6', 
                      color: '#00b894', 
                      padding: '0.5rem', 
                      borderRadius: '5px', 
                      marginTop: '1rem',
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}>
                      ✅ Ready for event
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ 
            background: '#fff3cd', 
            color: '#856404', 
            padding: '1rem', 
            borderRadius: '10px', 
            marginTop: '2rem',
            border: '1px solid #ffeaa7'
          }}>
            <h4>💡 Ticket Information</h4>
            <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
              <li>Your tickets are stored as NFTs on the blockchain</li>
              <li>Each ticket is unique and cannot be duplicated</li>
              <li>You can transfer tickets to others if needed</li>
              <li>Keep your wallet secure to protect your tickets</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default UserTickets;