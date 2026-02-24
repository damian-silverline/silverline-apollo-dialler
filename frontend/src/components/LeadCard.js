import React from 'react';
import './LeadCard.css';

function LeadCard({ lead, onClick }) {
  const firstName = lead['First Name'] || 'Unknown';
  const lastName = lead['Last Name'] || '';
  const company = lead['Company Name'] || 'No Company';
  const phone = lead['Mobile Phone'] || lead['Work Direct Phone'] || 'No Phone';
  const disposition = lead['Disposition'] || 'Not Called';

  return (
    <div className="lead-card" onClick={onClick}>
      <div className="lead-card-header">
        <h3>{firstName} {lastName}</h3>
        <span className={`disposition-badge ${disposition.toLowerCase().replace(/\s+/g, '-')}`}>
          {disposition}
        </span>
      </div>
      <div className="lead-card-body">
        <p className="company">{company}</p>
        <p className="phone">{phone}</p>
      </div>
    </div>
  );
}

export default LeadCard;
