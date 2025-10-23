/* pos.js - shared functions for POS, Inventory, Sales pages */
/* Order & Sales */
const ORDER_KEY = "offline_pos_order";
const SALES_KEY = "offline_pos_sales";
const USERS_KEY = "offline_pos_users_session";

function _loadOrderMap(){ const raw = localStorage.getItem(ORDER_KEY); return raw ? JSON.parse(raw) : {}; }
function _saveOrderMap(map){ localStorage.setItem(ORDER_KEY, JSON.stringify(map)); }
function addItemToOrder(name, price, qty){
  const map=_loadOrderMap(); if(!map[name]) map[name]={price:price,qty:0}; map[name].qty=(map[name].qty||0)+Number(qty||1); if(map[name].qty<=0) delete map[name]; _saveOrderMap(map); return getCurrentOrder();
}
function removeItemFromOrder(name){ const map=_loadOrderMap(); if(map[name]) delete map[name]; _saveOrderMap(map); return getCurrentOrder(); }
function clearOrder(){ localStorage.removeItem(ORDER_KEY); }
function getCurrentOrder(){ const map=_loadOrderMap(); const order=[]; let total=0; Object.keys(map).forEach(name=>{ const price=Number(map[name].price)||0; const qty=Number(map[name].qty)||0; const subtotal=+(price*qty); order.push([name,qty,price,subtotal]); total+=subtotal; }); return {order,total}; }
function checkoutOrder(){ const current=getCurrentOrder(); if(current.order.length===0) return {success:false,msg:"No items in order."}; const historyRaw=localStorage.getItem(SALES_KEY)||"[]"; const history=JSON.parse(historyRaw); const sale={timestamp:new Date().toISOString(), items: current.order, total: current.total}; history.push(sale); localStorage.setItem(SALES_KEY, JSON.stringify(history)); clearOrder(); try{ _autoDownloadBackup(); }catch(e){};
return {success:true,msg:"Checkout successful.",total:sale.total}; }

/* Receipt */
function generateReceiptHTML(){ const current=getCurrentOrder(); if(current.order.length===0) return "No items to print"; const d=new Date(); let html="<!DOCTYPE html><html><head><meta charset='utf-8'><title>Receipt</title>"; html+="<style>body{font-family:monospace;padding:10px;max-width:320px;margin:0 auto}h2{text-align:center}table{width:100%;border-collapse:collapse}th,td{padding:4px;text-align:left}hr{border:none;border-top:1px dashed #000;margin:8px 0}</style>"; html+="</head><body>"; html+=`<h2>${CONFIG.shopName}</h2>`; html+=`<div style='text-align:center'>${CONFIG.address}<br>${CONFIG.contact}</div><hr>`; html+=`<div>Date: ${d.toLocaleString()}</div><table>`; html+="<tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr>"; current.order.forEach(r=>{ html+=`<tr><td>${r[0]}</td><td>${r[1]}</td><td>₱${Number(r[3]).toFixed(2)}</td></tr>`; }); html+=`</table><hr><h3 style='text-align:right'>Total: ₱${Number(current.total).toFixed(2)}</h3>`; html+="</body></html>"; return html; }

