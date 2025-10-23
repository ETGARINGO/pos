Multi-page Offline POS (dark military-style)
Files:
- index.html        : POS (cashier)
- inventory.html    : Manage inventory (add/edit/delete/import/export)
- sales.html        : Sales report, export and clear
- settings.html     : Shop settings (stored in localStorage)
- style.css         : shared styling (dark military theme)
- db.js             : product loading + local overrides (reads assets/products.csv)
- pos.js            : core POS functions (orders, checkout, sales export)
- config.js         : default shop config
- assets/products.csv : product master list (from your upload if provided)

How to use:
1. Unzip and open index.html in a modern browser.
2. Use Inventory -> Import CSV to load products, or replace assets/products.csv directly.
3. Sales persist to localStorage and can be exported as CSV.
4. Edit settings in Settings page. Replace config.js or update Settings UI for permanent changes.


v2 - Added PIN login, Remember Me, stock monitoring admin dashboard, and bulk stock CSV updates.
