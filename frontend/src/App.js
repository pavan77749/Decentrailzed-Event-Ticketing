import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import EventCreator from './components/EventCreator';
import EventList from './components/EventList';
import TicketPurchase from './components/TicketPurchase';
import UserTickets from './components/UserTickets';
import { CONTRACT_ADDRESSES, EVENT_MANAGER_ABI, EVENT_TICKET_ABI } from './config';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [eventManagerContract, setEventManagerContract] = useState(null);
  const [eventTicketContract, setEventTicketContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('events');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = web3Provider.getSigner();
        const userAddress = await signer.getAddress();
        
        const eventManager = new ethers.Contract(
          CONTRACT_ADDRESSES.EVENT_MANAGER,
          EVENT_MANAGER_ABI,
          signer
        );
        
        const eventTicket = new ethers.Contract(
          CONTRACT_ADDRESSES.EVENT_TICKET,
          EVENT_TICKET_ABI,
          signer
        );

        setProvider(web3Provider);
        setAccount(userAddress);
        setEventManagerContract(eventManager);
        setEventTicketContract(eventTicket);
        
        console.log('Connected to wallet:', userAddress);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please install MetaMask to use this application!');
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setProvider(null);
    setEventManagerContract(null);
    setEventTicketContract(null);
  };

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            connectWallet();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🎫 EventChain</h1>
          <p>Decentralized Event Ticketing Platform</p>
          
          <div className="wallet-section">
            {account ? (
              <div className="wallet-info">
                <span className="account-address">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <button onClick={disconnectWallet} className="disconnect-btn">
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet} 
                className="connect-btn"
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </header>

      {account && eventManagerContract ? (
        <main className="main-content">
          <nav className="tab-navigation">
            <button 
              className={activeTab === 'events' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('events')}
            >
              Browse Events
            </button>
            <button 
              className={activeTab === 'create' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('create')}
            >
              Create Event
            </button>
            <button 
              className={activeTab === 'tickets' ? 'tab active' : 'tab'}
              onClick={() => setActiveTab('tickets')}
            >
              My Tickets
            </button>
          </nav>

          <div className="tab-content">
            {activeTab === 'events' && (
              <div>
                <EventList 
                  contract={eventManagerContract} 
                  account={account}
                />
                <TicketPurchase 
                  contract={eventManagerContract}
                  account={account}
                />
              </div>
            )}
            
            {activeTab === 'create' && (
              <EventCreator 
                contract={eventManagerContract}
                account={account}
              />
            )}
            
            {activeTab === 'tickets' && (
              <UserTickets 
                eventManagerContract={eventManagerContract}
                eventTicketContract={eventTicketContract}
                account={account}
              />
            )}
          </div>
        </main>
      ) : (
        <div className="welcome-section">
          <div className="welcome-content">
            <h2>Welcome to EventChain</h2>
            <p>The future of event ticketing is here. Buy, sell, and transfer tickets securely on the blockchain.</p>
            <div className="features">
              <div className="feature">
                <h3>🔒 Secure</h3>
                <p>Blockchain-based tickets prevent fraud and counterfeiting</p>
              </div>
              <div className="feature">
                <h3>💫 Transferable</h3>
                <p>Easily transfer tickets to friends or sell on secondary markets</p>
              </div>
              <div className="feature">
                <h3>🎯 Transparent</h3>
                <p>All transactions are recorded on the blockchain for transparency</p>
              </div>
            </div>
            {!account && (
              <button onClick={connectWallet} className="cta-button">
                Get Started - Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;