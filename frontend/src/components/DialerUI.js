import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './DialerUI.css';
import LeadCard from './LeadCard';
import LeadDetails from './LeadDetails';

function DialerUI({ user, accessToken, onLogout }) {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDisposition, setFilterDisposition] = useState('all');

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/leads?accessToken=${accessToken}`
      );
      console.log('Headers from API:', response.data.headers);
      console.log('First lead sample:', response.data.leads[0]);
      setLeads(response.data.leads || []);
    } catch (err) {
      setError('Failed to load leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Helper to get index of selected lead in filtered list
  const getSelectedLeadIndex = () => {
    if (!selectedLead) return -1;
    return filteredLeads.findIndex(l => l.id === selectedLead.id);
  };

  // Handler for Next Lead button
  const handleNextLead = () => {
    const idx = getSelectedLeadIndex();
    if (idx !== -1 && idx < filteredLeads.length - 1) {
      handleSelectLead(filteredLeads[idx + 1]);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      (lead['First Name'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead['Last Name'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead['Mobile Phone'] || '').includes(searchTerm) ||
      (lead['Work Direct Phone'] || '').includes(searchTerm) ||
      (lead['Company Name'] || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDisposition = true;
    if (filterDisposition === 'not called') {
      matchesDisposition = !lead['Disposition'] || lead['Disposition'].trim() === '';
    } else if (filterDisposition !== 'all') {
      matchesDisposition = (lead['Disposition'] || '').toLowerCase() === filterDisposition.toLowerCase();
    }

    return matchesSearch && matchesDisposition;
  });

  // Automatically lock lead when selected
  const handleSelectLead = async (lead) => {
    setSelectedLead(lead);
    if (!lead['Locked By'] || lead['Locked By'] !== user.email) {
      try {
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/leads/${lead.id}/lock`,
          {
            accessToken,
            userEmail: user.email
          }
        );
        // Refresh leads to update lock status
        fetchLeads();
      } catch (err) {
        console.error('Failed to lock lead:', err);
      }
    }
  };

  return (
    <div className="dialer-container">
      <header className="dialer-header">
        <div className="header-left">
          <h1>Silverline Apollo Dialer</h1>
        </div>
        <div className="header-right">
          <span className="user-info">Welcome, {user.name}</span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dialer-main">
        {selectedLead ? (
          <>
            <LeadDetails
              lead={selectedLead}
              accessToken={accessToken}
              userEmail={user.email}
              onBack={() => setSelectedLead(null)}
              onLeadUpdate={fetchLeads}
              onNextLead={handleNextLead}
              showNextLead={getSelectedLeadIndex() !== -1 && getSelectedLeadIndex() < filteredLeads.length - 1}
            />
          </>
        ) : (
          <>
            <div className="leads-sidebar">
              <div className="search-section">
                <input
                  type="text"
                  placeholder="Search by name, phone, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-section">
                <select
                  value={filterDisposition}
                  onChange={(e) => setFilterDisposition(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Dispositions</option>
                  <option value="not called">Not Called</option>
                  <option value="not answered">Not Answered</option>
                  <option value="not interested">Not Interested</option>
                  <option value="more info">More Info</option>
                  <option value="meeting booked">Meeting Booked</option>
                </select>
              </div>

              {loading ? (
                <div className="loading-state">Loading leads...</div>
              ) : error ? (
                <div className="error-state">{error}</div>
              ) : (
                <div className="leads-list">
                  {filteredLeads.length === 0 ? (
                    <div className="no-leads">No leads found</div>
                  ) : (
                    filteredLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onClick={() => handleSelectLead(lead)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="leads-preview">
              <div className="preview-empty">
                <h2>Select a lead to view details</h2>
                <p>Total leads: {filteredLeads.length}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DialerUI;
