import React from 'react';
import ReservationsAdminPanel from './ReservationsAdminPanel';

const ReservationsAdminPanelDemo: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Panel - Reservations</h1>
      <ReservationsAdminPanel />
    </div>
  );
};

export default ReservationsAdminPanelDemo;