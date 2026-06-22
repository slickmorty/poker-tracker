const TABS = [
  { id: 'dashboard', label: 'داشبورد', icon: '📊' },
  { id: 'sessions', label: 'جلسات', icon: '🎴' },
  { id: 'history', label: 'تاریخچه', icon: '📈' },
  { id: 'players', label: 'بازیکنان', icon: '👥' },
  { id: 'stats', label: 'آمار', icon: '🏆' },
  { id: 'data', label: 'مدیریت داده', icon: '💾' },
]

export default function Layout({ tab, setTab, children }) {
  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-icon">♠</span>
          <div>
            <h1>داشبورد پوکر</h1>
            <p className="brand-sub">مدیریت جلسات و سود و زیان</p>
          </div>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? 'tab-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="tab-icon">{t.icon}</span>
              <span className="tab-label">{t.label}</span>
            </button>
          ))}
        </nav>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        
      </footer>
    </div>
  )
}
