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

  return (
    <div className="animate-fade-up">
      <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-4">Аналитика и показатели</div>

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
