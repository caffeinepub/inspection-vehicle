# Inspection Vehicle

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- Vehicle inspection management app
- Dashboard with list of recent inspections (date, vehicle, license, inspector, status)
- New Inspection form with:
  - Vehicle details (VIN lookup, make, model, year, license plate)
  - Inspection checklist with toggle switches (engine, brakes, tires, lights, body, interior, etc.)
  - Photo capture tiles (Front, Rear, Side, Damage)
  - Damage notes text area
- Inspection status tracking: Draft, In Progress, Completed
- View/Edit individual inspection reports
- Role-based access: Admin and Inspector roles

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Select authorization and blob-storage components
2. Generate Motoko backend with inspection CRUD, checklist items, vehicle data, photo references
3. Build React frontend: dashboard, new inspection form (multi-step), inspection detail/report view
