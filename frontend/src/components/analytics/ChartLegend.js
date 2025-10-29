import React from 'react';
import './ChartLegend.css';

const ChartLegend = ({ labels, values, colors, isDarkTheme, hoveredIndex, onLegendHover, onLegendLeave, onItemClick }) => {
  // Créer un tableau avec labels, values, colors et index original
  const legendData = labels.map((label, index) => ({
    label,
    value: values[index],
    color: colors[index],
    originalIndex: index
  }));

  // Trier par valeur décroissante
  const sortedData = [...legendData].sort((a, b) => b.value - a.value);

  // Calculer le total
  const total = sortedData.reduce((sum, item) => sum + item.value, 0);

  const handleLegendHover = (originalIndex) => {
    if (onLegendHover) {
      onLegendHover(originalIndex);
    }
  };

  const handleLegendLeave = () => {
    if (onLegendLeave) {
      onLegendLeave();
    }
  };

  return (
    <div className={`chart-legend ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <div className="legend-list">
        {sortedData.map((item, displayIndex) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
          const isHovered = hoveredIndex === item.originalIndex;

          return (
            <div
              key={`${item.label}-${item.originalIndex}`}
              className={`legend-item ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => handleLegendHover(item.originalIndex)}
              onMouseLeave={handleLegendLeave}
              onClick={() => onItemClick && onItemClick(item.label, item.originalIndex)}
              style={{ cursor: 'pointer' }}
            >
              <div className="legend-rank">
                <span className="rank-number">{displayIndex + 1}</span>
              </div>
              <div className="legend-color-dot" style={{ backgroundColor: item.color }}></div>
              <div className="legend-content">
                <div className="legend-label">{item.label}</div>
                <div className="legend-value">
                  {item.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </div>
              </div>
              <div className="legend-percentage">{percentage}%</div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="legend-total">
        <div className="total-label">Total</div>
        <div className="total-value">
          {total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </div>
      </div>
    </div>
  );
};

export default ChartLegend;
