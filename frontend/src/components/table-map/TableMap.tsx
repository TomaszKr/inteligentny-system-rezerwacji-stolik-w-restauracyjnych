import React, { useState } from 'react';
import './TableMap.css';

// Define types for table data
interface Table {
  id: number;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  position: {
    x: number;
    y: number;
  };
}

interface TableMapProps {
  tables: Table[];
  onTableSelect?: (table: Table) => void;
}

const TableMap: React.FC<TableMapProps> = ({ tables, onTableSelect }) => {
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  const handleTableClick = (table: Table) => {
    // Only allow selection of available tables
    if (table.status === 'available') {
      setSelectedTableId(table.id);
      if (onTableSelect) {
        onTableSelect(table);
      }
    }
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return '#4ade80'; // green
      case 'occupied':
        return '#f87171'; // red
      case 'reserved':
        return '#fbbf24'; // yellow
      default:
        return '#9ca3af'; // gray
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'Dostępny';
      case 'occupied':
        return 'Zajęty';
      case 'reserved':
        return 'Zarezerwowany';
      default:
        return 'Nieznany';
    }
  };

  return (
    <div className="table-map-container">
      <div className="table-map">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`table-item ${
              table.status === 'available' ? 'available' : ''
            } ${selectedTableId === table.id ? 'selected' : ''}`}
            onClick={() => handleTableClick(table)}
            style={{
              left: `${table.position.x}px`,
              top: `${table.position.y}px`,
              backgroundColor: getStatusColor(table.status),
            }}
          >
            <div className="table-number">{table.number}</div>
            <div className="table-capacity">Do {table.capacity} os.</div>
            <div className="table-status">
              {getStatusText(table.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableMap;