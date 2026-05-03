import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api";

const PRODUCT_IMAGES = {
  "Laptop": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80",
  "Mouse": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&q=80",
  "Keyboard": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80",
  "Monitor": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&q=80",
  "Headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80",
  "USB Hub": "https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=300&q=80",
  "Webcam": "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=300&q=80",
  "Desk Lamp": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&q=80",
};

const CATEGORY_MAP = {
  "Laptop": "Computers", "Monitor": "Computers",
  "Mouse": "Peripherals", "Keyboard": "Peripherals", "USB Hub": "Peripherals", "Webcam": "Peripherals",
  "Headphones": "Audio",
  "Desk Lamp": "Accessories",
};

/* ── CSS injected once ── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; }
  :root {
    --bg: #F7F6F3;
    --surface: #FFFFFF;
    --surface2: #F0EFE9;
    --border: #E5E3DA;
    --text: #1A1A18;
    --text2: #6B6A63;
    --text3: #A8A79F;
    --accent: #2D6A4F;
    --accent-light: #52B788;
    --accent-bg: #D8F3DC;
    --danger: #C1121F;
    --danger-bg: #FFE5E7;
    --warning: #E07C00;
    --warning-bg: #FFF0D6;
    --gold: #B8860B;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 16px 40px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06);
    --radius-sm: 8px;
    --radius: 14px;
    --radius-lg: 20px;
    --transition: 180ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  [data-theme="dark"] {
    --bg: #0F1110;
    --surface: #1A1D1B;
    --surface2: #242724;
    --border: #2E312F;
    --text: #F0EFE9;
    --text2: #9BA39C;
    --text3: #5C6460;
    --accent: #52B788;
    --accent-light: #74C69D;
    --accent-bg: #1A3028;
    --danger: #FF6B6B;
    --danger-bg: #2A1A1A;
    --warning: #FFB830;
    --warning-bg: #2A2010;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
    --shadow-lg: 0 16px 40px rgba(0,0,0,0.5);
  }
  body { background: var(--bg); color: var(--text); transition: background var(--transition), color var(--transition); }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text3); }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
  @keyframes pop { 0% { transform:scale(1); } 50% { transform:scale(1.18); } 100% { transform:scale(1); } }
  .card-hover { transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition); }
  .card-hover:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
  .btn-hover { transition: all var(--transition); }
  .btn-hover:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .btn-hover:active { transform: translateY(0); filter: brightness(0.95); }
  .skeleton {
    background: linear-gradient(90deg, var(--surface2) 25%, var(--border) 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-sm);
  }
  .fade-in { animation: fadeIn 0.3s ease forwards; }
  .slide-in { animation: slideIn 0.25s ease forwards; }
  input, button, select { font-family: 'DM Sans', sans-serif; }
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
  }
  .tag-success { background: var(--accent-bg); color: var(--accent); }
  .tag-danger  { background: var(--danger-bg); color: var(--danger); }
  .tag-warning { background: var(--warning-bg); color: var(--warning); }
  .tag-neutral { background: var(--surface2); color: var(--text2); }
`;

function injectStyles() {
  if (document.getElementById("pos-styles")) return;
  const s = document.createElement("style");
  s.id = "pos-styles";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

/* ── Skeleton card ── */
function SkeletonCard() {
  return (
    <div style={{ background:"var(--surface)", borderRadius:"var(--radius)", overflow:"hidden", boxShadow:"var(--shadow-sm)" }}>
      <div className="skeleton" style={{ height:130 }} />
      <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:8 }}>
        <div className="skeleton" style={{ height:14, width:"70%" }} />
        <div className="skeleton" style={{ height:18, width:"45%" }} />
        <div className="skeleton" style={{ height:11, width:"35%" }} />
      </div>
    </div>
  );
}

/* ── Toast ── */
function Toast({ toasts }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:1000, display:"flex", flexDirection:"column", gap:8, pointerEvents:"none" }}>
      {toasts.map(t => (
        <div key={t.id} className="slide-in" style={{
          background: t.type === "error" ? "var(--danger)" : t.type === "warning" ? "var(--warning)" : "var(--accent)",
          color:"#fff", padding:"10px 16px", borderRadius:"var(--radius-sm)",
          fontSize:13, fontWeight:500, boxShadow:"var(--shadow-md)",
          display:"flex", alignItems:"center", gap:8
        }}>
          {t.type === "error" ? "✕" : t.type === "warning" ? "⚠" : "✓"} {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 2800);
  }, []);
  return { toasts, addToast };
}

/* ── StatCard ── */
function StatCard({ icon, value, label, sub, color = "var(--accent)", trend }) {
  return (
    <div style={{
      background:"var(--surface)", borderRadius:"var(--radius)", padding:"20px 22px",
      boxShadow:"var(--shadow-sm)", borderLeft:`3px solid ${color}`,
      display:"flex", flexDirection:"column", gap:4
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <span style={{ fontSize:26 }}>{icon}</span>
        {trend !== undefined && (
          <span className={`badge ${trend >= 0 ? "tag-success" : "tag-danger"}`}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize:26, fontWeight:700, color:"var(--text)", letterSpacing:"-0.5px", marginTop:6 }}>{value}</div>
      <div style={{ fontSize:13, fontWeight:500, color:"var(--text2)" }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  injectStyles();
  const [page, setPage] = useState("home");
  const [theme, setTheme] = useState("light");
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toasts, addToast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/products/`),
      axios.get(`${API}/analytics/`),
    ]).then(([p, a]) => {
      setProducts(p.data);
      setAnalytics(a.data);
    }).catch(() => {
      // Use mock data for demo
      setProducts(MOCK_PRODUCTS);
      setAnalytics(MOCK_ANALYTICS);
    }).finally(() => setLoading(false));
  }, []);

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalRevenue = analytics?.top_products?.reduce((sum, p) => sum + p.revenue, 0) || 0;
  const lowStockItems = products.filter(p => p.stock <= 5);

  const refreshProducts = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/products/`);
      setProducts(r.data);
    } catch {}
  }, []);

  const navItems = [
    { id:"home", label:"Home", icon:"⌂" },
    { id:"pos", label:"POS", icon:"⊕" },
    { id:"analytics", label:"Analytics", icon:"◎" },
    { id:"inventory", label:"Inventory", icon:"⊞" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      {/* Navbar */}
      <nav style={{
        background:"var(--surface)", borderBottom:"1px solid var(--border)",
        padding:"0 28px", height:58,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:200,
        boxShadow:"var(--shadow-sm)"
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:34, height:34, background:"var(--accent)", borderRadius:"var(--radius-sm)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18
          }}>🏪</div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", lineHeight:1.2 }}>Micronsoft POS</div>
            <div style={{ fontSize:10, color:"var(--text3)", letterSpacing:"0.06em", textTransform:"uppercase", lineHeight:1 }}>Solutions (Pvt) Ltd</div>
          </div>
        </div>

        <div style={{ display:"flex", gap:4 }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              padding:"6px 16px", border:"none", borderRadius:"var(--radius-sm)",
              background: page === n.id ? "var(--accent-bg)" : "transparent",
              color: page === n.id ? "var(--accent)" : "var(--text2)",
              fontWeight: page === n.id ? 600 : 400, cursor:"pointer",
              fontSize:13, display:"flex", alignItems:"center", gap:6,
              transition:"all var(--transition)"
            }}>
              <span style={{ fontSize:15 }}>{n.icon}</span> {n.label}
              {n.id === "inventory" && lowStockItems.length > 0 && (
                <span style={{
                  background:"var(--danger)", color:"#fff",
                  borderRadius:"99px", fontSize:10, fontWeight:700,
                  padding:"0px 5px", minWidth:16, textAlign:"center"
                }}>{lowStockItems.length}</span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ fontSize:12, color:"var(--text3)", fontFamily:"'DM Mono', monospace" }}>
            {new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
          </div>
          <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")} style={{
            width:36, height:36, border:"1px solid var(--border)",
            borderRadius:"var(--radius-sm)", background:"var(--surface2)",
            cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center",
            color:"var(--text2)", transition:"all var(--transition)"
          }}>
            {theme === "light" ? "◑" : "○"}
          </button>
        </div>
      </nav>

      {/* Pages */}
      <div className="fade-in" key={page}>
        {page === "home" && <HomePage products={products} totalRevenue={totalRevenue} totalStock={totalStock} analytics={analytics} setPage={setPage} loading={loading} lowStockItems={lowStockItems} />}
        {page === "pos" && <POSPage products={products} setProducts={setProducts} addToast={addToast} />}
        {page === "analytics" && <AnalyticsPage analytics={analytics} products={products} />}
        {page === "inventory" && <InventoryPage products={products} setProducts={setProducts} addToast={addToast} refreshProducts={refreshProducts} />}
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}

/* ─── HOME PAGE ─── */
function HomePage({ products, totalRevenue, totalStock, analytics, setPage, loading, lowStockItems }) {
  const today = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  return (
    <div style={{ padding:"28px 32px", maxWidth:1200, margin:"0 auto" }}>
      {/* Hero banner */}
      <div style={{
        background:"linear-gradient(135deg, var(--accent) 0%, #1B4332 100%)",
        borderRadius:"var(--radius-lg)", padding:"32px 40px", marginBottom:28,
        display:"flex", justifyContent:"space-between", alignItems:"center",
        position:"relative", overflow:"hidden"
      }}>
        {/* decorative circles */}
        <div style={{ position:"absolute", right:-40, top:-40, width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
        <div style={{ position:"absolute", right:60, bottom:-60, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
        <div>
          <div style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.5)", marginBottom:8 }}>
            POINT OF SALE SYSTEM
          </div>
          <h1 style={{ color:"#fff", fontSize:26, fontWeight:700, letterSpacing:"-0.5px", marginBottom:6 }}>Good day, Operator 👋</h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13 }}>{today}</p>
        </div>
        <div style={{ display:"flex", gap:12, position:"relative", zIndex:1 }}>
          <QuickActionBtn icon="🛒" label="Open POS" onClick={() => setPage("pos")} primary />
          <QuickActionBtn icon="📊" label="Analytics" onClick={() => setPage("analytics")} />
        </div>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div onClick={() => setPage("inventory")} style={{
          background:"var(--warning-bg)", border:"1px solid var(--warning)",
          borderRadius:"var(--radius-sm)", padding:"12px 18px",
          display:"flex", alignItems:"center", gap:10,
          marginBottom:24, cursor:"pointer",
          transition:"opacity var(--transition)"
        }}>
          <span style={{ fontSize:18 }}>⚠️</span>
          <div>
            <span style={{ fontWeight:600, color:"var(--warning)", fontSize:13 }}>Low stock alert: </span>
            <span style={{ fontSize:13, color:"var(--text2)" }}>
              {lowStockItems.map(p => `${p.name} (${p.stock} left)`).join(", ")}
            </span>
          </div>
          <span style={{ marginLeft:"auto", fontSize:12, color:"var(--warning)", fontWeight:500 }}>Manage →</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
        {loading ? (
          [0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height:110, borderRadius:"var(--radius)" }} />)
        ) : <>
          <StatCard icon="📦" value={products.length} label="Products Listed" color="var(--accent)" />
          <StatCard icon="🏬" value={totalStock.toLocaleString()} label="Total Stock Units" sub={`${lowStockItems.length} low stock`} color="#2196F3" />
          <StatCard icon="💰" value={`$${totalRevenue.toFixed(0)}`} label="Recorded Revenue" color="#E07C00" trend={12} />
          <StatCard icon="⭐" value={analytics?.top_products?.length || 0} label="Top Performers" color="#9C27B0" />
        </>}
      </div>

      {/* Bottom split */}
      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:20 }}>
        {/* Top products table */}
        <div style={{ background:"var(--surface)", borderRadius:"var(--radius)", padding:24, boxShadow:"var(--shadow-sm)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h3 style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>Top Products by Revenue</h3>
            <span className="badge tag-success">Live</span>
          </div>
          {analytics?.top_products?.map((p, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"11px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none"
            }}>
              <div style={{
                width:28, height:28, borderRadius:"50%", fontSize:12, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                background: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "var(--surface2)",
                color: i < 3 ? "#fff" : "var(--text3)"
              }}>{i + 1}</div>
              <img src={PRODUCT_IMAGES[p.name]} alt={p.name} style={{ width:36, height:36, borderRadius:8, objectFit:"cover", background:"var(--surface2)" }} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:500, fontSize:13, color:"var(--text)" }}>{p.name}</div>
                <div style={{ fontSize:11, color:"var(--text3)" }}>{CATEGORY_MAP[p.name] || "Other"}</div>
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:"var(--accent)", textAlign:"right" }}>${p.revenue.toFixed(2)}</div>
                <div style={{ height:3, background:"var(--surface2)", borderRadius:99, marginTop:5, width:80 }}>
                  <div style={{
                    height:3, borderRadius:99, background:"var(--accent-light)",
                    width:`${(p.revenue / analytics.top_products[0].revenue) * 100}%`
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div style={{ background:"var(--surface)", borderRadius:"var(--radius)", padding:24, boxShadow:"var(--shadow-sm)" }}>
          <h3 style={{ fontWeight:700, fontSize:15, color:"var(--text)", marginBottom:18 }}>Stock by Category</h3>
          {Object.entries(
            products.reduce((acc, p) => {
              const cat = CATEGORY_MAP[p.name] || "Other";
              acc[cat] = (acc[cat] || 0) + p.stock;
              return acc;
            }, {})
          ).map(([cat, stock], i, arr) => {
            const max = Math.max(...arr.map(e => e[1]));
            const colors = ["var(--accent)", "#2196F3", "#E07C00", "#9C27B0", "#C1121F"];
            return (
              <div key={cat} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
                  <span style={{ fontWeight:500, color:"var(--text)" }}>{cat}</span>
                  <span style={{ color:"var(--text2)", fontFamily:"'DM Mono', monospace", fontSize:12 }}>{stock} units</span>
                </div>
                <div style={{ height:6, background:"var(--surface2)", borderRadius:99 }}>
                  <div style={{ height:6, borderRadius:99, background:colors[i % colors.length], width:`${(stock/max)*100}%`, transition:"width 0.6s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, onClick, primary }) {
  return (
    <button onClick={onClick} className="btn-hover" style={{
      padding:"10px 20px", border: primary ? "none" : "1px solid rgba(255,255,255,0.25)",
      borderRadius:"var(--radius-sm)", cursor:"pointer",
      background: primary ? "#fff" : "rgba(255,255,255,0.1)",
      color: primary ? "var(--accent)" : "#fff",
      fontWeight:600, fontSize:13,
      display:"flex", alignItems:"center", gap:6, backdropFilter:"blur(4px)"
    }}>
      {icon} {label}
    </button>
  );
}

/* ─── ANALYTICS PAGE ─── */
function AnalyticsPage({ analytics, products }) {
  if (!analytics) return <LoadingState />;
  const maxRevenue = Math.max(...(analytics.daily_revenue?.map(d => d.revenue) || [1]));
  const totalRev = analytics.top_products?.reduce((s, p) => s + p.revenue, 0) || 0;

  return (
    <div style={{ padding:"28px 32px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ fontWeight:700, fontSize:22, color:"var(--text)", letterSpacing:"-0.5px" }}>Analytics Dashboard</h2>
        <span className="badge tag-neutral" style={{ fontSize:12 }}>Last 30 days</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {/* Bar chart */}
        <div style={{ background:"var(--surface)", borderRadius:"var(--radius)", padding:24, boxShadow:"var(--shadow-sm)" }}>
          <h3 style={{ fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:4 }}>Daily Revenue</h3>
          <div style={{ fontSize:12, color:"var(--text3)", marginBottom:18 }}>Last 30 days · hover for details</div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:140 }}>
            {analytics.daily_revenue?.slice(-30).map((d, i) => (
              <div key={i} title={`${d.date}: $${d.revenue.toFixed(2)}`} style={{
                flex:1, height:`${Math.max(4, (d.revenue / maxRevenue) * 130)}px`,
                background:`linear-gradient(180deg, var(--accent-light), var(--accent))`,
                borderRadius:"3px 3px 0 0", cursor:"default", opacity:0.85,
                transition:"opacity var(--transition)"
              }} onMouseEnter={e => e.target.style.opacity=1} onMouseLeave={e => e.target.style.opacity=0.85} />
            ))}
          </div>
          <div style={{ height:1, background:"var(--border)", marginTop:4 }} />
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--text3)", marginTop:6 }}>
            <span>30 days ago</span><span>Today</span>
          </div>
        </div>

        {/* Donut-style breakdown */}
        <div style={{ background:"var(--surface)", borderRadius:"var(--radius)", padding:24, boxShadow:"var(--shadow-sm)" }}>
          <h3 style={{ fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:18 }}>Revenue Share</h3>
          {analytics.top_products?.map((p, i) => {
            const pct = ((p.revenue / totalRev) * 100).toFixed(1);
            const colors = ["var(--accent)", "#2196F3", "#E07C00", "#9C27B0", "#C1121F"];
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:colors[i], flexShrink:0 }} />
                <span style={{ flex:1, fontSize:13, color:"var(--text)", fontWeight:500 }}>{p.name}</span>
                <div style={{ width:80, height:4, background:"var(--surface2)", borderRadius:99 }}>
                  <div style={{ width:`${pct}%`, height:4, background:colors[i], borderRadius:99 }} />
                </div>
                <span style={{ fontSize:12, color:"var(--text2)", fontFamily:"'DM Mono',monospace", width:36, textAlign:"right" }}>{pct}%</span>
                <span style={{ fontSize:12, color:"var(--accent)", fontWeight:600, width:60, textAlign:"right" }}>${p.revenue.toFixed(0)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary table */}
      <div style={{ background:"var(--surface)", borderRadius:"var(--radius)", padding:24, boxShadow:"var(--shadow-sm)" }}>
        <h3 style={{ fontWeight:600, fontSize:14, color:"var(--text)", marginBottom:18 }}>Product Summary</h3>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid var(--border)" }}>
              {["Product","Category","Stock","Status","Revenue"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"8px 12px", fontSize:11, fontWeight:600, color:"var(--text3)", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const rev = analytics.top_products?.find(t => t.name === p.name)?.revenue;
              return (
                <tr key={i} style={{ borderBottom:"1px solid var(--border)", transition:"background var(--transition)" }}
                  onMouseEnter={e => e.currentTarget.style.background="var(--surface2)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <td style={{ padding:"10px 12px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <img src={PRODUCT_IMAGES[p.name]} alt={p.name} style={{ width:28, height:28, borderRadius:6, objectFit:"cover" }} />
                      <span style={{ fontSize:13, fontWeight:500, color:"var(--text)" }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:"10px 12px", fontSize:12, color:"var(--text2)" }}>{CATEGORY_MAP[p.name] || "Other"}</td>
                  <td style={{ padding:"10px 12px", fontFamily:"'DM Mono',monospace", fontSize:12, color:"var(--text)" }}>{p.stock}</td>
                  <td style={{ padding:"10px 12px" }}>
                    <span className={`badge ${p.stock === 0 ? "tag-danger" : p.stock <= 5 ? "tag-warning" : "tag-success"}`}>
                      {p.stock === 0 ? "Out" : p.stock <= 5 ? "Low" : "OK"}
                    </span>
                  </td>
                  <td style={{ padding:"10px 12px", fontWeight:600, color:"var(--accent)", fontSize:13, fontFamily:"'DM Mono',monospace" }}>
                    {rev ? `$${rev.toFixed(2)}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── INVENTORY PAGE ─── */
function InventoryPage({ products, setProducts, addToast, refreshProducts }) {
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState("");
  const [searchQ, setSearchQ] = useState("");

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase()));

  const handleRestock = async (id) => {
    const qty = parseInt(restockQty);
    if (!qty || qty <= 0) { addToast("Enter a valid quantity", "error"); return; }
    try {
      await axios.patch(`${API}/products/${id}/`, { stock: (products.find(p => p.id === id)?.stock || 0) + qty });
      await refreshProducts();
      addToast("Stock updated successfully");
    } catch {
      // Mock update for demo
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + qty } : p));
      addToast("Stock updated (demo mode)");
    }
    setRestockId(null);
    setRestockQty("");
  };

  return (
    <div style={{ padding:"28px 32px", maxWidth:1100, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ fontWeight:700, fontSize:22, color:"var(--text)", letterSpacing:"-0.5px" }}>Inventory Management</h2>
        <div style={{ position:"relative" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", fontSize:14 }}>⌕</span>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search products…" style={{
            padding:"8px 12px 8px 30px", borderRadius:"var(--radius-sm)",
            border:"1px solid var(--border)", background:"var(--surface)",
            color:"var(--text)", fontSize:13, outline:"none", width:220
          }} />
        </div>
      </div>

      <div style={{ background:"var(--surface)", borderRadius:"var(--radius)", boxShadow:"var(--shadow-sm)", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"var(--surface2)", borderBottom:"1px solid var(--border)" }}>
              {["Product","Category","Price","Stock","Status","Action"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"12px 16px", fontSize:11, fontWeight:600, color:"var(--text3)", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <>
                <tr key={i} style={{ borderBottom:"1px solid var(--border)", transition:"background var(--transition)" }}
                  onMouseEnter={e => e.currentTarget.style.background="var(--surface2)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <img src={PRODUCT_IMAGES[p.name]} alt={p.name} style={{ width:36, height:36, borderRadius:8, objectFit:"cover" }} />
                      <span style={{ fontWeight:500, fontSize:13, color:"var(--text)" }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:12, color:"var(--text2)" }}>{CATEGORY_MAP[p.name] || "Other"}</td>
                  <td style={{ padding:"12px 16px", fontWeight:600, fontSize:13, color:"var(--accent)", fontFamily:"'DM Mono',monospace" }}>${parseFloat(p.price).toFixed(2)}</td>
                  <td style={{ padding:"12px 16px", fontSize:13, fontFamily:"'DM Mono',monospace", color:"var(--text)", fontWeight:p.stock <= 5 ? 700 : 400 }}>{p.stock}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span className={`badge ${p.stock === 0 ? "tag-danger" : p.stock <= 5 ? "tag-warning" : "tag-success"}`}>
                      {p.stock === 0 ? "Out of Stock" : p.stock <= 5 ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    <button onClick={() => setRestockId(restockId === p.id ? null : p.id)} className="btn-hover" style={{
                      padding:"5px 14px", fontSize:12, fontWeight:600,
                      border:"1px solid var(--border)", borderRadius:"var(--radius-sm)",
                      background:"var(--surface)", color:"var(--text)", cursor:"pointer"
                    }}>
                      {restockId === p.id ? "Cancel" : "+ Restock"}
                    </button>
                  </td>
                </tr>
                {restockId === p.id && (
                  <tr key={`${i}-restock`} style={{ background:"var(--accent-bg)" }}>
                    <td colSpan={6} style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:13, color:"var(--accent)", fontWeight:500 }}>Add stock for {p.name}:</span>
                        <input type="number" min={1} value={restockQty} onChange={e => setRestockQty(e.target.value)}
                          placeholder="Quantity" style={{
                            padding:"6px 10px", width:120, borderRadius:"var(--radius-sm)",
                            border:"1px solid var(--accent)", background:"var(--surface)",
                            color:"var(--text)", fontSize:13, outline:"none"
                          }} />
                        <button onClick={() => handleRestock(p.id)} className="btn-hover" style={{
                          padding:"6px 16px", background:"var(--accent)", color:"#fff",
                          border:"none", borderRadius:"var(--radius-sm)", cursor:"pointer",
                          fontWeight:600, fontSize:13
                        }}>Confirm</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── POS PAGE ─── */
function POSPage({ products, setProducts, addToast }) {
  const [cart, setCart] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [discount, setDiscount] = useState(0);
  const [addedId, setAddedId] = useState(null);
  const [note, setNote] = useState("");

  // Esc to clear cart
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setCart([]); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map(p => CATEGORY_MAP[p.name] || "Other")))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || CATEGORY_MAP[p.name] === activeCategory;
    return matchSearch && matchCat;
  });

  const addToCart = (product) => {
    if (product.stock === 0) { addToast("Out of stock", "error"); return; }
    const inCart = cart.find(i => i.id === product.id)?.qty || 0;
    if (inCart >= product.stock) { addToast("Max stock reached", "warning"); return; }
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 400);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const subtotal = cart.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);
  const discountAmt = subtotal * (discount / 100);
  const grandTotal = subtotal - discountAmt;

  const checkout = async () => {
    if (!cart.length) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/checkout/`, {
        items: cart.map(i => ({ product_id: i.id, quantity: i.qty })),
        total_amount: grandTotal.toFixed(2),
      });
      setReceipt({ ...res.data, items: cart, total: grandTotal, subtotal, discount, discountAmt, note });
      setCart([]); setNote(""); setDiscount(0);
      const updated = await axios.get(`${API}/products/`);
      setProducts(updated.data);
    } catch {
      // Demo mode
      const mockId = Math.floor(Math.random() * 90000 + 10000);
      setReceipt({ order_id: mockId, items: cart, total: grandTotal, subtotal, discount, discountAmt, note });
      setCart([]); setNote(""); setDiscount(0);
    }
    setLoading(false);
  };

  if (receipt) return <Receipt receipt={receipt} onClose={() => setReceipt(null)} />;

  return (
    <div style={{ display:"flex", height:"calc(100vh - 58px)", overflow:"hidden" }}>
      {/* Products panel */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Toolbar */}
        <div style={{ padding:"16px 24px", background:"var(--surface)", borderBottom:"1px solid var(--border)", display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1, maxWidth:280 }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", fontSize:15 }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products… (Esc = clear cart)" style={{
              width:"100%", padding:"8px 10px 8px 32px", borderRadius:"var(--radius-sm)",
              border:"1px solid var(--border)", background:"var(--bg)",
              color:"var(--text)", fontSize:13, outline:"none"
            }} />
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding:"6px 12px", fontSize:12, fontWeight:activeCategory === cat ? 600 : 400,
                border:"1px solid", cursor:"pointer",
                borderRadius:"var(--radius-sm)", transition:"all var(--transition)",
                borderColor: activeCategory === cat ? "var(--accent)" : "var(--border)",
                background: activeCategory === cat ? "var(--accent-bg)" : "var(--surface)",
                color: activeCategory === cat ? "var(--accent)" : "var(--text2)"
              }}>{cat}</button>
            ))}
          </div>
          <span style={{ fontSize:12, color:"var(--text3)", marginLeft:"auto" }}>{filtered.length} items</span>
        </div>

        {/* Product grid */}
        <div style={{ flex:1, overflowY:"auto", padding:20 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:14 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => addToCart(p)} className="card-hover" style={{
                background:"var(--surface)", borderRadius:"var(--radius)", overflow:"hidden",
                cursor: p.stock === 0 ? "not-allowed" : "pointer",
                boxShadow:"var(--shadow-sm)",
                border:`2px solid ${addedId === p.id ? "var(--accent)" : "transparent"}`,
                opacity: p.stock === 0 ? 0.5 : 1,
                transform: addedId === p.id ? "scale(0.97)" : undefined
              }}>
                <div style={{ height:116, overflow:"hidden", background:"var(--surface2)", position:"relative" }}>
                  <img src={PRODUCT_IMAGES[p.name]} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  {p.stock <= 5 && p.stock > 0 && (
                    <div style={{ position:"absolute", top:8, right:8 }}>
                      <span className="badge tag-warning" style={{ fontSize:10 }}>Low</span>
                    </div>
                  )}
                  {p.stock === 0 && (
                    <div style={{
                      position:"absolute", inset:0, background:"rgba(0,0,0,0.45)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, fontWeight:700, color:"#fff", letterSpacing:"0.06em"
                    }}>OUT OF STOCK</div>
                  )}
                  {cart.find(i => i.id === p.id) && (
                    <div style={{
                      position:"absolute", top:8, left:8,
                      background:"var(--accent)", color:"#fff", borderRadius:"99px",
                      width:22, height:22, fontSize:11, fontWeight:700,
                      display:"flex", alignItems:"center", justifyContent:"center"
                    }}>{cart.find(i => i.id === p.id).qty}</div>
                  )}
                </div>
                <div style={{ padding:"10px 12px" }}>
                  <div style={{ fontWeight:600, fontSize:13, color:"var(--text)", marginBottom:3 }}>{p.name}</div>
                  <div style={{ fontWeight:700, fontSize:15, color:"var(--accent)" }}>${parseFloat(p.price).toFixed(2)}</div>
                  <div style={{ fontSize:10, color:"var(--text3)", marginTop:3 }}>Stock: {p.stock}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart panel */}
      <div style={{ width:310, background:"var(--surface)", display:"flex", flexDirection:"column", borderLeft:"1px solid var(--border)" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>
            🛒 Cart {cart.length > 0 && <span style={{ fontWeight:400, color:"var(--text3)", fontSize:12 }}>({cart.reduce((s,i) => s + i.qty, 0)} items)</span>}
          </h3>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} style={{ fontSize:11, color:"var(--danger)", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Clear all</button>
          )}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"12px 16px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign:"center", padding:"48px 0", color:"var(--text3)" }}>
              <div style={{ fontSize:48, marginBottom:12, opacity:0.4 }}>🛒</div>
              <div style={{ fontSize:13 }}>No items yet</div>
              <div style={{ fontSize:11, marginTop:4 }}>Click a product to add</div>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="slide-in" style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
              <img src={PRODUCT_IMAGES[item.name]} alt={item.name} style={{ width:40, height:40, borderRadius:8, objectFit:"cover", flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:12, color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.name}</div>
                <div style={{ color:"var(--accent)", fontSize:12, fontWeight:700 }}>${(parseFloat(item.price) * item.qty).toFixed(2)}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                <QtyBtn onClick={() => updateQty(item.id, -1)}>−</QtyBtn>
                <span style={{ width:22, textAlign:"center", fontWeight:700, fontSize:13, fontFamily:"'DM Mono',monospace" }}>{item.qty}</span>
                <QtyBtn onClick={() => updateQty(item.id, 1)}>+</QtyBtn>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div style={{ padding:"14px 16px", borderTop:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:12 }}>
          {/* Discount */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:"var(--text2)", flex:1 }}>Discount %</span>
            <div style={{ display:"flex", gap:4 }}>
              {[0,5,10,15,20].map(d => (
                <button key={d} onClick={() => setDiscount(d)} style={{
                  padding:"3px 7px", fontSize:11, fontWeight:600, cursor:"pointer",
                  border:"1px solid", borderRadius:6,
                  borderColor: discount === d ? "var(--accent)" : "var(--border)",
                  background: discount === d ? "var(--accent-bg)" : "var(--surface2)",
                  color: discount === d ? "var(--accent)" : "var(--text2)"
                }}>{d}%</button>
              ))}
            </div>
          </div>

          {/* Note */}
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Order note (optional)…" style={{
            padding:"6px 10px", fontSize:12, borderRadius:"var(--radius-sm)",
            border:"1px solid var(--border)", background:"var(--bg)",
            color:"var(--text)", outline:"none"
          }} />

          {/* Totals */}
          <div style={{ display:"flex", flexDirection:"column", gap:6, padding:"8px 0", borderTop:"1px solid var(--border)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--text2)" }}>
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--danger)" }}>
                <span>Discount ({discount}%)</span><span>−${discountAmt.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:18, fontWeight:700, color:"var(--text)" }}>
              <span>Total</span>
              <span style={{ color:"var(--accent)", fontFamily:"'DM Mono',monospace" }}>${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button onClick={checkout} disabled={!cart.length || loading} className="btn-hover" style={{
            padding:"13px 0", fontWeight:700, fontSize:14,
            background: cart.length ? "var(--accent)" : "var(--surface2)",
            color: cart.length ? "#fff" : "var(--text3)",
            border:"none", borderRadius:"var(--radius-sm)",
            cursor: cart.length ? "pointer" : "not-allowed",
            letterSpacing:"0.02em"
          }}>
            {loading ? "Processing…" : cart.length ? `Checkout · $${grandTotal.toFixed(2)}` : "Cart is empty"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QtyBtn({ onClick, children }) {
  return (
    <button onClick={onClick} className="btn-hover" style={{
      width:24, height:24, border:"1px solid var(--border)", borderRadius:6,
      background:"var(--surface2)", cursor:"pointer", fontSize:14, fontWeight:600,
      color:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1
    }}>{children}</button>
  );
}

/* ─── RECEIPT ─── */
function Receipt({ receipt, onClose }) {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><style>
      body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
      .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
      .hr { border-top: 1px dashed #000; margin: 8px 0; }
    </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="fade-in" style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 24px", background:"var(--bg)", minHeight:"calc(100vh - 58px)" }}>
      <div style={{ marginBottom:24, textAlign:"center" }}>
        <div style={{ fontSize:40 }}>✅</div>
        <h2 style={{ fontWeight:700, fontSize:22, color:"var(--text)", marginTop:8 }}>Order Successful</h2>
        <p style={{ color:"var(--text2)", fontSize:13, marginTop:4 }}>Transaction recorded successfully</p>
      </div>

      <div ref={printRef} style={{
        width:320, background:"#fff", color:"#111",
        padding:"24px 20px", fontFamily:"'Courier New', monospace",
        fontSize:12, boxShadow:"var(--shadow-lg)", borderRadius:4,
        border:"1px solid #e0e0e0"
      }}>
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:17, letterSpacing:"0.06em" }}>MICRONSOFT POS</div>
          <div style={{ fontSize:11, color:"#555" }}>Solutions (Pvt) Ltd</div>
          <div style={{ fontSize:10, color:"#888", marginTop:4 }}>Colombo, Sri Lanka</div>
          <div style={{ borderTop:"1px dashed #aaa", marginTop:10, paddingTop:10, fontSize:11, color:"#555" }}>
            <div>Order #{receipt.order_id}</div>
            <div>{new Date().toLocaleString()}</div>
          </div>
        </div>

        <div style={{ borderTop:"1px dashed #aaa", paddingTop:10 }}>
          {receipt.items.map(item => (
            <div key={item.id} style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span>{item.name} x{item.qty}</span>
              <span>${(parseFloat(item.price) * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop:"1px dashed #aaa", marginTop:10, paddingTop:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span>Subtotal</span><span>${receipt.subtotal?.toFixed(2)}</span>
          </div>
          {receipt.discount > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span>Discount ({receipt.discount}%)</span><span>-${receipt.discountAmt?.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700, fontSize:14, marginTop:6 }}>
            <span>TOTAL</span><span>${receipt.total.toFixed(2)}</span>
          </div>
        </div>

        {receipt.note && (
          <div style={{ borderTop:"1px dashed #aaa", marginTop:10, paddingTop:10, fontSize:11, color:"#555" }}>
            Note: {receipt.note}
          </div>
        )}

        <div style={{ borderTop:"1px dashed #aaa", marginTop:14, paddingTop:12, textAlign:"center", fontSize:11, color:"#555" }}>
          <div>Thank you for your purchase!</div>
          <div style={{ marginTop:4, letterSpacing:"0.08em" }}>*** CUSTOMER COPY ***</div>
        </div>
      </div>

      <div style={{ display:"flex", gap:12, marginTop:24 }}>
        <button onClick={handlePrint} className="btn-hover" style={{
          padding:"11px 24px", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)",
          background:"var(--surface)", color:"var(--text)", cursor:"pointer", fontWeight:600, fontSize:13
        }}>🖨 Print Receipt</button>
        <button onClick={onClose} className="btn-hover" style={{
          padding:"11px 28px", background:"var(--accent)", color:"#fff",
          border:"none", borderRadius:"var(--radius-sm)", cursor:"pointer", fontWeight:700, fontSize:14
        }}>+ New Sale</button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", color:"var(--text3)", fontSize:14 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:32, marginBottom:12, animation:"pulse 1.5s infinite" }}>⏳</div>
        Loading data…
      </div>
    </div>
  );
}

/* ── Mock data for demo (remove when backend is live) ── */
const MOCK_PRODUCTS = [
  { id:1, name:"Laptop", price:"1299.99", stock:12 },
  { id:2, name:"Mouse", price:"29.99", stock:4 },
  { id:3, name:"Keyboard", price:"89.99", stock:18 },
  { id:4, name:"Monitor", price:"399.99", stock:7 },
  { id:5, name:"Headphones", price:"149.99", stock:0 },
  { id:6, name:"USB Hub", price:"34.99", stock:2 },
  { id:7, name:"Webcam", price:"79.99", stock:9 },
  { id:8, name:"Desk Lamp", price:"24.99", stock:22 },
];

const MOCK_ANALYTICS = {
  top_products: [
    { name:"Laptop", revenue:15599.88 },
    { name:"Monitor", revenue:7199.82 },
    { name:"Headphones", revenue:4049.73 },
    { name:"Keyboard", revenue:1799.80 },
    { name:"Mouse", revenue:899.70 },
  ],
  daily_revenue: Array.from({ length:30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0,10),
    revenue: Math.random() * 3000 + 500
  }))
};