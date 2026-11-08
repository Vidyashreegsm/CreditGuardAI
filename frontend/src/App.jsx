
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  ChartNoAxesCombined,
  ShieldAlert,
  ClipboardCheck,
  Settings,
  Search,
  Bell,
  Sun,
  Moon,
  ArrowUpRight,
  Activity,
  Wallet,
  CircleAlert,
  ChevronRight,
  Menu,
  X,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock3,
  Wifi,
  WifiOff,
} from 'lucide-react'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '')

const navigation = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Customers', icon: Users },
  { name: 'Risk Analytics', icon: ChartNoAxesCombined },
  { name: 'Early Warnings', icon: ShieldAlert },
  { name: 'Interventions', icon: ClipboardCheck },
]

const RISK_COLORS = {
  Stable: '#10b981',
  Watch: '#f59e0b',
  Emerging: '#f97316',
  Critical: '#ef4444',
}

async function fetchAPI(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json()
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—'

  const value = Number(amount)

  if (!Number.isFinite(value)) return '—'

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`
  }

  return `₹${value.toLocaleString('en-IN')}`
}

function App() {
  const [theme, setTheme] = useState('dark')
  const [activePage, setActivePage] = useState('Overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [apiStatus, setApiStatus] = useState('Checking')
  const [customers, setCustomers] = useState([])
  const [portfolio, setPortfolio] = useState(null)
  const [warnings, setWarnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const dark = theme === 'dark'

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [healthData, customerData, portfolioData, warningData] =
        await Promise.all([
          fetchAPI('/health'),
          fetchAPI('/customers'),
          fetchAPI('/portfolio'),
          fetchAPI('/warnings'),
        ])

      setApiStatus(
        healthData.status === 'healthy' ? 'Connected' : 'Offline'
      )

      setCustomers(customerData.customers || [])
      setPortfolio(portfolioData)
      setWarnings(warningData.warnings || [])
    } catch (err) {
      setApiStatus('Offline')
      setError(
        'Could not connect to the backend. Please check the backend service and try again.'
      )
      console.error('Dashboard API error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const bg = dark
    ? 'bg-[#090d18] text-slate-100'
    : 'bg-[#f5f7fb] text-slate-900'

  const panel = dark
    ? 'bg-[#111827] border-slate-800'
    : 'bg-white border-slate-200'

  const muted = dark ? 'text-slate-400' : 'text-slate-500'
  const border = dark ? 'border-slate-800' : 'border-slate-200'

  const input = dark
    ? 'bg-[#0b1220] border-slate-700 text-white placeholder:text-slate-500'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'

  const riskDistribution = portfolio?.risk_distribution || {}

  const riskData = useMemo(
    () =>
      Object.entries(RISK_COLORS).map(([name, color]) => ({
        name,
        value: riskDistribution[name] || 0,
        color,
      })),
    [riskDistribution]
  )

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return customers

    return customers.filter(customer =>
      [
        customer.name,
        customer.id,
        customer.loan_type,
        customer.risk_level,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [customers, search])

  const pageDescription = {
    Overview: 'Monitor your credit portfolio and emerging financial risks.',
    Customers: 'Review individual customer financial health and repayment behaviour.',
    'Risk Analytics': 'Understand risk patterns across your portfolio.',
    'Early Warnings': 'Investigate emerging customer deterioration signals.',
    Interventions: 'Review recommended customer support and follow-up actions.',
    Settings: 'Application configuration and environment information.',
  }

  function RiskBadge({ risk }) {
    const styles = {
      Stable: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      Watch: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      Emerging: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    }

    return (
      <span
        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
          styles[risk] || styles.Stable
        }`}
      >
        {risk || 'Unknown'}
      </span>
    )
  }

  function MetricCard({ title, value, icon: Icon, color, description }) {
    return (
      <div className={`${panel} border rounded-2xl p-5 hover:border-violet-500/50 transition`}>
        <div className="flex justify-between items-start">
          <div>
            <p className={`text-sm ${muted}`}>{title}</p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-3 tracking-tight">
              {value}
            </h2>
          </div>

          <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={21} />
          </div>
        </div>

        <p className={`text-xs mt-4 ${muted}`}>{description}</p>
      </div>
    )
  }

  function CustomerTable({ data }) {
    if (data.length === 0) {
      return (
        <div className={`text-center py-12 ${muted}`}>
          No matching customers found.
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left">
          <thead>
            <tr className={`text-xs ${muted} border-b ${border}`}>
              <th className="py-3 font-medium">Customer</th>
              <th className="py-3 font-medium">Loan Type</th>
              <th className="py-3 font-medium">Outstanding</th>
              <th className="py-3 font-medium">Risk Index</th>
              <th className="py-3 font-medium">Risk Level</th>
              <th className="py-3 font-medium">Key Signal</th>
            </tr>
          </thead>

          <tbody>
            {data.map(customer => (
              <tr
                key={customer.id}
                className={`border-b ${border} last:border-0 text-xs hover:bg-violet-500/5 transition`}
              >
                <td className="py-4">
                  <p className="font-semibold text-sm">{customer.name}</p>
                  <p className={`${muted} mt-1`}>{customer.id}</p>
                </td>

                <td className={muted}>{customer.loan_type}</td>

                <td className="font-semibold">
                  {formatCurrency(customer.outstanding_amount)}
                </td>

                <td>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{customer.risk_index}</span>

                    <div className={`w-14 h-1.5 rounded-full ${dark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{
                          width: `${Math.min(100, customer.risk_index || 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>

                <td>
                  <RiskBadge risk={customer.risk_level} />
                </td>

                <td className={`${muted} max-w-[200px]`}>
                  {customer.explanations?.[0] || 'No major signal detected'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  function WarningList({ data }) {
    if (data.length === 0) {
      return (
        <div className={`text-center py-12 ${muted}`}>
          <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-500" />
          No emerging or critical warnings currently available.
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {data.map(warning => (
          <div
            key={warning.customer_id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border ${border} p-4 hover:border-violet-500/40 transition`}
          >
            <div className="flex gap-3 items-start">
              <div
                className={`p-2 rounded-lg ${
                  warning.risk_level === 'Critical'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-orange-500/10 text-orange-500'
                }`}
              >
                <CircleAlert size={19} />
              </div>

              <div>
                <h4 className="text-sm font-semibold">
                  {warning.customer_name}
                </h4>

                <p className={`text-xs mt-1 ${muted}`}>
                  {warning.customer_id} · {warning.deterioration_status}
                </p>

                <p className={`text-xs mt-2 ${muted}`}>
                  {warning.explanations?.join(' ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">
                Index: {warning.risk_index}
              </span>
              <RiskBadge risk={warning.risk_level} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  function PageContent() {
    if (loading) {
      return (
        <div className={`${panel} border rounded-2xl p-12 text-center`}>
          <RefreshCw className="animate-spin mx-auto text-violet-500" size={30} />
          <p className={`mt-4 text-sm ${muted}`}>Loading portfolio data...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className={`${panel} border border-red-500/30 rounded-2xl p-8 text-center`}>
          <WifiOff className="mx-auto text-red-500" size={32} />
          <h3 className="font-semibold mt-4">Backend connection failed</h3>
          <p className={`text-sm mt-2 ${muted}`}>{error}</p>
          <button
            onClick={loadData}
            className="mt-5 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm"
          >
            Try again
          </button>
        </div>
      )
    }

    if (activePage === 'Customers') {
      return (
        <section className={`${panel} border rounded-2xl p-5`}>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-5">
            <div>
              <h3 className="font-semibold">Customer Risk Monitoring</h3>
              <p className={`text-xs mt-1 ${muted}`}>
                {filteredCustomers.length} of {customers.length} customers
              </p>
            </div>

            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${input}`}>
              <Search size={16} className={muted} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="bg-transparent outline-none text-xs w-full sm:w-56"
              />
            </div>
          </div>

          <CustomerTable data={filteredCustomers} />
        </section>
      )
    }

    if (activePage === 'Early Warnings') {
      return (
        <section className={`${panel} border rounded-2xl p-5`}>
          <div className="mb-5">
            <h3 className="font-semibold">Early Warning Signals</h3>
            <p className={`text-xs mt-1 ${muted}`}>
              {warnings.length} customers currently classified as Emerging or Critical
            </p>
          </div>

          <WarningList data={warnings} />
        </section>
      )
    }

    if (activePage === 'Risk Analytics') {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <section className={`${panel} border rounded-2xl p-5`}>
            <h3 className="font-semibold">Risk Distribution</h3>
            <p className={`text-xs mt-1 ${muted}`}>
              Actual customer counts returned by the backend
            </p>

            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {riskData.map(item => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: dark ? '#111827' : '#fff',
                      borderRadius: 10,
                      border: `1px solid ${dark ? '#334155' : '#e2e8f0'}`,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={`${panel} border rounded-2xl p-5`}>
            <h3 className="font-semibold">Customer Risk Segments</h3>
            <p className={`text-xs mt-1 ${muted}`}>
              Number of customers in each risk category
            </p>

            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={dark ? '#253047' : '#e5e7eb'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={dark ? '#64748b' : '#94a3b8'}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis
                    stroke={dark ? '#64748b' : '#94a3b8'}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <Tooltip />
                  <Bar dataKey="value" name="Customers" radius={[6, 6, 0, 0]}>
                    {riskData.map(item => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={`${panel} border rounded-2xl p-5 xl:col-span-2`}>
            <h3 className="font-semibold">Risk Segment Summary</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              {riskData.map(item => (
                <div key={item.name} className={`rounded-xl p-4 ${dark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className={`text-xs ${muted}`}>{item.name}</span>
                  </div>
                  <p className="text-2xl font-bold mt-3">{item.value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )
    }

    if (activePage === 'Interventions') {
      const interventionCustomers = customers.filter(
        customer =>
          customer.recommendations?.length > 0 &&
          ['Emerging', 'Critical'].includes(customer.risk_level)
      )

      return (
        <section className={`${panel} border rounded-2xl p-5`}>
          <div className="mb-5">
            <h3 className="font-semibold">Recommended Interventions</h3>
            <p className={`text-xs mt-1 ${muted}`}>
              Rule-engine recommendations for customers requiring attention
            </p>
          </div>

          {interventionCustomers.length === 0 ? (
            <p className={`py-10 text-center ${muted}`}>
              No intervention recommendations available.
            </p>
          ) : (
            <div className="space-y-4">
              {interventionCustomers.map(customer => (
                <div
                  key={customer.id}
                  className={`border ${border} rounded-xl p-4`}
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{customer.name}</h4>
                      <p className={`text-xs mt-1 ${muted}`}>
                        {customer.id} · {customer.loan_type}
                      </p>
                    </div>

                    <RiskBadge risk={customer.risk_level} />
                  </div>

                  <ul className={`mt-4 space-y-2 text-sm ${muted}`}>
                    {customer.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex gap-2">
                        <ChevronRight size={16} className="text-violet-500 shrink-0 mt-0.5" />
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      )
    }

    if (activePage === 'Settings') {
      return (
        <section className={`${panel} border rounded-2xl p-6`}>
          <h3 className="font-semibold text-lg">Application Information</h3>

          <div className="mt-5 space-y-4">
            {[
              ['Application', 'CreditGuard AI'],
              ['Backend', 'Python + FastAPI'],
              ['Frontend', 'React + Vite'],
              ['Data source', 'Synthetic demonstration data'],
              ['API status', apiStatus],
              ['Customers loaded', customers.length],
              ['Risk engine', 'Transparent heuristic baseline'],
            ].map(([label, value]) => (
              <div
                key={label}
                className={`flex flex-col sm:flex-row sm:justify-between gap-2 border-b ${border} pb-3`}
              >
                <span className={muted}>{label}</span>
                <span className="font-medium text-sm">{value}</span>
              </div>
            ))}
          </div>

          <p className={`text-xs mt-6 leading-relaxed ${muted}`}>
            This prototype uses synthetic data and an illustrative rule-based
            risk index. It is not a calibrated probability of default and must
            not be used to make real lending decisions.
          </p>
        </section>
      )
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Customers"
            value={portfolio?.total_customers?.toLocaleString('en-IN') ?? '—'}
            icon={Users}
            color="bg-violet-500/10 text-violet-500"
            description="Customers loaded from the backend"
          />

          <MetricCard
            title="Total Loan Exposure"
            value={formatCurrency(portfolio?.total_exposure)}
            icon={Wallet}
            color="bg-blue-500/10 text-blue-500"
            description="Total outstanding amount"
          />

          <MetricCard
            title="Customers at Risk"
            value={portfolio?.customers_at_risk?.toLocaleString('en-IN') ?? '—'}
            icon={CircleAlert}
            color="bg-amber-500/10 text-amber-500"
            description="Emerging and Critical categories"
          />

          <MetricCard
            title="Early Warnings"
            value={warnings.length.toLocaleString('en-IN')}
            icon={Activity}
            color="bg-emerald-500/10 text-emerald-500"
            description="Customers with Emerging or Critical risk"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
          <section className={`${panel} border rounded-2xl p-5 xl:col-span-2`}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <h3 className="font-semibold">Portfolio Risk Distribution</h3>
                <p className={`text-xs mt-1 ${muted}`}>
                  Current customer distribution by risk category
                </p>
              </div>

              <span className={`text-xs border rounded-lg px-3 py-2 ${border}`}>
                Live API data
              </span>
            </div>

            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={dark ? '#253047' : '#e5e7eb'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke={dark ? '#64748b' : '#94a3b8'}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    stroke={dark ? '#64748b' : '#94a3b8'}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <Tooltip />
                  <Bar dataKey="value" name="Customers" radius={[6, 6, 0, 0]}>
                    {riskData.map(item => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap gap-5 mt-4">
              {riskData.map(item => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className={muted}>{item.name}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className={`${panel} border rounded-2xl p-5`}>
            <h3 className="font-semibold">Risk Distribution</h3>
            <p className={`text-xs mt-1 ${muted}`}>
              Current portfolio segments
            </p>

            <div className="relative h-[220px] mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {riskData.map(item => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold">
                  {portfolio?.total_customers ?? 0}
                </span>
                <span className={`text-xs ${muted}`}>Customers</span>
              </div>
            </div>

            <div className="space-y-3 mt-2">
              {riskData.map(item => (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className={muted}>{item.name}</span>
                  </div>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className={`${panel} border rounded-2xl p-5 mb-6`}>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-semibold">Priority Early Warnings</h3>
              <p className={`text-xs mt-1 ${muted}`}>
                Customers classified as Emerging or Critical
              </p>
            </div>

            <button
              onClick={() => setActivePage('Early Warnings')}
              className="text-violet-500 text-xs font-semibold flex items-center gap-1"
            >
              View all <ChevronRight size={15} />
            </button>
          </div>

          <WarningList data={warnings.slice(0, 5)} />
        </section>

        <section className={`${panel} border rounded-2xl p-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-semibold">Customer Risk Monitoring</h3>
              <p className={`text-xs mt-1 ${muted}`}>
                Customer records retrieved from FastAPI
              </p>
            </div>

            <button
              onClick={() => setActivePage('Customers')}
              className="text-violet-500 text-xs font-semibold flex items-center gap-1"
            >
              All customers <ChevronRight size={15} />
            </button>
          </div>

          <CustomerTable data={filteredCustomers.slice(0, 8)} />
        </section>
      </>
    )
  }

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed z-50 top-0 left-0 h-screen w-64 border-r ${border} ${panel} flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`h-20 px-6 flex items-center justify-between border-b ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <ShieldCheck size={23} className="text-white" />
            </div>

            <div>
              <h1 className="font-bold text-lg tracking-tight">CreditGuard</h1>
              <p className={`text-[10px] tracking-[2px] ${muted}`}>
                INTELLIGENCE AI
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1">
          <p className={`text-[10px] font-bold tracking-[2px] px-3 mb-4 ${muted}`}>
            WORKSPACE
          </p>

          <div className="space-y-1">
            {navigation.map(item => {
              const Icon = item.icon
              const selected = activePage === item.name

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActivePage(item.name)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition ${
                    selected
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                      : `${muted} hover:bg-violet-500/10 hover:text-violet-500`
                  }`}
                >
                  <Icon size={19} />
                  <span className="font-medium">{item.name}</span>

                  {item.name === 'Early Warnings' && warnings.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {warnings.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <p className={`text-[10px] font-bold tracking-[2px] px-3 mt-9 mb-4 ${muted}`}>
            PREFERENCES
          </p>

          <button
            onClick={() => setActivePage('Settings')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm ${
              muted
            } hover:bg-violet-500/10`}
          >
            <Settings size={19} />
            Settings
          </button>
        </div>

        <div className={`p-4 border-t ${border}`}>
          <div className={`rounded-xl p-3 ${dark ? 'bg-violet-500/10' : 'bg-violet-50'}`}>
            <div className="flex gap-2 items-center text-violet-500">
              <Sparkles size={17} />
              <span className="text-xs font-bold">AI Risk Intelligence</span>
            </div>

            <p className={`text-xs mt-2 leading-relaxed ${muted}`}>
              Early detection. Explainable insights. Smarter interventions.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white">
              A
            </div>

            <div>
              <p className="text-sm font-semibold">Administrator</p>
              <p className={`text-xs ${muted}`}>Portfolio Manager</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen">
        <header
          className={`sticky top-0 z-30 h-20 px-4 sm:px-7 flex items-center justify-between border-b ${border} ${
            dark ? 'bg-[#090d18]/90' : 'bg-white/90'
          } backdrop-blur-xl`}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={23} />
            </button>

            <div>
              <p className={`text-xs ${muted}`}>CreditGuard AI / Workspace</p>
              <h2 className="font-semibold text-base sm:text-lg">
                {activePage}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className={`hidden md:flex items-center gap-2 border rounded-xl px-3 py-2 ${input}`}>
              <Search size={16} className={muted} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search customers..."
                className="bg-transparent outline-none text-xs w-36"
              />
            </div>

            <button
              onClick={() => setTheme(dark ? 'light' : 'dark')}
              className={`p-2.5 rounded-xl border ${border} hover:text-violet-500`}
              title="Toggle theme"
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              onClick={() => setActivePage('Early Warnings')}
              className={`relative p-2.5 rounded-xl border ${border} hover:text-violet-500`}
              title="View alerts"
            >
              <Bell size={19} />
              {warnings.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>

            <div className={`hidden sm:flex items-center gap-2 text-xs border rounded-xl px-3 py-2 ${border}`}>
              {apiStatus === 'Connected' ? (
                <Wifi size={14} className="text-emerald-500" />
              ) : (
                <WifiOff size={14} className="text-red-500" />
              )}
              <span className={muted}>API {apiStatus}</span>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-7 max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {activePage === 'Overview' ? 'Portfolio Overview' : activePage}
              </h1>

              <p className={`${muted} text-sm mt-2`}>
                {pageDescription[activePage]}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className={`flex items-center gap-2 border ${border} px-4 py-2.5 rounded-xl text-xs font-semibold hover:border-violet-500 disabled:opacity-50`}
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>

              <button
                onClick={() => setActivePage('Early Warnings')}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-violet-600/20"
              >
                <ShieldAlert size={15} />
                View alerts
              </button>
            </div>
          </div>

          <div className={`flex gap-3 items-center rounded-xl border px-4 py-3 mb-6 ${
            dark
              ? 'bg-violet-500/5 border-violet-500/20'
              : 'bg-violet-50 border-violet-100'
          }`}>
            <Sparkles size={18} className="text-violet-500 shrink-0" />
            <p className={`text-xs ${muted}`}>
              <strong className="text-violet-500">DEMO ENVIRONMENT:</strong>{' '}
              Customer records and portfolio metrics are retrieved from
              synthetic backend data. Risk scores use a prototype rule-based
              engine, not a trained or calibrated ML model.
            </p>
          </div>

          <PageContent />

          <footer className={`mt-7 pt-5 pb-3 border-t ${border} flex flex-col sm:flex-row justify-between gap-2 text-xs ${muted}`}>
            <span>© 2026 CreditGuard AI. Intelligent Credit Risk Monitoring.</span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} />
              Human-reviewed risk intelligence
            </span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App
