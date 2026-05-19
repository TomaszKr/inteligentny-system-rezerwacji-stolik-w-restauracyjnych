# Table Map Component

Interactive table map UI for restaurant reservation system.

## Features

- Responsive design (mobile-first approach)
- Visual status indicators (available, occupied, reserved)
- Click interaction on available tables
- Reservation form integration
- Mobile-friendly layout

## Props

| Prop | Type | Description |
|------|------|-------------|
| `tables` | `Table[]` | Array of table objects with id, number, capacity, status, and position |
| `onTableSelect` | `(table: Table) => void` | Callback function when an available table is selected |

## Table Object Structure

```typescript
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
```

## Usage Example

```tsx
import TableMap from './components/table-map/TableMap';

const tables = [
  {
    id: 1,
    number: 1,
    capacity: 4,
    status: 'available',
    position: { x: 50, y: 50 }
  },
  // ... more tables
];

const handleTableSelect = (table) => {
  console.log('Selected table:', table);
  // Open reservation form or perform other actions
};

<TableMap 
  tables={tables} 
  onTableSelect={handleTableSelect} 
/>
```

## Design Principles

- **Mobile First**: Responsive layout that works on all device sizes
- **Visual Hierarchy**: Clear status indicators using color coding
- **User Feedback**: Hover and selection states for better interaction
- **Accessibility**: Proper contrast ratios and semantic HTML

## Status Colors

- **Available**: Green (#4ade80) - Clickable
- **Occupied**: Red (#f87171) - Not clickable
- **Reserved**: Yellow (#fbbf24) - Not clickable