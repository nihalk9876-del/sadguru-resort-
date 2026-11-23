import React, { useState, useEffect } from 'react';
import {
  TrendingUp, DollarSign, Calendar, BedDouble, Waves,
  RefreshCw, Clock, Search, Download
} from 'lucide-react';
import { api } from '../../services/api';

export default function ReportsTab() {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tableFilter, setTableFilter] = useState('all'); // 'all', 'room', 'pool'

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminReports('today', new Date().toISOString().split('T')[0]);
      if (res && res.reports) {
        setReportsData(res.reports);
      } else {
        setError('No report data received from server.');
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Failed to load reports. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Safe number formatter
  const fmt = (val) => {
    const n = Number(val) || 0;
    return n.toLocaleString('en-IN');
  };

  const summary = reportsData?.summary || {};

  // Today income = todayRevenue from backend
  const todayIncome = summary.todayRevenue || 0;
  const todayBookings = summary.todayRoomBookingCount || 0;
  const monthlyIncome = summary.monthlyRevenue || 0;
  const monthlyBookings = summary.monthlyRoomBookingsCount || summary.roomBookingsCount || 0;
  const poolRevenue = summary.todayPoolRevenue || summary.poolRevenue || 0;

  // Today's transactions: all from recentTransactions where checkIn === today OR timestamp === today
  const todayStr = new Date().toISOString().split('T')[0];

  const allTransactions = reportsData?.recentTransactions || [];

  // Build today's ledger from dateReport (rooms for today) + today pool passes
  const todayRooms = (reportsData?.dateReport?.roomsBooked || []).map(b => ({
    ...b,
    _type: 'room',
    _sortTime: b.checkInTime || '00:00'
  }));

  // Pool transactions today from recentTransactions where type is pool + checkIn is today
  const todayPool = allTransactions.filter(t => {
    const isPool = t.type === 'Swimming Pool';
    const tDate = (t.checkIn || t.timestamp || '').split('T')[0];
    return isPool && tDate === todayStr;
  }).map(t => ({
    ...t,
    _type: 'pool',
    _sortTime: t.checkInTime || '00:00'
  }));

  // Combine and sort by check-in time ascending
  const todayLedger = [...todayRooms, ...todayPool].sort((a, b) => {
    const timeA = a._sortTime || '00:00';
    const timeB = b._sortTime || '00:00';
    return timeA.localeCompare(timeB);
  });

  // Apply filter and search
  const filteredLedger = todayLedger.filter(item => {
    if (tableFilter === 'room' && item._type !== 'room') return false;
    if (tableFilter === 'pool' && item._type !== 'pool') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (item.customerName || '').toLowerCase();
      const phone = (item.phone || '');
      const room = (item.roomNumber ? `room ${item.roomNumber}` : '').toLowerCase();
      return name.includes(q) || phone.includes(q) || room.includes(q);
    }
    return true;
  });

  // Export today's data as CSV
  const handleExportCSV = () => {
    const rows = filteredLedger.map(item => [
      item._type === 'room' ? `Room ${item.roomNumber}` : 'Pool Pass',
      `"${item.customerName || ''}"`,
      item.phone || '',
      item.checkInTime || '',
      item.amountBookedFor || item.amount || 0,
      item.paymentMethod || 'Cash',
      item.status || ''
    ]);
    const headers = ['Room/Item', 'Guest Name', 'Phone', 'Check-In Time', 'Amount (INR)', 'Payment', 'Status'];
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="p-4 rounded-2xl bg-red-900/30 border border-red-700/50 text-red-300 text-sm text-center max-w-sm">
          <p className="font-bold mb-1">Failed to Load Reports</p>
          <p className="text-xs">{error}</p>
        </div>
        <button
          onClick={fetchReports}
          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm flex items-center gap-2 hover:bg-amber-400 transition"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Resort Reports
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Export today's data as CSV"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={fetchReports}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-2 gap-3">

        {/* 1. Today Bookings */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/70 to-slate-900 border border-blue-500/40 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-blue-300 uppercase tracking-wide">Today Bookings</span>
            <BedDouble className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-blue-200">{todayBookings}</p>
          <span className="text-[10px] text-slate-400">Room check-ins today</span>
        </div>

        {/* 2. Today Income */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/40 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-emerald-300 uppercase tracking-wide">Today Income</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-200">₹{fmt(todayIncome)}</p>
          <span className="text-[10px] text-slate-400">Rooms + Pool collected</span>
        </div>

        {/* 3. Monthly Bookings */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/70 to-slate-900 border border-indigo-500/40 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-indigo-300 uppercase tracking-wide">Monthly Bookings</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-indigo-200">{monthlyBookings}</p>
          <span className="text-[10px] text-slate-400">Rooms booked this month</span>
        </div>

        {/* 4. Monthly Income */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/70 to-slate-900 border border-amber-500/40 shadow-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-amber-300 uppercase tracking-wide">Monthly Income</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-200">₹{fmt(monthlyIncome)}</p>
          <span className="text-[10px] text-slate-400">This month total revenue</span>
        </div>

        {/* 5. Pool Revenue (full width) */}
        <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-br from-cyan-950/70 to-slate-900 border border-cyan-500/40 shadow-lg flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-wide">Pool Bookings Revenue</span>
            </div>
            <p className="text-2xl font-black text-cyan-200">₹{fmt(poolRevenue)}</p>
            <span className="text-[10px] text-slate-400">Swimming pool passes collected today</span>
          </div>
          <div className="shrink-0 w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Waves className="w-7 h-7 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Today's Guest Ledger */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">

        {/* Ledger Header */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Today's Bookings Ledger
              <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                {filteredLedger.length} records
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">All bookings today sorted by check-in time</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Name, phone, room..."
                className="pl-7 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 w-44"
              />
            </div>

            {/* Filter */}
            <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[11px]">
              {[['all', 'All'], ['room', 'Rooms'], ['pool', 'Pool']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setTableFilter(val)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                    tableFilter === val
                      ? val === 'room' ? 'bg-emerald-500/20 text-emerald-300'
                        : val === 'pool' ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredLedger.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            {searchQuery ? 'No matching records found.' : 'No bookings recorded for today yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Room / Item</th>
                  <th className="p-3">Guest Name</th>
                  <th className="p-3">Mobile</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredLedger.map((item, idx) => {
                  const isRoom = item._type === 'room';
                  const isCheckedOut = item.status === 'Checked-Out';
                  const isCheckedIn = item.status === 'Checked-In';
                  const isPool = item._type === 'pool';

                  return (
                    <tr key={idx} className={`hover:bg-slate-800/40 transition ${isCheckedOut ? 'opacity-80' : ''}`}>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isPool
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}>
                          {isRoom ? `Room ${item.roomNumber}` : 'Pool Pass'}
                        </span>
                        {isRoom && item.category && (
                          <span className="ml-1.5 text-[10px] text-slate-500">{item.category}</span>
                        )}
                      </td>

                      <td className="p-3">
                        <p className="font-bold text-white">{item.customerName || '—'}</p>
                        {item.secondGuestName && (
                          <p className="text-[10px] text-rose-300 mt-0.5">+{item.secondGuestName}</p>
                        )}
                        {item.stayType && isRoom && (
                          <span className={`text-[9px] font-mono px-1.5 rounded ${
                            item.stayType === 'Couple' ? 'text-rose-400' : 'text-slate-400'
                          }`}>
                            {item.stayType}
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-mono text-amber-300 font-semibold whitespace-nowrap">
                        {item.phone || '—'}
                      </td>

                      <td className="p-3 whitespace-nowrap text-slate-300">
                        <div className="font-mono">{item.checkInTime || '—'}</div>
                        {isRoom && item.checkIn && (
                          <div className="text-[10px] text-slate-500">{item.checkIn}</div>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap text-slate-300">
                        {item.actualCheckOut ? (
                          <div>
                            <div className="font-mono text-purple-300">{item.actualCheckOutTime || 'Early'}</div>
                            <div className="text-[10px] text-slate-500">{item.actualCheckOut}</div>
                          </div>
                        ) : item.checkOut ? (
                          <div className="text-slate-400 text-[11px]">Exp: {item.checkOut}</div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <p className="font-bold text-white font-mono">
                          ₹{fmt(item.amountBookedFor || item.amount || item.totalAmount || 0)}
                        </p>
                        {(item.remainingBalance > 0) ? (
                          <p className="text-[10px] text-red-400">Due: ₹{fmt(item.remainingBalance)}</p>
                        ) : (
                          <p className="text-[10px] text-emerald-400">Paid</p>
                        )}
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span className="text-slate-300 block">{item.paymentMethod || 'Cash'}</span>
                        <span className="text-[10px] text-slate-500">{item.paymentStatus || 'Paid'}</span>
                      </td>

                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isCheckedOut
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : isCheckedIn
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : isPool
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : 'bg-slate-700/50 text-slate-300 border-slate-700'
                        }`}>
                          {item.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
