/* config.js - editable settings */
const CONFIG = {
  shopName: "My Store Name",
  address: "123 Main Street, City",
  contact: "+63 900 000 0000",
  theme: "dark", // reserved
  dbMode: "local", // "local" | "indexeddb" | "mysql" | "firebase"
  lowStockThreshold: 10
};

/* Users for PIN login */
const USERS = [
  { username: "admin", pin: "1234", role: "Admin" },
  { username: "cashier", pin: "4321", role: "Cashier" }
];
