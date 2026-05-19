import { useState } from 'react';
import TableMap from './TableMap';
import './TableMapDemo.css';

// Mock data for tables
const mockTables = [
  {
    id: 1,
    number: 1,
    capacity: 4,
    status: 'available' as const,
    position: { x: 50, y: 50 }
  },
  {
    id: 2,
    number: 2,
    capacity: 2,
    status: 'occupied' as const,
    position: { x: 150, y: 50 }
  },
  {
    id: 3,
    number: 3,
    capacity: 6,
    status: 'reserved' as const,
    position: { x: 250, y: 50 }
  },
  {
    id: 4,
    number: 4,
    capacity: 4,
    status: 'available' as const,
    position: { x: 50, y: 150 }
  },
  {
    id: 5,
    number: 5,
    capacity: 8,
    status: 'available' as const,
    position: { x: 150, y: 150 }
  },
  {
    id: 6,
    number: 6,
    capacity: 2,
    status: 'occupied' as const,
    position: { x: 250, y: 150 }
  },
  {
    id: 7,
    number: 7,
    capacity: 4,
    status: 'available' as const,
    position: { x: 50, y: 250 }
  },
  {
    id: 8,
    number: 8,
    capacity: 6,
    status: 'reserved' as const,
    position: { x: 150, y: 250 }
  },
  {
    id: 9,
    number: 9,
    capacity: 4,
    status: 'available' as const,
    position: { x: 250, y: 250 }
  },
  {
    id: 10,
    number: 10,
    capacity: 2,
    status: 'available' as const,
    position: { x: 350, y: 50 }
  },
];

const TableMapDemo = () => {
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [showReservationForm, setShowReservationForm] = useState(false);

  const handleTableSelect = (table: any) => {
    setSelectedTable(table);
    setShowReservationForm(true);
  };

  const handleCloseForm = () => {
    setShowReservationForm(false);
    setSelectedTable(null);
  };

  return (
    <div className="table-map-demo">
      <h2>Mapa Restauracji</h2>
      <p>Kliknij na dostępny stolik, aby zarezerwować</p>
      
      <div className="demo-container">
        <TableMap 
          tables={mockTables} 
          onTableSelect={handleTableSelect}
        />
      </div>

      {showReservationForm && selectedTable && (
        <div className="reservation-form-overlay">
          <div className="reservation-form">
            <h3>Rezerwacja stolika #{selectedTable.number}</h3>
            <p>Stolik {selectedTable.number} - Do {selectedTable.capacity} osób</p>
            <form>
              <div className="form-group">
                <label htmlFor="name">Imię i nazwisko:</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Telefon:</label>
                <input type="tel" id="phone" name="phone" required />
              </div>
              <div className="form-group">
                <label htmlFor="date">Data rezerwacji:</label>
                <input type="date" id="date" name="date" required />
              </div>
              <div className="form-group">
                <label htmlFor="time">Godzina:</label>
                <input type="time" id="time" name="time" required />
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseForm}>Anuluj</button>
                <button type="submit">Zarezerwuj</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableMapDemo;