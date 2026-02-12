const STORE = {
  name: "STARBUDS",
  ownerName: "Hakim",
  ownerPhone: "6043653943",
  orderEmail: "2012.htcme@gmail.com" 



const PRODUCTS = [
  { id: "p1", name: "WHITE RHINO", price: 10/GRAM, category: "INDICA", img: "images/WHITE RHINO.jpg" },
  { id: "p2", name: "DEATH BUBBA", price: 30/3.5GRAM, category: "INDICA", img: "images/DEATH BUBBA.jpg" },
  { id: "p3", name: "TUNA KHUSH", price: 50/QUATER OUNCE, category: "INDICA", img: "images/TUNA KHUSH.jpg" },
  { id: "p4", name: "PURPLE KHUSH", price: 100/HALF OUNCE, category: "INDICA", img: "images/PURPLE KHUSH.jpg" },



const cart = new Map();

const els = {
  grid: document.getElementById("productGrid"),
  cartItems: document.getElementById("cartItems"),
  cartCount: document.getElementById("cartCount"),
  cartTotal: document.getElementById("cartTotal"),
  clearCart: document.getElementById("clearCart"),
  search: document.getElementById("search"),
  categoryFilter: document.getElementById("categoryFilter"),
  orderSummary: document.getElementById("orderSummary"),
  form: document.getElementById("checkoutForm"),
  success: document.getElementById("success"),
  year: document.getElementById("year")
};

els.year.textContent = new Date().getFullYear();

function money(n){ return `$${n.toFixed(2)}`; }

function addToCart(id, qty=1){
  const current = cart.get(id) || 0;
  cart.set(id, Math.max(0, current + qty));
  if (cart.get(id) === 0) cart.delete(id);
  renderCart();
}

function setQty(id, qty){
  if (qty <= 0) cart.delete(id);
  else cart.set(id, qty);
  renderCart();
}

function cartTotals(){
  let count = 0;
  let total = 0;
  for (const [id, qty] of cart.entries()){
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) continue;
    count += qty;
    total += p.price * qty;
  }
  return { count, total };
}

function filteredProducts(){
  const q = (els.search.value || "").trim().toLowerCase();
  const cat = els.categoryFilter.value;

  return PRODUCTS.filter(p => {
    const matchesText = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchesCat = (cat === "all") || (p.category === cat);
    return matchesText && matchesCat;
  });
}

function renderProducts(){
  const list = filteredProducts();

  if (!list.length){
    els.grid.innerHTML = `<div class="card"><b>No products found.</b><div class="pcat">Try a different search or category.</div></div>`;
    return;
  }

  els.grid.innerHTML = list.map(p => {
    const qty = cart.get(p.id) || 0;
    return `
      <div class="card">
        <div class="card-top">
          <img class="pimg" src="${p.img}" alt="${escapeHtml(p.name)}"
            onerror="this.style.display='none'; this.insertAdjacentHTML('afterend','<div class=&quot;pimg&quot; style=&quot;display:flex;align-items:center;justify-content:center;color:rgba(233,238,251,.55);font-size:12px;&quot;>Add image</div>');" />
          <div class="pmeta">
            <p class="pname">${escapeHtml(p.name)}</p>
            <p class="pcat">${escapeHtml(p.category)}</p>
            <div class="pprice">${money(p.price)}</div>
          </div>
        </div>

        <div class="card-actions">
          <div class="qty" aria-label="Quantity controls">
            <button type="button" data-minus="${p.id}">−</button>
            <span id="qty-${p.id}">${qty}</span>
            <button type="button" data-plus="${p.id}">+</button>
          </div>
          <button class="btn primary" type="button" data-add="${p.id}">Add</button>
        </div>
      </div>
    `;
  }).join("");

  // wire events
  els.grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add, 1));
  });
  els.grid.querySelectorAll("[data-plus]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.plus, 1));
  });
  els.grid.querySelectorAll("[data-minus]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.minus, -1));
  });
}

