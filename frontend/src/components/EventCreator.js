import React, { useState } from 'react';
import { ethers } from 'ethers';

function EventCreator({ contract, account }) {
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    date: '',
    ticketPrice: '',
    maxTickets: '',
    venue: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!contract) {
      setMessage('Please connect your wallet first');
      return;
    }

    try {
      setLoading(true);
      setMessage('');

      // Validate inputs
      if (!eventData.name || !eventData.description || !eventData.date || 
          !eventData.ticketPrice || !eventData.maxTickets || !eventData.venue) {
        throw new Error('Please fill in all fields');
      }

      const eventDate = new Date(eventData.date).getTime() / 1000;
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (eventDate <= currentTime) {
        throw new Error('Event date must be in the future');
      }

      const ticketPrice = ethers.utils.parseEther(eventData.ticketPrice);
      const maxTickets = parseInt(eventData.maxTickets);

      if (maxTickets <= 0) {
        throw new Error('Maximum tickets must be greater than 0');
      }

      if (parseFloat(eventData.ticketPrice) <= 0) {
        throw new Error('Ticket price must be greater than 0');
      }

      console.log('Creating event with data:', {
        name: eventData.name,
        description: eventData.description,
        date: eventDate,
        ticketPrice: ticketPrice.toString(),
        maxTickets: maxTickets,
        venue: eventData.venue
      });

      const tx = await contract.createEvent(
        eventData.name,
        eventData.description,
        eventDate,
        ticketPrice,
        maxTickets,
        eventData.venue
      );

      setMessage('Transaction submitted. Waiting for confirmation...');
      await tx.wait();

      setMessage('Event created successfully! 🎉');
      
      // Reset form
      setEventData({
        name: '',
        description: '',
        date: '',
        ticketPrice: '',
        maxTickets: '',
        venue: ''
      });

    } catch (error) {
      console.error('Error creating event:', error);
      setMessage(`Error: ${error.message || 'Failed to create event'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-card">
      <h2>Create New Event</h2>
      
      {message && (
        <div className={message.includes('Error') ? 'error' : 'success'}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Event Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={eventData.name}
            onChange={handleInputChange}
            placeholder="Enter event name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={eventData.description}
            onChange={handleInputChange}
            placeholder="Describe your event"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="venue">Venue *</label>
          <input
            type="text"
            id="venue"
            name="venue"
            value={eventData.venue}
            onChange={handleInputChange}
            placeholder="Event venue/location"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Event Date & Time *</label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={eventData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ticketPrice">Ticket Price (ETH) *</label>
          <input
            type="number"
            id="ticketPrice"
            name="ticketPrice"
            value={eventData.ticketPrice}
            onChange={handleInputChange}
            placeholder="0.1"
            step="0.001"
            min="0.001"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxTickets">Maximum Tickets *</label>
          <input
            type="number"
            id="maxTickets"
            name="maxTickets"
            value={eventData.maxTickets}
            onChange={handleInputChange}
            placeholder="100"
            min="1"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn"
          disabled={loading}
        >
          {loading ? 'Creating Event...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default EventCreator;