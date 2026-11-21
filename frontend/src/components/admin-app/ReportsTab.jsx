import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, Calendar, BedDouble, Waves, 
  CreditCard, Download, Filter, RefreshCw, ArrowUpRight, CheckCircle2,
  CalendarDays, Heart, Home, Clock, ShieldCheck, History, Database
} from 'lucide-react';
import { api } from '../../services/api';

export default function ReportsTab() {
  const [timeframe, setTimeframe] = useState('week'); // 'today', 'week', 'month', 'custom_date'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState('all'); // 'all', 'room', 'pool'

  useEffect(() => {
    fetchReports(timeframe, selectedDate);
  }, [timeframe, selectedDate]);

  const fetchReports = async (tf, dateVal) => {
    setLoading(true);
    try {
      const res = await api.getAdminReports(tf, dateVal);
      if (res.reports) {
        setReportsData(res.reports);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportsData || !reportsData.recentTransactions) return;
    const headers = ['Transaction ID', 'Type', 'Item/Room', 'Customer Name', 'Phone', 'Amount (INR)', 'Payment Method', 'Timestamp', 'Status'];
    const rows = reportsData.recentTransactions.map(t => [
      t.id,
      t.type,
      `"${t.item}"`,
      `"${t.customerName}"`,
      t.phone,
      t.amount,
      t.paymentMethod,
      t.timestamp,
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sadguru_revenue_report_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = reportsData?.summary || {
    totalRevenue: 0,
    roomRevenue: 0,
    poolRevenue: 0,
    totalEntries: 0,
    roomBookingsCount: 0,
    poolPassesCount: 0,
    cashRevenue: 0,
    upiRevenue: 0,
    cardRevenue: 0
  };

  const filteredTransactions = (reportsData?.recentTransactions || []).filter(t => {
    if (tableFilter === 'room') return t.type.toLowerCase().includes('room');
    if (tableFilter === 'pool') return t.type.toLowerCase().includes('pool');
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Financial & Operational Intelligence Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics for room stays, swimming pool passes, cash vs online collection
          </p>
        </div>

        {/* Timeframe Switcher & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Specific Date Picker */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
            <CalendarDays className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Pick Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setTimeframe('custom_date');
              }}
              className="bg-transparent text-amber-300 font-mono text-xs outline-none cursor-pointer"
            />
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setTimeframe('today');
                setSelectedDate(new Date().toISOString().split('T')[0]);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                timeframe === 'today' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                timeframe === 'week' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly (7D)
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                timeframe === 'month' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly (30D)
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs flex items-center gap-1.5 transition"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => fetchReports(timeframe, selectedDate)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Money Collected */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Total Collection</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-300">
            ₹{summary.totalRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {summary.totalEntries} Total Bookings & Entries
          </span>
        </div>

        {/* Room Revenue */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Rooms Collection</span>
            <BedDouble className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{summary.roomRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-300">
            {summary.roomBookingsCount} Rooms Booked
          </span>
        </div>

        {/* Swimming Pool Revenue */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/40 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Pool Pass Collection</span>
            <Waves className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-cyan-300">
            ₹{summary.poolRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-300">
            {summary.poolPassesCount} Pool Passes Issued
          </span>
        </div>

        {/* Payment Modes Split */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono uppercase">
            <span>Cash vs UPI Split</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Cash Collected:</span>
              <span className="font-bold text-white">₹{summary.cashRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">UPI / QR Online:</span>
              <span className="font-bold text-emerald-400">₹{summary.upiRevenue.toLocaleString()}</span>
            </div>
            {summary.cardRevenue > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Card POS:</span>
                <span className="font-bold text-cyan-300">₹{summary.cardRevenue.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Date Audit Section: Rooms Booked on Selected Date & For How Much */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Date Audit: Rooms Booked on {selectedDate}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Exact room count, room numbers, guest names, stay type & revenue generated on this date
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 flex items-center gap-1.5">
              <BedDouble className="w-3.5 h-3.5" />
              {reportsData?.dateReport?.roomsBookedCount || 0} Rooms Booked
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 font-mono">
              ₹{(reportsData?.dateReport?.totalRevenue || 0).toLocaleString()} Revenue
            </span>
          </div>
        </div>

        {/* Rooms Booked on this Date Table */}
        {(!reportsData?.dateReport?.roomsBooked || reportsData.dateReport.roomsBooked.length === 0) ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/80">
            No rooms were booked on {selectedDate}. Use the date picker above to inspect any date.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Room</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Guest & Contact</th>
                  <th className="p-3">Stay Type</th>
                  <th className="p-3">Amount Booked For</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Stay Schedule</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                {reportsData.dateReport.roomsBooked.map((rm, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-black text-amber-300 font-mono text-sm whitespace-nowrap">
                      Room {rm.roomNumber}
                    </td>
                    <td className="p-3 text-slate-300 whitespace-nowrap">
                      {rm.category}
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-white">{rm.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{rm.phone}</p>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rm.stayType === 'Couple' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {rm.stayType || 'Family'}
                      </span>
                      {rm.secondGuestName && (
                        <p className="text-[10px] text-slate-400 mt-0.5">Partner: {rm.secondGuestName}</p>
                      )}
                    </td>
                    <td className="p-3 font-bold text-white font-mono text-sm whitespace-nowrap">
                      ₹{rm.amountBookedFor?.toLocaleString()}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="text-[11px] text-slate-300 block">{rm.paymentMethod}</span>
                      <span className="text-[10px] text-emerald-400 font-semibold">{rm.paymentStatus}</span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-400 whitespace-nowrap">
                      <div>In: {rm.checkIn} ({rm.checkInTime})</div>
                      <div>Out: {rm.checkOut} ({rm.checkOutTime})</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                        {rm.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {reportsData?.dailyBreakdown && reportsData.dailyBreakdown.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Day-by-Day Revenue & Entries Trend ({timeframe === 'week' ? 'Last 7 Days' : 'Last 30 Days'})
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Rooms
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" /> Pool
              </span>
            </div>
          </div>

          {/* Visual Bars */}
          <div className="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-7 lg:grid-cols-7 gap-2 pt-2 items-end h-44">
            {reportsData.dailyBreakdown.slice(-7).map((day, idx) => {
              const maxRev = Math.max(...reportsData.dailyBreakdown.map(d => d.totalRevenue), 5000);
              const heightPct = Math.max(8, Math.round((day.totalRevenue / maxRev) * 100));

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap z-10 font-mono shadow-xl">
                    ₹{day.totalRevenue.toLocaleString()} ({day.entriesCount} entries)
                  </div>

                  <div className="w-full max-w-[40px] flex flex-col justify-end rounded-t-lg overflow-hidden bg-slate-950/60" style={{ height: `${heightPct}%` }}>
                    <div 
                      className="w-full bg-cyan-400/80 transition-all"
                      style={{ height: `${day.totalRevenue ? (day.poolRevenue / day.totalRevenue) * 100 : 0}%` }}
                    />
                    <div 
                      className="w-full bg-emerald-500 transition-all flex-1"
                    />
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono mt-2 truncate w-full text-center">
                    {day.label.split(',')[0]}
                  </span>
                  <span className="text-[9px] text-amber-300 font-bold font-mono">
                    ₹{day.totalRevenue > 0 ? `${Math.round(day.totalRevenue / 1000)}k` : '0'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Combined Transactions Ledger Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Live Unified Transaction Ledger ({filteredTransactions.length} records)
          </h3>

          {/* Table Filters */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTableFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                tableFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTableFilter('room')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                tableFilter === 'room' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rooms Only
            </button>
            <button
              onClick={() => setTableFilter('pool')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                tableFilter === 'pool' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pool Passes Only
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Ref ID</th>
                <th className="p-3">Type / Category</th>
                <th className="p-3">Guest Name & Phone</th>
                <th className="p-3">Aadhaar (if room)</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    No transactions recorded for this timeframe.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-mono font-semibold text-white whitespace-nowrap">
                      {tx.id}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.type.includes('Room') 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {tx.item}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-white">{tx.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{tx.phone}</p>
                    </td>
                    <td className="p-3 font-mono text-amber-300">
                      {tx.aadhaarNumber || '-'}
                    </td>
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      ₹{tx.amount?.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] text-slate-300">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-400 whitespace-nowrap">
                      {tx.timestamp ? tx.timestamp.split('T')[0] : '-'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Month-by-Month Permanent Revenue Ledger (Preserved After 2-Month Recycling) */}
      {reportsData?.monthlyHistory && reportsData.monthlyHistory.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                Month-by-Month Permanent Revenue History
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly revenue figures retained permanently in the ledger even after 2-month detail recycling
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              PERMANENT FINANCIAL RECORD
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Month</th>
                  <th className="p-3">Rooms Booked</th>
                  <th className="p-3">Rooms Collection</th>
                  <th className="p-3">Pool Collection</th>
                  <th className="p-3">Total Month Collection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
                {reportsData.monthlyHistory.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-bold text-white font-mono">
                      {m.label} ({m.month})
                    </td>
                    <td className="p-3 text-slate-300">
                      {m.roomBookingsCount} bookings
                    </td>
                    <td className="p-3 font-mono text-emerald-400 font-semibold">
                      ₹{m.roomRevenue?.toLocaleString()}
                    </td>
                    <td className="p-3 font-mono text-cyan-300">
                      ₹{m.poolRevenue?.toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-amber-300 font-mono text-sm">
                      ₹{m.totalRevenue?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2-Month Data Recycling & Lifetime Retention Policy Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">60-Day Data Recycling Active:</strong> Detailed room records older than 2 months are automatically recycled into permanent historical monthly revenue ledgers to ensure maximum database performance and compliance.
          </p>
        </div>
        <div className="shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">Lifetime Collection</span>
          <span className="text-xs font-bold text-amber-300 font-mono">
            ₹{(reportsData?.summary?.grandLifetimeRevenue || summary.totalRevenue).toLocaleString()}
          </span>
        </div>
      </div>

    </div>
  );
}
