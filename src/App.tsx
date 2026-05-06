import { useState, useEffect } from “react”;

const LOCATION_TYPES = [“Retail Store”, “Vending Machine”] as const;
const DAYS = [“Sun”, “Mon”, “Tue”, “Wed”, “Thu”, “Fri”, “Sat”];
const STOCK_STATUS = [“In Stock”, “Low Stock”, “Empty”, “Unknown”] as const;

type StockStatus = typeof STOCK_STATUS[number];

interface Location {
id: number;
name: string;
type: string;
bestDays: string[];
bestTime: string;
status: StockStatus;
notes: string;
lastVisit: string;
lastFound: string;
visits: number;
hits: number;
}

const STATUS_COLORS: Record<StockStatus, string> = {
“In Stock”: “#4ade80”,
“Low Stock”: “#facc15”,
“Empty”: “#f87171”,
“Unknown”: “#94a3b8”,
};

const POKEBALL_SVG = (
<svg viewBox="0 0 40 40" width="22" height="22" fill="none">
<circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5"/>
<path d="M2 20h36" stroke="currentColor" strokeWidth="2.5"/>
<circle cx="20" cy="20" r="6" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
<circle cx="20" cy="20" r="3" fill="#1a1a2e" />
</svg>
);

const DEFAULT_LOCATIONS: Location[] = [
{
id: 1,
name: “Target - Main St”,
type: “Retail Store”,
bestDays: [“Tue”, “Wed”],
bestTime: “8:00 AM”,
status: “Unknown”,
notes: “Ask for Marcus in electronics”,
lastVisit: “”,
lastFound: “”,
visits: 0,
hits: 0,
},
{
id: 2,
name: “Mall Vending - Eastside”,
type: “Vending Machine”,
bestDays: [“Mon”, “Tue”],
bestTime: “10:00 AM”,
status: “Unknown”,
notes: “Near food court entrance”,
lastVisit: “”,
lastFound: “”,
visits: 0,
hits: 0,
},
];

function loadLocations(): Location[] {
try {
const saved = localStorage.getItem(“pokestock_locations”);
return saved ? JSON.parse(saved) : DEFAULT_LOCATIONS;
} catch {
return DEFAULT_LOCATIONS;
}
}

const inputStyle: React.CSSProperties = {
background: “#0f0f1a”,
border: “1px solid #1e293b”,
borderRadius: 8,
color: “#e2e8f0”,
padding: “9px 12px”,
fontSize: 13,
width: “100%”,
marginBottom: 10,
boxSizing: “border-box”,
outline: “none”,
};

