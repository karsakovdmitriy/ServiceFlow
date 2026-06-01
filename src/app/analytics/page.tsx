'use client';

import React, { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { IconChartBar, IconTrendingUp, IconUsers, IconCalendarEvent, IconCurrencyRubel } from '@tabler/icons-react';

export default function AnalyticsPage() {
  const { sessions, completedSessions, requests, clients, services } = useStore();

  const stats = useMemo(() => {
    const allDone = completedSessions;
    const totalIncome = allDone.reduce((acc, s) => {
        const svc = services.find(sv => sv.id === s.serviceId);
        return acc + (svc?.price || 0);
    }, 0);

    const projectedIncome = sessions.reduce((acc, s) => {
        const svc = services.find(sv => sv.id === s.serviceId);
        return acc + (svc?.price || 0);
    }, 0);

    const avgSessionPrice = allDone.length > 0 ? totalIncome / allDone.length : 0;

    return {
        totalIncome,
        projectedIncome,
        completedCount: allDone.length,
        activeCount: sessions.length,
        clientCount: clients.length,
        avgPrice: avgSessionPrice
    };
  }, [sessions, completedSessions, clients, services]);

  // Mock data for charts
  const incomeData = [24000, 32000, 28000, 45000, 38000, 52000];
  const sessionData = [12, 18, 15, 22, 20, 26];
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'];

  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: <IconCurrencyRubel />, label: 'Общий доход (завершенные)', value: stats.totalIncome.toLocaleString() + ' ₽', color: 'text-green-custom', bg: 'bg-green-light' },
          { icon: <IconTrendingUp />, label: 'Прогноз дохода (активные)', value: stats.projectedIncome.toLocaleString() + ' ₽', color: 'text-blue-custom', bg: 'bg-blue-light' },
          { icon: <IconChartBar />, label: 'Средний чек сессии', value: Math.round(stats.avgPrice).toLocaleString() + ' ₽', color: 'text-accent', bg: 'bg-accent-light' },
        ].map((item, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <div className="text-[11px] text-t3 font-medium">{item.label}</div>
              <div className={`text-[20px] font-bold ${item.color}`}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-t1">Динамика дохода</h3>
            <span className="text-[11px] text-green-custom font-bold bg-green-light px-2 py-0.5 rounded-full">+14% за мес.</span>
          </div>
          <div className="h-[200px] w-full relative flex items-end justify-between gap-1 pt-4 px-2">
            {incomeData.map((val, i) => {
              const height = (val / 60000) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div
                    className="w-full bg-accent/10 group-hover:bg-accent/20 rounded-t-lg transition-all relative"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {val.toLocaleString()} ₽
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent rounded-full"></div>
                  </div>
                  <span className="text-[10px] text-t3 mt-3 font-medium">{months[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sessions Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-t1">Количество сессий</h3>
            <span className="text-[11px] text-blue-custom font-bold bg-blue-light px-2 py-0.5 rounded-full">Всего {stats.completedCount + stats.activeCount}</span>
          </div>
          <div className="h-[200px] w-full relative flex items-end justify-between gap-3 pt-4 px-4">
            {sessionData.map((val, i) => {
              const height = (val / 30) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center group">
                  <div
                    className="w-6 bg-blue-custom/80 group-hover:bg-blue-custom rounded-t-sm transition-all relative"
                    style={{ height: `${height}%` }}
                  >
                     <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {val}
                    </div>
                  </div>
                  <span className="text-[10px] text-t3 mt-3 font-medium">{months[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="text-[14px] font-bold text-t1 mb-4">Статистика по клиентам</div>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-[13px] text-t2">Всего зарегистрировано</span>
                <span className="text-[14px] font-bold text-t1">{stats.clientCount}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[13px] text-t2">Активных сессий</span>
                <span className="text-[14px] font-bold text-t1">{stats.activeCount}</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-[13px] text-t2">Завершенных тренировок</span>
                <span className="text-[14px] font-bold text-t1">{stats.completedCount}</span>
             </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-light">
             <div className="text-[12px] text-t3 italic">Аналитика помогает вам отслеживать рост базы и планировать нагрузку.</div>
          </div>
        </div>

        <div className="card">
            <div className="text-[14px] font-bold text-t1 mb-4">Популярные услуги</div>
            <div className="space-y-3">
                {services.map(s => {
                    const count = [...sessions, ...completedSessions].filter(sess => sess.serviceId === s.id).length;
                    return (
                        <div key={s.id} className="flex flex-col gap-1">
                            <div className="flex justify-between text-[12px]">
                                <span className="font-medium text-t2">{s.name}</span>
                                <span className="text-t3">{count} зап.</span>
                            </div>
                            <div className="w-full h-1.5 bg-bg-custom rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (count / (stats.completedCount + stats.activeCount || 1)) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      <div className="card mt-6 bg-slate-900 text-white border-none">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
                <div className="text-[18px] font-bold mb-1">Готовы к налоговому периоду?</div>
                <p className="text-[13px] text-slate-400">Вся информация о ваших доходах доступна для выгрузки в формате для самозанятых.</p>
            </div>
            <button className="bg-accent text-white px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all whitespace-nowrap shadow-lg shadow-accent/20">
                Скачать отчет (XLSX)
            </button>
        </div>
      </div>
    </div>
  );
}
