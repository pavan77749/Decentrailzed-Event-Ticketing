import React, { useState } from 'react';
import { ethers } from 'ethers';

function TicketPurchase({ contract, account }) {
  const [eventId, setEventId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [eventDetails, setEventDetails] = useState(null);

  const loadEventDetails = async () => {
    if (!contract || !eventId) return;

    try {
      const event = await contract.getEvent(eventId);
      
      const formattedEvent = {
        id: event.id.toNumber(),
        name: event.name,
        description: event.description,
        date: new Date(event.date.toNumber() * 1000),
        ticketPrice: ethers.utils.formatEther(event.ticketPrice),
        maxTickets: event.maxTickets.toNumber(),
        ticketsSold: event.ticketsSold.toNumber(),
        organizer: event.organizer,
        isActive: event.isActive,
        venue: event.venue
      };

      setEventDetails(formattedEvent);
      setMessage('');
    } catch (error) {
      console.error('Error loading event:', error);
      setMessage('Event not found or invalid event ID');
      setEventDetails(null);
    }
  };

  const handlePurchase = async () => {
    if (!contract || !eventDetails) return;

    try {
      setLoading(true);
      setMessage('');

      const totalCost = ethers.utils.parseEther(
        (parseFloat(eventDetails.ticketPrice) * quantity).toString()
      );

      const tx = await contract.buyTickets(eventId, quantity, {
        value: totalCost
      });

      setMessage('Transaction submitted. Waiting for confirmation...');
      await tx.wait();

      setMessage(`Successfully purchased ${quantity} ticket(s)! 🎉`);
      
      // Reload event details to show updated ticket count
      await loadEventDetails();

    } catch (error) {
      console.error('Error purchasing tickets:', error);
      setMessage(`Error: ${error.message || 'Failed to purchase tickets'}`);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTickets = () => {
    if (!eventDetails) return 0;
    return eventDetails.maxTickets - eventDetails.ticketsSold;
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

  return (
    <div className="component-card">
      <h2>Quick Ticket Purchase</h2>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        If you know the event ID, you can purchase tickets directly here.
      </p>

      {message && (
        <div className={message.includes('Error') ? 'error' : 'success'}>
          {message}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="eventId">Event ID</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="number"
            id="eventId"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Enter event ID"
            min="0"
          />
          <button 
            onClick={loadEventDetails}
            className="btn btn-secondary"
            disabled={!eventId}
          >
            Load Event
          </button>
        </div>
      </div>

      {eventDetails && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1.5rem', 
          borderRadius: '10px', 
          margin: '1rem 0',
          border: '1px solid #e9ecef'
        }}>
          <h3>{eventDetails.name}</h3>
          <p><strong>📍 Venue:</strong> {eventDetails.venue}</p>
          <p><strong>📅 Date:</strong> {formatDate(eventDetails.date)}</p>
          <p><strong>💰 Price:</strong> {eventDetails.ticketPrice} ETH per ticket</p>
          <p><strong>🎫 Available:</strong> {getAvailableTickets()} / {eventDetails.maxTickets} tickets</p>
          <p><strong>👤 Organizer:</strong> {eventDetails.organizer.slice(0, 6)}...{eventDetails.organizer.slice(-4)}</p>
          
          {!eventDetails.isActive && (
            <div className="error" style={{ marginTop: '1rem' }}>
              This event has been cancelled or is no longer active.
            </div>
          )}

          {eventDetails.isActive && getAvailableTickets() > 0 && (
            <>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="quantity">Number of tickets</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  min="1"
                  max={getAvailableTickets()}
                />
              </div>

              <div style={{ 
                background: 'white', 
                padding: '1rem', 
                borderRadius: '8px', 
                margin: '1rem 0',
                border: '2px solid #667eea'
              }}>
                <p><strong>Total Cost: {(parseFloat(eventDetails.ticketPrice) * quantity).toFixed(4)} ETH</strong></p>
              </div>

              <button
                onClick={handlePurchase}
                className="btn btn-success"
                disabled={loading || !eventDetails.isActive}
                style={{ width: '100%' }}
              >
                {loading ? 'Processing Purchase...' : `Buy ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
              </button>
            </>
          )}

          {eventDetails.isActive && getAvailableTickets() === 0 && (
            <div style={{ 
              background: '#fff3cd', 
              color: '#856404', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              <strong>This event is sold out!</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TicketPurchase;