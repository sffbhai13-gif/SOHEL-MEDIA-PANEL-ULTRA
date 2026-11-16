# SOHEL MEDIA PANEL — Updated

## Features added
- Admin service create, edit and safe delete (deactivate).
- Per-1000 pricing, min/max quantity, quick quantity presets and delivery-time label.
- Customer link + quantity order flow with server-side price calculation and wallet debit.
- TopSMM API v2 provider adapter; external order ID is saved automatically.
- Manual fulfilment remains available; admins can attach an external order ID and sync status.
- Existing database is upgraded using additive PostgreSQL migrations at startup.

## Deploy on Render
1. Replace the app files in your GitHub repository with this folder's contents.
2. Keep the existing Render PostgreSQL `DATABASE_URL` and `JWT_SECRET`; do not reset the database.
3. Add `TOPSMM_API_URL=https://topsmm.in/api/v2` and `TOPSMM_API_KEY` in Render Environment. Get the key from your TopSMM account API page. Never put it in frontend code or commit it.
4. Deploy. Startup migrations add new columns without deleting existing services/users/orders.
5. In Admin → Services, edit each service, choose provider TopSMM or Manual, set the TopSMM service ID, selling price per 1000, minimum/maximum quantity and quick buttons.
6. First test with a low quantity and confirm TopSMM balance and service ID.

## TopSMM API
Uses POST form-encoded requests to `https://topsmm.in/api/v2`: `services`, `add`, `status`, and `balance`. Add-order uses `service`, `link`, and `quantity`. See https://topsmm.in/api_docs.

## Important
- A provider order is submitted before the local transaction commits; if the provider accepts an order but the database commit subsequently fails, reconcile using the provider order history.
- API key is read from server environment only. Do not paste it into chat or browser JavaScript.
- Delete is implemented as deactivation to preserve historical orders.
- Test in a staging copy and back up PostgreSQL before production deployment.