function renderCart(){
  const { count, total } = cartTotals();
  els.cartCount.textContent = String(count);
  els.cartTotal.textContent = money(total);

  if (count === 0){
    els.cartItems.innerHTML = `<div class="cart-item"><div class="cart-item-left"><div class="cart-item-name">Cart is empty</div><div class="cart-item-sub">Add products to checkout.</div></div></div>`;
  } else {
    els.cartItems.innerHTML = Array.from(cart.entries()).map(([id, qty]) => {
      const p = PRODUCTS.find(x => x.id === id);
      const line = p ? p.price * qty : 0;
      return `
        <div class="cart-item">
          <div class="cart-item-left">
            <div class="cart-item-name">${escapeHtml(p?.name || id)}</div>
            <div class="cart-item-sub">${qty} × ${money(p?.price || 0)} = <b>${money(line)}</b></div>
          </div>
          <div class="cart-item-right">
            <div class="qty">
              <button type="button" data-cminus="${id}">−</button>
              <span>${qty}</span>
              <button type="button" data-cplus="${id}">+</button>
            </div>
            <button type="button" class="btn remove" data-remove="${id}">Remove</button>
          </div>
        </div>
      `;
    }).join("");

    els.cartItems.querySelectorAll("[data-cplus]").forEach(btn => {
      btn.addEventListener("click", () => addToCart(btn.dataset.cplus, 1));
    });
    els.cartItems.querySelectorAll("[data-cminus]").forEach(btn => {
      btn.addEventListener("click", () => addToCart(btn.dataset.cminus, -1));
    });
    els.cartItems.querySelectorAll("[data-remove]").forEach(btn => {
      btn.addEventListener("click", () => cart.delete(btn.dataset.remove) || renderCart());
    });
  }

  els.orderSummary.textContent = buildOrderText();
  renderProducts(); 
}

function buildOrderText(){
  const { count, total } = cartTotals();
  if (count === 0) return "Your cart is empty.";

  const lines = [];
  lines.push(`${STORE.name} ORDER (COD)`);
  lines.push(`Payment: Pay on Delivery (COD)`);
  lines.push(`----------------------------------------`);

  for (const [id, qty] of cart.entries()){
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) continue;
    lines.push(`${p.name} — ${qty} × ${money(p.price)} = ${money(p.price * qty)}`);
  }

  lines.push(`----------------------------------------`);
  lines.push(`Items: ${count}`);
  lines.push(`Total: ${money(total)}`);
  return lines.join("\n");
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

els.clearCart.addEventListener("click", () => {
  cart.clear();
  renderCart();
});

els.search.addEventListener("input", renderProducts);
els.categoryFilter.addEventListener("change", renderProducts);

els.form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("custName").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const address = document.getElementById("custAddress").value.trim();
  const notes = document.getElementById("custNotes").value.trim();

  const { count, total } = cartTotals();
  if (count === 0){
    showMsg("Please add at least 1 product to your cart before placing an order.");
    return;
  }
  if (!name || !phone || !address){
    showMsg("Please fill your name, phone number, and delivery address.");
    return;
  }

  // Build an email (mailto). 
  const subject = encodeURIComponent(`${STORE.name} Order (COD) — ${name}`);
  const body = encodeURIComponent(
`Customer Details
Name: ${name}
Phone: ${phone}
Address: ${address}
Notes: ${notes || "-"}

${buildOrderText()}

Owner: ${STORE.ownerName} (${STORE.ownerPhone})
Hours: 7 days/week, 8:00 AM – 12:00 AM
`
  );

  
  const mailto = `mailto:${STORE.orderEmail}?subject=${subject}&body=${body}`;

  
  showMsg("Order prepared! Your phone/email app will open now to send the order. If it doesn’t open, call Hakim to order.");
  window.location.href = mailto;

 
});

function showMsg(text){
  els.success.hidden = false;
  els.success.textContent = text;
}


renderProducts();
renderCart();
