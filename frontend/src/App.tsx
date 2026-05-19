import TableMap from './components/table-map/TableMap';
import ReservationsAdminPanelDemo from './components/admin/ReservationsAdminPanelDemo';

// Example of how to use the TableMap component
const App = () => {
  const tables = [
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
  ];

  const handleTableSelect = (table: any) => {
    console.log('Selected table:', table);
  };

  return (
    <div>
      <h1>Restaurant Reservation System</h1>
      <TableMap 
        tables={tables} 
        onTableSelect={handleTableSelect}
      />
      {/* Admin panel for managing reservations */}
      <div className="mt-8">
        <ReservationsAdminPanelDemo />
      </div>
    </div>
  );
};

export default App;