import React, { useState, useEffect } from 'react';
import { Reservation } from '../../types/reservation';
import { fetchReservations, updateReservationStatus } from '../../services/reservationService';

interface ReservationsAdminPanelProps {
  // Props can be added as needed
}

const ReservationsAdminPanel: React.FC<ReservationsAdminPanelProps> = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch reservations
  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        const data = await fetchReservations();
        setReservations(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch reservations');
        console.error('Error fetching reservations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
    
    // Set up interval for automatic refresh
    const interval = setInterval(loadReservations, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Handle status change
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const updatedReservation = await updateReservationStatus(id, newStatus);
      
      // Update the reservation in local state
      setReservations(prevReservations =>
        prevReservations.map(reservation =>
          reservation.id === id ? { ...reservation, status: newStatus } : reservation
        )
      );
    } catch (err) {
      setError('Failed to update reservation status');
      console.error('Error updating reservation:', err);
    }
  };

  // Filter reservations based on date and status
  const filteredReservations = reservations.filter(reservation => {
    const reservationDate = new Date(reservation.reservationTime).toISOString().split('T')[0];
    const matchesDate = selectedDate ? reservationDate === selectedDate : true;
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  // Get unique dates for date picker
  const getUniqueDates = () => {
    const dates = new Set<string>();
    reservations.forEach(reservation => {
      const date = new Date(reservation.reservationTime).toISOString().split('T')[0];
      dates.add(date);
    });
    return Array.from(dates).sort();
  };

  // Get unique statuses for filter
  const getUniqueStatuses = () => {
    const statuses = new Set<string>();
    reservations.forEach(reservation => {
      if (reservation.status) {
        statuses.add(reservation.status);
      }
    });
    return Array.from(statuses);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Reservation Management</h2>
      
      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              {getUniqueStatuses().map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setFilterStatus('all');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reservation.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.user?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(reservation.reservationTime).toLocaleString('pl-PL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reservation.guests}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.table?.id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${reservation.status === 'Zrealizowana' ? 'bg-green-100 text-green-800' : 
                        reservation.status === 'Anulowana' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {reservation.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={reservation.status || ''}
                      onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                      className="p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="Zrealizowana">Zrealizowana</option>
                      <option value="Anulowana">Anulowana</option>
                      <option value="W toku">W toku</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No reservations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800">Total Reservations</h3>
          <p className="text-2xl font-bold text-blue-600">{reservations.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-800">Completed</h3>
          <p className="text-2xl font-bold text-green-600">
            {reservations.filter(r => r.status === 'Zrealizowana').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-800">Cancelled</h3>
          <p className="text-2xl font-bold text-red-600">
            {reservations.filter(r => r.status === 'Anulowana').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReservationsAdminPanel;