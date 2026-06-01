'use client';

import React, { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { IconChartBar, IconTrendingUp, IconUsers, IconCalendarEvent, IconCurrencyRubel, IconFileExport } from '@tabler/icons-react';

export default function AnalyticsPage() {
  const { sessions, completedSessions, requests, clients, services } = useStore();

  const stats = useMemo(() => {
    const allDone = completedSessions;
    const allActive = sessions; // These are 'confirmed' sessions

    const totalIncome = allDone.reduce((acc, s) => {
        const svc = services.find(sv => sv.id === s.serviceId);
        return acc + (svc?.price || 0);
    }, 0);

    const projectedIncome = allActive.reduce((acc, s) => {
        const svc = services.find(sv => sv.id === s.serviceId);
        return acc + (svc?.price || 0);
    }, 0);

    const avgSessionPrice = allDone.length > 0 ? totalIncome / allDone.length : 0;

    // Chart Data Calculation
    interface MonthData { month: string; monthIdx: number; year: number; income: number; sessions: number; }
    const last6Months: MonthData[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        last6Months.push({
            month: d.toLocaleString('ru-RU', { month: 'short' }).replace('.', ''),
            monthIdx: d.getMonth(),
            year: d.getFullYear(),
            income: 0,
            sessions: 0
        });
    }

    [...allDone, ...allActive].forEach(s => {
        const sDate = new Date(s.date);
        const monthIdx = sDate.getMonth();
        const year = sDate.getFullYear();

        const bucket = last6Months.find(m => m.monthIdx === monthIdx && m.year === year);
        if (bucket) {
            const svc = services.find(sv => sv.id === s.serviceId);
            bucket.income += (svc?.price || 0);
            bucket.sessions += 1;
        }
    });

    return {
        totalIncome,
        projectedIncome,
        completedCount: allDone.length,
        activeCount: allActive.length,
        clientCount: clients.length,
        avgPrice: avgSessionPrice,
        chartData: last6Months
    };
  }, [sessions, completedSessions, clients, services]);

  const incomeData = stats.chartData.map(d => d.income);
  const sessionData = stats.chartData.map(d => d.sessions);
  const months = stats.chartData.map(d => d.month);

  return (
    <div className="animate-fade-up max-w-[1100px] mx-auto">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        {[
          { label: 'Общий доход', val: stats.totalIncome.toLocaleString() + ' ₽', sub: 'Завершенные записи', highlight: 'text-t1' },
          { label: 'Прогноз', val: stats.projectedIncome.toLocaleString() + ' ₽', sub: 'На основе активных', highlight: 'text-accent' },
          { label: 'Средний чек', val: Math.round(stats.avgPrice).toLocaleString() + ' ₽', sub: 'За одну сессию', highlight: 'text-t1' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col">
            <div className="text-[11px] text-t3 font-bold uppercase tracking-wider mb-1">{item.label}</div>
            <div className={`text-[28px] font-bold tracking-tight leading-none ${item.highlight}`}>{item.val}</div>
            <div className="text-[11px] text-t3 mt-1.5 font-medium">{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Charts Column */}
        <div className="lg:col-span-8 space-y-12">

          {/* Income Dynamics */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[14px] font-bold text-t1 uppercase tracking-wider">Динамика дохода</h3>
              <div className="flex items-center gap-1.5 text-green-custom text-[11px] font-bold bg-green-50 px-2.5 py-1 rounded-full">
                <IconTrendingUp size={14} /> +14%
              </div>
            </div>
            <div className="h-[240px] w-full flex items-end justify-between gap-1 px-2 relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-x-0 top-0 h-px bg-border/20"></div>
                <div className="absolute inset-x-0 top-1/2 h-px bg-border/20"></div>
                <div className="absolute inset-x-0 bottom-8 h-px bg-border/40"></div>

                {incomeData.map((val, i) => {
                const maxIncome = Math.max(...incomeData, 10000);
                const height = (val / maxIncome) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end">
                        <div
                            className="w-full bg-accent/5 group-hover:bg-accent/10 rounded-t-xl transition-all relative flex items-end justify-center"
                            style={{ height: `${height}%` }}
                        >
                            {/* Line at the top of the bar */}
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>

                            {/* Hover label */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 whitespace-nowrap z-[100]">
                                {val.toLocaleString()} ₽
                            </div>
                        </div>
                        <span className="text-[10px] text-t3 mt-4 font-bold uppercase tracking-widest">{months[i]}</span>
                    </div>
                );
                })}
            </div>
          </section>

          {/* Session Count */}
          <section>
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-[14px] font-bold text-t1 uppercase tracking-wider">Количество сессий</h3>
                <span className="text-[11px] text-t3 font-bold bg-bg-custom border border-border px-2.5 py-1 rounded-full">Всего {stats.completedCount + stats.activeCount}</span>
            </div>
            <div className="h-[180px] w-full flex items-end justify-between gap-4 px-4">
                {sessionData.map((val, i) => {
                const maxSessions = Math.max(...sessionData, 10);
                const height = (val / maxSessions) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center group justify-end h-full">
                        <div
                            className="w-full max-w-[12px] bg-bg-custom border border-border group-hover:bg-accent/20 rounded-full transition-all relative"
                            style={{ height: `${height}%` }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-[12px] bg-accent/40 rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                        </div>
                        <span className="text-[10px] text-t3 mt-4 font-bold uppercase tracking-widest">{months[i]}</span>
                    </div>
                );
                })}
            </div>
          </section>
        </div>

        {/* Breakdown Column */}
        <div className="lg:col-span-4 space-y-12">

          {/* Services Popularity */}
          <section>
            <h3 className="text-[14px] font-bold text-t1 uppercase tracking-wider mb-6">Популярные услуги</h3>
            <div className="space-y-6">
                {services.map(s => {
                    const count = [...sessions, ...completedSessions].filter(sess => sess.serviceId === s.id).length;
                    const percent = Math.min(100, (count / (stats.completedCount + stats.activeCount || 1)) * 100);
                    return (
                        <div key={s.id} className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[13px] font-semibold text-t1">{s.name}</span>
                                <span className="text-[11px] font-bold text-t3">{count} зап.</span>
                            </div>
                            <div className="w-full h-1 bg-bg-custom border border-border rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
          </section>

          {/* Client Stats */}
          <section className="p-6 bg-surface rounded-2xl border border-border space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-t2">Всего клиентов</span>
                <span className="text-[14px] font-bold text-t1">{stats.clientCount}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-t2">Активные записи</span>
                <span className="text-[14px] font-bold text-t1">{stats.activeCount}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-t2">Завершенные</span>
                <span className="text-[14px] font-bold text-t1">{stats.completedCount}</span>
             </div>
          </section>
        </div>
      </div>

      {/* Bottom Export Banner */}
      <div className="mt-16 p-8 rounded-3xl bg-[#1e293b] text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-110"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div>
                <div className="text-[20px] font-bold tracking-tight mb-2">Готовы к отчетности?</div>
                <p className="text-[14px] text-slate-400 max-w-md leading-relaxed">
                    Выгрузите все данные о доходах в формате XLSX для налоговой декларации или личного учета.
                </p>
            </div>
            <button className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-all shadow-xl shadow-black/20">
                <IconFileExport size={18} stroke={2} />
                Скачать отчет
            </button>
        </div>
      </div>
    </div>
  );
}
