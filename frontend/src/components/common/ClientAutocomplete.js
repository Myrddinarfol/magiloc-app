import React, { useState, useEffect, useRef } from 'react';
import { useClient } from '../../hooks/useClient';

const ClientAutocomplete = ({ value, onChange, placeholder = "Nom du client" }) => {
  const { clients, loadClients } = useClient();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Charger les clients au montage
  useEffect(() => {
    loadClients();
  }, []);

  // Filtrer les clients selon la saisie
  useEffect(() => {
    if (value.trim() === '') {
      setFilteredClients([]);
      setIsOpen(false);
      return;
    }

    const filtered = clients.filter(client =>
      client.nom.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredClients(filtered);
    setIsOpen(filtered.length > 0);
    setHighlightedIndex(-1);
  }, [value, clients]);

  // Gérer les clics externes
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Gérer la navigation au clavier
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredClients.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectClient(filteredClients[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelectClient = (client) => {
    onChange(client.nom);
    setIsOpen(false);
    setFilteredClients([]);
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%'
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (value.trim() !== '' && filteredClients.length > 0) {
            setIsOpen(true);
          }
        }}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '16px',
          color: '#fff',
          background: 'rgba(31, 41, 55, 0.8)',
          border: '2px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '8px',
          outline: 'none',
          transition: 'all 0.3s ease',
          boxSizing: 'border-box'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#fbbf24';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)';
        }}
      />

      {/* Dropdown suggestions */}
      {isOpen && filteredClients.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
            border: '2px solid #fbbf24',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)'
          }}
        >
          {filteredClients.map((client, index) => (
            <div
              key={client.id}
              onClick={() => handleSelectClient(client)}
              style={{
                padding: '12px 16px',
                background: highlightedIndex === index
                  ? 'rgba(251, 191, 36, 0.2)'
                  : 'transparent',
                borderBottom: index < filteredClients.length - 1
                  ? '1px solid rgba(251, 191, 36, 0.1)'
                  : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: '#fff',
                fontSize: '14px'
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div style={{ fontWeight: '500' }}>
                {client.nom}
              </div>
              {client.email && (
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  📧 {client.email}
                </div>
              )}
              {client.telephone && (
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  📱 {client.telephone}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && value.trim() !== '' && filteredClients.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
            border: '2px solid #f97316',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: '12px 16px',
            color: '#fed7aa',
            textAlign: 'center',
            fontSize: '14px',
            zIndex: 1000
          }}
        >
          Aucun client trouvé pour "{value}"
        </div>
      )}
    </div>
  );
};

export default ClientAutocomplete;
