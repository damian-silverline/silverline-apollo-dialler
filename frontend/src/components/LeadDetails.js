import React, { useState } from 'react';
import axios from 'axios';
import './LeadDetails.css';

function LeadDetails({ lead, accessToken, userEmail, onBack, onLeadUpdate, onNextLead, showNextLead }) {
  const [notes, setNotes] = useState(lead['Notes'] || '');
  const [newNote, setNewNote] = useState('');
  const [disposition, setDisposition] = useState(lead['Disposition'] || '');
  const [isLocked, setIsLocked] = useState(lead['Locked By'] || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Log all available fields from the lead object
  React.useEffect(() => {
    console.log('Lead object keys:', Object.keys(lead).sort());
    console.log('Full lead data:', lead);
  }, [lead]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setSaving(true);
      const timestamp = new Date().toLocaleString();
      
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/leads/${lead.id}/notes`,
        {
          accessToken,
          note: newNote,
          timestamp
        }
      );

      setNotes(notes ? `${notes}\n[${timestamp}] ${newNote}` : `[${timestamp}] ${newNote}`);
      setNewNote('');
      setMessage('Note added successfully');
      setTimeout(() => setMessage(''), 3000);
      onLeadUpdate();
    } catch (error) {
      console.error('Error adding note:', error);
      setMessage('Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleLockLead = async () => {
    try {
      setSaving(true);
      
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/leads/${lead.id}/lock`,
        {
          accessToken,
          userEmail
        }
      );

      setIsLocked(userEmail);
      setMessage('Lead locked to you');
      setTimeout(() => setMessage(''), 3000);
      onLeadUpdate();
    } catch (error) {
      console.error('Error locking lead:', error);
      setMessage('Failed to lock lead');
    } finally {
      setSaving(false);
    }
  };

  const handleDispositionChange = async (newDisposition) => {
    try {
      setSaving(true);
      const timestamp = new Date().toLocaleString();
      
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/leads/${lead.id}/disposition`,
        {
          accessToken,
          disposition: newDisposition,
          timestamp
        }
      );

      setDisposition(newDisposition);
      setMessage('Disposition updated successfully');
      setTimeout(() => setMessage(''), 3000);
      onLeadUpdate();
    } catch (error) {
      console.error('Error updating disposition:', error);
      setMessage('Failed to update disposition');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="lead-details">
      <div className="details-header">
        <div className="lead-title">
          <h1>{lead['First Name']} {lead['Last Name']}</h1>
          <p className="lead-company">{lead['Company Name']}</p>
        </div>
        <div className="header-actions">
          {showNextLead && (
            <button
              className="next-lead-btn"
              onClick={onNextLead}
              style={{ marginRight: 12 }}
            >
              Next Lead →
            </button>
          )}
          <div className="lock-section">
            {isLocked && isLocked !== userEmail ? (
              <div className="locked-by">Locked by: {isLocked}</div>
            ) : (
              <button
                className={`lock-btn ${isLocked === userEmail ? 'locked' : ''}`}
                onClick={handleLockLead}
                disabled={saving || (isLocked && isLocked !== userEmail)}
              >
                {isLocked === userEmail ? '✓ Locked to You' : 'Lock to Me'}
              </button>
            )}
          </div>
        </div>
      </div>
      <button className="back-btn" onClick={onBack}>← Back to Leads</button>
      {message && <div className="message-banner">{message}</div>}

      <div className="details-grid">
        {/* Contact Information */}
        <section className="details-section">
          <h2>Contact Information</h2>
          <div className="info-row">
            <label>Email:</label>
            <span>{lead['Email'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Title:</label>
            <span>{lead['Title'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Mobile Phone:</label>
            <span>{lead['Mobile Phone'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Work Phone:</label>
            <span>{lead['Work Direct Phone'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Seniority:</label>
            <span>{lead['Seniority'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Departments:</label>
            <span>{lead['Departments'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>LinkedIn:</label>
            <span>
              {lead['Person Linkedin Url'] ? (
                <a href={lead['Person Linkedin Url']} target="_blank" rel="noopener noreferrer">
                  View Profile
                </a>
              ) : (
                'N/A'
              )}
            </span>
          </div>
          <div className="info-row">
            <label>Twitter:</label>
            <span>
              {lead['Twitter Url'] ? (
                <a href={lead['Twitter Url']} target="_blank" rel="noopener noreferrer">
                  @{lead['Twitter Url'].split('/').pop()}
                </a>
              ) : (
                'N/A'
              )}
            </span>
          </div>
          <div className="info-row">
            <label>Facebook:</label>
            <span>
              {lead['Facebook Url'] ? (
                <a href={lead['Facebook Url']} target="_blank" rel="noopener noreferrer">
                  View Profile
                </a>
              ) : (
                'N/A'
              )}
            </span>
          </div>
        </section>

        {/* Company Information */}
        <section className="details-section">
          <h2>Company Information</h2>
          <div className="info-row">
            <label>Company:</label>
            <span>{lead['Company Name'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Industry:</label>
            <span>{lead['Industry'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Company Size:</label>
            <span>{lead['# Employees'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Website:</label>
            <span>
              {lead['Website'] ? (
                <a href={lead['Website']} target="_blank" rel="noopener noreferrer">
                  {lead['Website']}
                </a>
              ) : (
                'N/A'
              )}
            </span>
          </div>
          <div className="info-row">
            <label>Company LinkedIn:</label>
            <span>
              {lead['Company Linkedin Url'] ? (
                <a href={lead['Company Linkedin Url']} target="_blank" rel="noopener noreferrer">
                  View Profile
                </a>
              ) : (
                'N/A'
              )}
            </span>
          </div>
          <div className="info-row">
            <label>Annual Revenue:</label>
            <span>{lead['Annual Revenue'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>City:</label>
            <span>{lead['Company City'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>State:</label>
            <span>{lead['Company State'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Country:</label>
            <span>{lead['Company Country'] || 'N/A'}</span>
          </div>
        </section>

        {/* Call Information */}
        <section className="details-section">
          <h2>Call Information</h2>
          <div className="info-row">
            <label>Last Called:</label>
            <span>{lead['Last Contacted'] || 'Never called'}</span>
          </div>
          <div className="info-row">
            <label>Last Call Outcome:</label>
            <span>{lead['Last Call Outcome'] || 'N/A'}</span>
          </div>
          <div className="info-row">
            <label>Disposition:</label>
            <div className="disposition-selector">
              <select
                value={disposition}
                onChange={(e) => handleDispositionChange(e.target.value)}
                disabled={saving}
                className="disposition-select"
              >
                <option value="">Select Disposition</option>
                <option value="Not Answered">Not Answered</option>
                <option value="Not Interested">Not Interested</option>
                <option value="More Info">More Info</option>
                <option value="Meeting Booked">Meeting Booked</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notes Section */}
        <section className="details-section full-width">
          <h2>Notes</h2>
          <div className="notes-container">
            <div className="notes-display">
              {notes ? (
                <div className="notes-content">
                  {notes.split('\n').map((line, idx) => {
                    // Parse [timestamp] note
                    const match = line.match(/^\[(.+?)\]\s(.+)$/);
                    const timestamp = match ? match[1] : '';
                    const noteText = match ? match[2] : line;
                    const handleDelete = async () => {
                      if (!window.confirm('Delete this note?')) return;
                      try {
                        setSaving(true);
                        await axios.delete(
                          `${process.env.REACT_APP_BACKEND_URL}/api/leads/${lead.id}/notes`,
                          {
                            data: {
                              accessToken,
                              timestamp,
                              note: noteText
                            }
                          }
                        );
                        // Remove from local state
                        const updated = notes
                          .split('\n')
                          .filter((l, i) => i !== idx)
                          .join('\n');
                        setNotes(updated);
                        setMessage('Note deleted');
                        setTimeout(() => setMessage(''), 3000);
                        onLeadUpdate();
                      } catch (error) {
                        console.error('Error deleting note:', error);
                        setMessage('Failed to delete note');
                      } finally {
                        setSaving(false);
                      }
                    };
                    return (
                      <div key={idx} className="note-line">
                        <span>{line}</span>
                        <button
                          className="delete-note-btn"
                          onClick={handleDelete}
                          disabled={saving}
                          title="Delete note"
                          style={{ marginLeft: 8 }}
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-notes">No notes yet</p>
              )}
            </div>
            
            <div className="notes-input-section">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="notes-input"
                disabled={saving}
              />
              <button
                onClick={handleAddNote}
                disabled={saving || !newNote.trim()}
                className="add-note-btn"
              >
                {saving ? 'Saving...' : 'Add Note'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LeadDetails;