export default function App() {
const [locations, setLocations] = useState<Location[]>(loadLocations);
const [showAdd, setShowAdd] = useState(false);
const [activeTab, setActiveTab] = useState(“locations”);
const [form, setForm] = useState({
name: “”,
type: “Retail Store”,
bestDays: [] as string[],
bestTime: “”,
notes: “”,
});
const [logModal, setLogModal] = useState<number | null>(null);
const [logForm, setLogForm] = useState<{ status: StockStatus; found: string }>({
status: “In Stock”,
found: “”,
});

useEffect(() => {
try {
localStorage.setItem(“pokestock_locations”, JSON.stringify(locations));
} catch {
// storage unavailable
}
}, [locations]);

const today = DAYS[new Date().getDay()];

function addLocation() {
if (!form.name.trim()) return;
setLocations(prev => […prev, {
id: Date.now(),
…form,
status: “Unknown” as StockStatus,
lastVisit: “”,
lastFound: “”,
visits: 0,
hits: 0,
}]);
setForm({ name: “”, type: “Retail Store”, bestDays: [], bestTime: “”, notes: “” });
setShowAdd(false);
}

function deleteLocation(id: number) {
setLocations(prev => prev.filter(l => l.id !== id));
}

function logVisit() {
const todayDate = new Date().toLocaleDateString();
setLocations(prev => prev.map(l => {
if (l.id !== logModal) return l;
return {
…l,
status: logForm.status,
lastVisit: todayDate,
lastFound: logForm.status === “In Stock” ? todayDate : l.lastFound,
visits: l.visits + 1,
hits: logForm.status === “In Stock” ? l.hits + 1 : l.hits,
notes: logForm.found ? `Last found: ${logForm.found}\n${l.notes}` : l.notes,
};
}));
setLogModal(null);
setLogForm({ status: “In Stock”, found: “” });
}

function toggleDay(day: string) {
setForm(f => ({
…f,
bestDays: f.bestDays.includes(day)
? f.bestDays.filter(d => d !== day)
: […f.bestDays, day],
}));
}

const hotToday = locations.filter(l => l.bestDays.includes(today));
const hitRate = (l: Location) =>
l.visits > 0 ? Math.round((l.hits / l.visits) * 100) : 0;

return (
<div style={{ minHeight: “100vh”, background: “#0f0f1a”, fontFamily: “‘Trebuchet MS’, ‘Lucida Grande’, sans-serif”, color: “#e2e8f0”, padding: 0 }}>
<div style={{ background: “linear-gradient(135deg, #1a0533 0%, #0f1f4d 50%, #1a0533 100%)”, borderBottom: “2px solid #e3350d”, padding: “20px 24px 16px”, position: “relative”, overflow: “hidden” }}>
<div style={{ position: “absolute”, top: 0, left: 0, right: 0, bottom: 0, backgroundImage: “radial-gradient(circle at 20% 50%, rgba(227,53,13,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.08) 0%, transparent 60%)” }} />
<div style={{ display: “flex”, alignItems: “center”, gap: 12, position: “relative” }}>
<div style={{ color: “#e3350d” }}>{POKEBALL_SVG}</div>
<div>
<div style={{ fontSize: 22, fontWeight: 800, letterSpacing: “-0.5px”, color: “#fff” }}>PokeStock Tracker</div>
<div style={{ fontSize: 11, color: “#94a3b8”, letterSpacing: “2px”, textTransform: “uppercase” }}>Card Restock Intelligence</div>
</div>
<div style={{ marginLeft: “auto”, display: “flex”, alignItems: “center”, gap: 8 }}>
<div style={{ background: “rgba(74,222,128,0.1)”, border: “1px solid rgba(74,222,128,0.25)”, borderRadius: 20, padding: “4px 10px”, fontSize: 11, color: “#4ade80”, fontWeight: 600 }}>Saved locally</div>
<div style={{ background: “rgba(227,53,13,0.15)”, border: “1px solid rgba(227,53,13,0.4)”, borderRadius: 20, padding: “4px 12px”, fontSize: 12, color: “#e3350d”, fontWeight: 700 }}>Today: {today}</div>
</div>
</div>
{hotToday.length > 0 && (
<div style={{ marginTop: 14, background: “rgba(227,53,13,0.12)”, border: “1px solid rgba(227,53,13,0.3)”, borderRadius: 10, padding: “8px 14px”, fontSize: 12, color: “#fca5a5”, position: “relative” }}>
Hot today: {hotToday.map(l => l.name).join(” - “)}
</div>
)}
</div>

```
  <div style={{ display: "flex", borderBottom: "1px solid #1e293b", background: "#0f0f1a", padding: "0 24px" }}>
    {["locations", "stats"].map(tab => (
      <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid #e3350d" : "2px solid transparent", color: activeTab === tab ? "#fff" : "#64748b", padding: "12px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize", letterSpacing: "0.5px" }}>
        {tab === "locations" ? "Locations" : "Stats"}
      </button>
    ))}
  </div>

  <div style={{ padding: "20px 24px", maxWidth: 640, margin: "0 auto" }}>
    {activeTab === "locations" && (
      <>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button onClick={() => setShowAdd(!showAdd)} style={{ background: showAdd ? "#1e293b" : "#e3350d", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {showAdd ? "Cancel" : "+ Add Location"}
          </button>
        </div>

        {showAdd && (
          <div style={{ background: "#151525", border: "1px solid #1e293b", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: "#e3350d" }}>New Location</div>
            <input placeholder="Location name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
              {LOCATION_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <input placeholder="Best time (e.g. 8:00 AM)" value={form.bestTime} onChange={e => setForm(f => ({ ...f, bestTime: e.target.value }))} style={inputStyle} />
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Best days:</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {DAYS.map(d => (
                  <button key={d} onClick={() => toggleDay(d)} style={{ background: form.bestDays.includes(d) ? "#e3350d" : "#1e293b", color: form.bestDays.includes(d) ? "#fff" : "#94a3b8", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{d}</button>
                ))}
              </div>
            </div>
            <textarea placeholder="Notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            <button onClick={addLocation} style={{ background: "#e3350d", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" }}>Save Location</button>
          </div>
        )}

        {locations.length === 0 && (
          <div style={{ textAlign: "center", color: "#475569", padding: "40px 0", fontSize: 14 }}>No locations yet. Add your first store!</div>
        )}

        {locations.map(loc => (
          <div key={loc.id} style={{ background: "#151525", border: "1px solid #1e293b", borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{loc.name}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{loc.type}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ background: STATUS_COLORS[loc.status] + "22", border: "1px solid " + STATUS_COLORS[loc.status] + "55", color: STATUS_COLORS[loc.status], borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{loc.status}</div>
                <button onClick={() => deleteLocation(loc.id)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 16 }}>x</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {loc.bestDays.map(d => (
                <span key={d} style={{ background: d === today ? "rgba(227,53,13,0.2)" : "#1e293b", color: d === today ? "#e3350d" : "#64748b", border: d === today ? "1px solid rgba(227,53,13,0.4)" : "1px solid transparent", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{d}</span>
              ))}
              {loc.bestTime && <span style={{ color: "#64748b", fontSize: 11, alignSelf: "center" }}>{loc.bestTime}</span>}
            </div>
            {loc.notes && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8", background: "#0f0f1a", borderRadius: 8, padding: "7px 10px" }}>{loc.notes.split("\n")[0]}</div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <div style={{ fontSize: 11, color: "#475569" }}>
                {loc.lastVisit ? "Last visited: " + loc.lastVisit : "Never visited"}
                {loc.hits > 0 && " - " + hitRate(loc) + "% hit rate"}
              </div>
              <button onClick={() => setLogModal(loc.id)} style={{ background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Log Visit</button>
            </div>
          </div>
        ))}
      </>
    )}

    {activeTab === "stats" && (
      <div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Your location performance at a glance.</div>
        {locations.length === 0 && (
          <div style={{ textAlign: "center", color: "#475569", padding: "40px 0", fontSize: 14 }}>Add locations and log visits to see stats.</div>
        )}
        {locations.map(loc => (
          <div key={loc.id} style={{ background: "#151525", border: "1px solid #1e293b", borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{loc.name}</div>
            <div style={{ display: "flex", gap: 12 }}>
              {[{ label: "Visits", value: loc.visits }, { label: "Hits", value: loc.hits }, { label: "Hit Rate", value: hitRate(loc) + "%" }].map(s => (
                <div key={s.label} style={{ flex: 1, background: "#0f0f1a", borderRadius: 10, padding: "10px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#e3350d" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {loc.visits > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: hitRate(loc) + "%", background: "linear-gradient(90deg, #e3350d, #f97316)", borderRadius: 3 }} />
                </div>
              </div>
            )}
            {loc.lastFound && <div style={{ marginTop: 8, fontSize: 11, color: "#64748b" }}>Last found: {loc.lastFound}</div>}
          </div>
        ))}
      </div>
    )}
  </div>

  {logModal !== null && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 100 }} onClick={() => setLogModal(null)}>
      <div style={{ background: "#151525", border: "1px solid #1e293b", borderRadius: 16, padding: 24, width: "100%", maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#fff" }}>
          Log Visit - {locations.find(l => l.id === logModal)?.name}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Stock status:</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {STOCK_STATUS.map(s => (
            <button key={s} onClick={() => setLogForm(f => ({ ...f, status: s }))} style={{ background: logForm.status === s ? STATUS_COLORS[s] + "33" : "#1e293b", color: logForm.status === s ? STATUS_COLORS[s] : "#64748b", border: "1px solid " + (logForm.status === s ? STATUS_COLORS[s] + "66" : "transparent"), borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{s}</button>
          ))}
        </div>
        {logForm.status === "In Stock" && (
          <input placeholder="What did you find?" value={logForm.found} onChange={e => setLogForm(f => ({ ...f, found: e.target.value }))} style={{ ...inputStyle, marginBottom: 16 }} />
        )}
        <button onClick={logVisit} style={{ background: "#e3350d", color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" }}>Save Log</button>
      </div>
    </div>
  )}
</div>
```

);
}