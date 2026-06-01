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

    return {
        totalIncome,
        projectedIncome,
        completedCount: allDone.length,
        activeCount: allActive.length,
        clientCount: clients.length,
        avgPrice: avgSessionPrice
    };
  }, [sessions, completedSessions, clients, services]);

  const chartData = useMemo(() => {
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];
    const income = [0, 0, 0, 0, 0, 0];
    const sessionsArr = [0, 0, 0, 0, 0, 0];

    [...sessions, ...completedSessions].forEach(s => {
        const monthIndex = new Date(s.date).getMonth() % 6; // simplified for demo
        const svc = services.find(sv => sv.id === s.serviceId);
        income[monthIndex] += svc?.price || 0;
        sessionsArr[monthIndex] += 1;
    });

    return { months, income, sessionsArr };
  }, [sessions, completedSessions, services]);

  return (
    <div className="animate-fade-up max-w-[1100px] mx-auto space-y-16">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { label: 'Общий доход', val: stats.totalIncome.toLocaleString() + ' ₽', sub: 'ЗАВЕРШЕННЫЕ' },
          { label: 'Прогноз', val: stats.projectedIncome.toLocaleString() + ' ₽', sub: 'АКТИВНЫЕ' },
          { label: 'Средний чек', val: Math.round(stats.avgPrice).toLocaleString() + ' ₽', sub: 'ЗА СЕССИЮ' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col">
            <div className="text-[32px] font-bold tracking-tight leading-none text-t1 mb-2">{item.val}</div>
            <div className="text-[11px] text-t3 font-bold uppercase tracking-widest">{item.label}</div>
            <div className="text-[10px] text-t3 mt-1 font-bold opacity-40 italic">{item.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Charts Column */}
        <div className="lg:col-span-8 space-y-16">

          {/* Income Dynamics */}
          <section>
            <div className="flex items-center justify-between mb-12">
              <h3 className="text-[12px] font-bold text-t3 uppercase tracking-widest">Динамика дохода</h3>
              <div className="flex items-center gap-1.5 text-green-custom text-[11px] font-bold">
                <IconTrendingUp size={16} /> +14%
              </div>
            </div>
            <div className="h-[200px] w-full flex items-end justify-between gap-2 relative">
                {chartData.income.map((val, i) => {
                const height = Math.max(5, (val / (Math.max(...chartData.income, 1))) * 100);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        <div
                            className="w-full bg-accent/5 group-hover:bg-accent/10 rounded-t-xl transition-all relative flex items-end justify-center"
                            style={{ height: `${height}%` }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent opacity-40 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-[10px] text-t3 mt-6 font-bold uppercase tracking-widest opacity-40">{chartData.months[i]}</span>
                    </div>
                );
                })}
            </div>
          </section>

          {/* Session Count */}
          <section>
             <div className="flex items-center justify-between mb-12">
                <h3 className="text-[12px] font-bold text-t3 uppercase tracking-widest">Количество сессий</h3>
                <span className="text-[11px] text-t3 font-bold opacity-40">ВСЕГО {stats.completedCount + stats.activeCount}</span>
            </div>
            <div className="h-[140px] w-full flex items-end justify-between gap-4">
                {chartData.sessionsArr.map((val, i) => {
                const height = Math.max(10, (val / (Math.max(...chartData.sessionsArr, 1))) * 100);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center group justify-end h-full">
                        <div
                            className="w-full max-w-[8px] bg-slate-100 group-hover:bg-accent/20 rounded-full transition-all relative"
                            style={{ height: `${height}%` }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-2 bg-accent/30 rounded-full scale-0 group-hover:scale-100 transition-transform"></div>
                        </div>
                        <span className="text-[10px] text-t3 mt-6 font-bold uppercase tracking-widest opacity-40">{chartData.months[i]}</span>
                    </div>
                );
                })}
            </div>
          </section>
        </div>

        {/* Breakdown Column */}
        <div className="lg:col-span-4 space-y-16">

          {/* Services Popularity */}
          <section>
            <h3 className="text-[12px] font-bold text-t3 uppercase tracking-widest mb-10">Популярные услуги</h3>
            <div className="space-y-8">
                {services.map(s => {
                    const count = [...sessions, ...completedSessions].filter(sess => sess.serviceId === s.id).length;
                    const percent = Math.min(100, (count / (stats.completedCount + stats.activeCount || 1)) * 100);
                    return (
                        <div key={s.id} className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-[14px] font-bold text-t1 tracking-tight">{s.name}</span>
                                <span className="text-[10px] font-bold text-t3 uppercase opacity-60">{count} ЗАП.</span>
                            </div>
                            <div className="w-full h-1 bg-bg-custom rounded-full overflow-hidden">
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
          <section className="space-y-6">
             <div className="flex items-center justify-between border-b border-border-light pb-4">
                <span className="text-[13px] font-bold text-t3 uppercase tracking-widest opacity-60">Всего клиентов</span>
                <span className="text-[16px] font-extrabold text-t1">{stats.clientCount}</span>
             </div>
             <div className="flex items-center justify-between border-b border-border-light pb-4">
                <span className="text-[13px] font-bold text-t3 uppercase tracking-widest opacity-60">Активные записи</span>
                <span className="text-[16px] font-extrabold text-t1">{stats.activeCount}</span>
             </div>
             <div className="flex items-center justify-between border-b border-border-light pb-4">
                <span className="text-[13px] font-bold text-t3 uppercase tracking-widest opacity-60">Завершенные</span>
                <span className="text-[16px] font-extrabold text-t1">{stats.completedCount}</span>
             </div>
          </section>
        </div>
      </div>

      {/* Bottom Export Banner - Graphite/Grey-Blue */}
      <div className="mt-20 p-12 rounded-[40px] bg-slate-900 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-110"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            <div className="text-center md:text-left">
                <div className="text-[24px] font-extrabold tracking-tight mb-3">Готовы к отчетности?</div>
                <p className="text-[15px] text-slate-400 max-w-md leading-relaxed font-medium">
                    Выгрузите все данные о доходах в формате XLSX для налоговой декларации или личного учета.
                </p>
            </div>
            <button className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl text-[14px] font-bold hover:bg-slate-100 transition-all active:scale-95 shadow-2xl">
                <IconFileExport size={20} stroke={2} />
                Скачать отчет
            </button>
        </div>
      </div>
    </div>
  );
}