/* Products and Inventory */
function exportProductsCSV(){ return getAllItems().then(items=>{ const rows=[['Name','Category','Price','Stock']]; items.forEach(p=>rows.push([p[0],p[1],Number(p[2]).toFixed(2),(p[3]||0)])); return rows.map(r=>r.map(c=>String(c).replace(/"/g,'""')).map(c=>`"${c}"`).join(',')).join('\n'); }); }
function addProduct(product){ return getAllItems().then(items=>{ const map={}; items.forEach(p=> map[p[0]]={name:p[0],category:p[1],price:Number(p[2]),stock:Number(p[3]||0)}); map[product.name]={name:product.name,category:product.category,price:Number(product.price),stock:Number(product.stock||0)}; const merged=Object.values(map); saveProductsToLocalStorage(merged); return merged; }); }
function importProductsFromCSVText(text){ const lines=text.split(/\r?\n/).filter(l=>l.trim()!==''); const headers=lines[0].split(','); const arr=[]; for(let i=1;i<lines.length;i++){ const cols=lines[i].split(','); if(cols.length<2) continue; const name=cols[0].trim(); const category=cols[1].trim()||'Uncategorized'; const price=parseFloat((cols[2]||'0').replace(/[^0-9\.\-]/g,''))||0; const stock=parseInt((cols[3]||'0'))||0; arr.push({name,category,price,stock}); } saveProductsToLocalStorage(arr); return arr; }

/* Stock utilities for admin */
function getStockSummary(){ return getAllItems().then(items=>{ const summary = items.map(p=>({name:p[0],category:p[1],price:Number(p[2]),stock:Number(p[3]||0)})); return summary; }); }
function updateProductStock(name,newStock){ return getAllItems().then(items=>{ const map={}; items.forEach(p=> map[p[0]]={name:p[0],category:p[1],price:Number(p[2]),stock:Number(p[3]||0)}); if(map[name]) map[name].stock = Number(newStock); const merged=Object.values(map); saveProductsToLocalStorage(merged); return merged; }); }

/* Users & Session (PIN login, remember me) */
function validateUser(username,pin){ const u = (USERS||[]).find(x=>x.username===username && x.pin===pin); return u||null; }
function setCurrentUser(user,remember){ const session = {username:user.username, role:user.role, ts: new Date().toISOString()}; localStorage.setItem('offline_pos_currentUser', JSON.stringify(session)); if(remember){ localStorage.setItem('offline_pos_remember', '1'); } else { localStorage.removeItem('offline_pos_remember'); } }
function getCurrentUser(){ const raw = localStorage.getItem('offline_pos_currentUser'); return raw ? JSON.parse(raw) : null; }
function logoutUser(){ localStorage.removeItem('offline_pos_currentUser'); localStorage.removeItem('offline_pos_remember'); window.location.href='login.html'; }

/* Sales export */
function exportSalesCSV(){ const sales=JSON.parse(localStorage.getItem(SALES_KEY)||'[]'); if(sales.length===0) return ''; const rows=[['Date','Item','Qty','Price','Subtotal','Total']]; sales.forEach(s=>{ s.items.forEach(it=>{ rows.push([s.timestamp,it[0],it[1],Number(it[2]).toFixed(2),Number(it[3]).toFixed(2),Number(s.total).toFixed(2)]); }); }); return rows.map(r=>r.map(c=>String(c).replace(/"/g,'""')).map(c=>`"${c}"`).join(',')).join('\n'); }

window.addItemToOrder=addItemToOrder; window.removeItemFromOrder=removeItemFromOrder; window.getCurrentOrder=getCurrentOrder; window.checkoutOrder=checkoutOrder; window.clearOrder=clearOrder; window.generateReceiptHTML=generateReceiptHTML; window.exportProductsCSV=exportProductsCSV; window.addProduct=addProduct; window.importProductsFromCSVText=importProductsFromCSVText; window.getStockSummary=getStockSummary; window.updateProductStock=updateProductStock; window.validateUser=validateUser; window.setCurrentUser=setCurrentUser; window.getCurrentUser=getCurrentUser; window.logoutUser=logoutUser; window.exportSalesCSV=exportSalesCSV;


// --- v3 additions: stock decrement, low-stock alerts, restock logging ---
async function _readProductsMap(){
  const items = await getAllItems(); // returns [[name,cat,price,stock],...]
  const map = {};
  items.forEach(p=>{ map[p[0]] = {name:p[0], category:p[1], price:Number(p[2]), stock: Number(p[3]||0)}; });
  return map;
}
async function _saveProductsMap(map){
  // map: {name:{name,category,price,stock},...}
  const arr = Object.values(map).map(p=>({name:p.name, category:p.category, price:p.price, stock:p.stock}));
  saveProductsToLocalStorage(arr);
  return arr;
}

async function decrementStock(cartItems){
  // cartItems: [[name, qty, price, subtotal], ...] OR {name:{price,qty}}
  const map = await _readProductsMap();
  const low = [];
  const out = [];
  // normalize
  const items = Array.isArray(cartItems) ? cartItems : Object.keys(cartItems).map(k=>[k, cartItems[k].qty, cartItems[k].price, (cartItems[k].qty*cartItems[k].price)]);
  items.forEach(it=>{
    const name = it[0];
    const qty = Number(it[1])||0;
    if(map[name]){
      map[name].stock = Math.max(0, (Number(map[name].stock)||0) - qty);
      if(map[name].stock <= 0) out.push(name);
      else if(map[name].stock <= Number(CONFIG.lowStockThreshold||10)) low.push({name: name, stock: map[name].stock});
    }
  });
  await _saveProductsMap(map);
  return {low, out};
}

function _appendRestockLog(entry){
  const key = 'offline_pos_restock_log';
  const raw = localStorage.getItem(key) || '[]';
  const arr = JSON.parse(raw);
  arr.push(entry);
  localStorage.setItem(key, JSON.stringify(arr));
}

function getRestockLog(){
  return JSON.parse(localStorage.getItem('offline_pos_restock_log')||'[]');
}

// patch checkoutOrder to decrement stock and show alerts
const _orig_checkoutOrder = checkoutOrder;
checkoutOrder = function(){
  const current = getCurrentOrder();
  if(current.order.length===0) return {success:false,msg:"No items in order."};
  // perform original sale recording
  const res = _orig_checkoutOrder();
  if(res.success){
    // decrement stock asynchronously and then alert if low/out
    decrementStock(current.order).then(({low,out})=>{
      let msgs = [];
      if(out.length>0) msgs.push('Out of stock: ' + out.join(', '));
      if(low.length>0) msgs.push('Low stock:\n' + low.map(l=>'- '+l.name+' ('+l.stock+' left)').join('\n'));
      if(msgs.length>0) alert('⚠️ Stock update:\n' + msgs.join('\n\n'));
      // Optionally, trigger UI update by dispatching event
      window.dispatchEvent(new Event('stockUpdated'));
    });
  }
  return res;
};


// --- AUTO-BACKUP UTIL (added v4) ---
function _gatherFullBackup(){
  const products = JSON.parse(localStorage.getItem('offline_pos_products')||'[]');
  const sales = JSON.parse(localStorage.getItem('offline_pos_sales')||'[]');
  const restockLogs = JSON.parse(localStorage.getItem('offline_pos_restock_log')||'[]');
  const users = (typeof USERS!=='undefined') ? USERS.map(u=>({username:u.username, role:u.role})) : [];
  return { exportedAt: new Date().toLocaleString(), products, sales, restockLogs, users };
}
function _autoDownloadBackup(){
  try{
    const data = _gatherFullBackup();
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    const filename = 'pos_autobackup_'+ts+'.json';
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url);
  }catch(e){ console.warn('autobackup failed', e); }
}
