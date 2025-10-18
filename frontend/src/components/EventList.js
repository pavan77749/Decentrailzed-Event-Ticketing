import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function EventList({ contract, account }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [contract]);

  const loadEvents = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      setError('');
      
      const activeEvents = await contract.getActiveEvents();
      console.log('Loaded events:', activeEvents);
      
      const formattedEvents = activeEvents.map(event => ({
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
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTickets = async (eventId) => {
    if (!contract || !selectedEvent) return;

    try {
      setPurchasing(true);
      
      const totalCost = ethers.utils.parseEther(
        (parseFloat(selectedEvent.ticketPrice) * ticketQuantity).toString()
      );

      console.log('Buying tickets:', {
        eventId,
        quantity: ticketQuantity,
        totalCost: ethers.utils.formatEther(totalCost)
      });

      const tx = await contract.buyTickets(eventId, ticketQuantity, {
        value: totalCost
      });

      alert('Transaction submitted! Waiting for confirmation...');
      await tx.wait();

      alert(`Successfully purchased ${ticketQuantity} ticket(s)! 🎉`);
      
      // Refresh events and close modal
      await loadEvents();
      setSelectedEvent(null);
      setTicketQuantity(1);

    } catch (error) {
      console.error('Error buying tickets:', error);
      alert(`Error: ${error.message || 'Failed to purchase tickets'}`);
    } finally {
      setPurchasing(false);
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

  const getAvailableTickets = (event) => {
    return event.maxTickets - event.ticketsSold;
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return (
      <div className="component-card">
        <div className="error">{error}</div>
        <button onClick={loadEvents} className="btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="component-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Available Events</h2>
        <button onClick={loadEvents} className="btn btn-secondary">
          Refresh
        </button>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          <p>No active events found.</p>
          <p>Be the first to create an event!</p>
        </div>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <h3>{event.name}</h3>
              <p><strong>📍 Venue:</strong> {event.venue}</p>
              <p><strong>📅 Date:</strong> {formatDate(event.date)}</p>
              <p><strong>📝 Description:</strong> {event.description}</p>
              
              <div className="event-meta">
                <span className="price">
                  {event.ticketPrice} ETH
                </span>
                <span className="tickets-available">
                  {getAvailableTickets(event)} / {event.maxTickets} available
                </span>
              </div>

              <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1rem' }}>
                Organizer: {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
              </p>

              {getAvailableTickets(event) > 0 ? (
                <button 
                  onClick={() => setSelectedEvent(event)}
                  className="btn"
                  style={{ width: '100%' }}
                >
                  Buy Tickets
                </button>
              ) : (
                <button 
                  className="btn" 
                  disabled 
                  style={{ width: '100%', opacity: 0.5 }}
                >
                  Sold Out
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Purchase Modal */}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '15px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3>Purchase Tickets</h3>
            <h4>{selectedEvent.name}</h4>
            
            <div style={{ margin: '1rem 0' }}>
              <p><strong>Date:</strong> {formatDate(selectedEvent.date)}</p>
              <p><strong>Venue:</strong> {selectedEvent.venue}</p>
              <p><strong>Price per ticket:</strong> {selectedEvent.ticketPrice} ETH</p>
              <p><strong>Available:</strong> {getAvailableTickets(selectedEvent)} tickets</p>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Number of tickets:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={getAvailableTickets(selectedEvent)}
                value={ticketQuantity}
                onChange={(e) => setTicketQuantity(parseInt(e.target.value))}
              />
            </div>

            <div style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '10px', 
              margin: '1rem 0' 
            }}>
              <p><strong>Total Cost: {(parseFloat(selectedEvent.ticketPrice) * ticketQuantity).toFixed(4)} ETH</strong></p>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => handleBuyTickets(selectedEvent.id)}
                className="btn btn-success"
                disabled={purchasing}
                style={{ flex: 1 }}
              >
                {purchasing ? 'Processing...' : 'Confirm Purchase'}
              </button>
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setTicketQuantity(1);
                }}
                className="btn btn-secondary"
                disabled={purchasing}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventList;