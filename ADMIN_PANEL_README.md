# Admin Panel - Reservations Management

This component provides a comprehensive admin interface for managing restaurant reservations.

## Features

1. **Reservation Overview**: Displays all reservations in a responsive table format
2. **Date Filtering**: Filter reservations by specific date
3. **Status Management**: Update reservation status (Zrealizowana, Anulowana, W toku)
4. **Automatic Refresh**: Automatically refreshes data every 30 seconds
5. **Statistics Dashboard**: Shows total, completed, and cancelled reservations

## Component Structure

### ReservationsAdminPanel.tsx
Main component that renders the admin panel with:
- Filter controls (date picker and status filter)
- Reservation table with all reservation details
- Status update dropdowns
- Statistics dashboard

### Services
- `reservationService.ts`: Handles API calls to fetch and update reservations
  - `fetchReservations()`: Gets all reservations from `/admin/reservations`
  - `updateReservationStatus()`: Updates reservation status via `/admin/reservations/:id/status`

### Types
- `reservation.ts`: Defines TypeScript interfaces for reservation data

## API Endpoints Used

1. **GET** `/admin/reservations` - Fetch all reservations
2. **PATCH** `/admin/reservations/:id/status` - Update reservation status

## Usage

```tsx
import ReservationsAdminPanel from './components/admin/ReservationsAdminPanel';

// In your admin layout or page
<ReservationsAdminPanel />
```

## Features Implementation Details

### 1. Filtering by Date
- Date picker allows filtering reservations by specific date
- Reset filters button to clear all filters

### 2. Status Management
- Dropdown menus for each reservation allowing status updates
- Predefined statuses: Zrealizowana, Anulowana, W toku
- Visual indicators for different status types (colors)

### 3. Automatic Refresh
- Component fetches data every 30 seconds using `setInterval`
- Proper cleanup of intervals on component unmount

### 4. Error Handling
- Loading states while fetching data
- Error display when API calls fail
- Graceful handling of empty results

## Styling

The component uses Tailwind CSS classes for styling:
- Responsive grid layouts
- Hover effects on table rows
- Color-coded status indicators
- Clean, professional admin panel design

## Requirements

- React with TypeScript
- Tailwind CSS for styling
- Access to backend API endpoints (admin/reservations)
- Authentication/authorization for admin access