async function _fetchCSV(url){
  const res = await fetch(url);
  const txt = await res.text();
  return txt;
}
function _parseCSV(text){
  const lines = text.split(/\r?\n/).filter(l=>l.trim()!=="");
  if(lines.length===0) return [];
  // simple CSV parse that supports commas within quotes would be more complex; this is ok for basic CSVs
  const headers = lines[0].split(',').map(h=>h.trim());
  const rows = [];
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].split(',');
    const obj = {};
    for(let j=0;j<headers.length;j++){ obj[headers[j]] = (cols[j]||"").trim(); }
    rows.push(obj);
  }
  return rows;
}
async function loadProducts(){
  let products = [];
  try{
    const csv = await _fetchCSV('assets/products.csv');
    const parsed = _parseCSV(csv);
    parsed.forEach(r=>{
      const keys = Object.keys(r);
      const nameKey = keys.find(k=>/name|product|item/i.test(k))||keys[0];
      const catKey = keys.find(k=>/category|cat|type/i.test(k))||keys[1]||keys[0];
      const priceKey = keys.find(k=>/price|amount|cost|rate/i.test(k))||keys[keys.length-1];
      const stockKey = keys.find(k=>/stock|qty|quantity|balance/i.test(k));
      const name = r[nameKey] || 'Unnamed';
      const category = r[catKey] || 'Uncategorized';
      const price = parseFloat((r[priceKey]||"0").replace(/[^0-9\.\-]/g,''))||0.0;
      const stock = stockKey ? parseInt(r[stockKey]||"0")||0 : 0;
      products.push({name, category, price, stock});
    });
  }catch(e){ console.warn('Could not load CSV', e); }
  try{
    const localRaw = localStorage.getItem('offline_pos_products');
    if(localRaw){
      const local = JSON.parse(localRaw);
      const map = {};
      products.forEach(p=>{ map[p.name] = p; });
      local.forEach(p=>{ map[p.name] = p; });
      products = Object.values(map);
    }
  }catch(e){ console.warn('local read failed', e); }
  products.sort((a,b)=> (a.category||'').localeCompare(b.category||'') || a.name.localeCompare(b.name));
  return products;
}
async function getAllItems(){ const p = await loadProducts(); return p.map(x=>[x.name,x.category,x.price,x.stock]); }
function saveProductsToLocalStorage(productsArray){ localStorage.setItem('offline_pos_products', JSON.stringify(productsArray)); }
window.getAllItems = getAllItems;
window.saveProductsToLocalStorage = saveProductsToLocalStorage;
