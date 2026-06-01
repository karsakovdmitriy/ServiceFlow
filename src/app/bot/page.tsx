'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { IconBrandTelegram, IconCopy, IconChartBar, IconDeviceMobile, IconId } from '@tabler/icons-react';

export default function BotPage() {
  const { profile, trainerId, isDemoMode } = useStore();
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'TrainerSpaceBot';
  const botLink = `https://t.me/${botUsername}?start=${trainerId || 'id'}`;
  const linkTgLink = `https://t.me/${botUsername}?start=link_${trainerId || 'id'}`;

  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {!isDemoMode && (
            <div>
                <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Оповещения тренера</div>
                <div className={`card border-l-4 ${profile?.telegram_id ? 'border-green-500' : 'border-accent'}`}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${profile?.telegram_id ? 'bg-green-light text-green-custom' : 'bg-accent-light text-accent'}`}>
                                <IconBrandTelegram size={22} />
                            </div>
                            <div>
                                <div className="text-[14px] font-bold text-t1">
                                    {profile?.telegram_id ? 'Telegram подключен' : 'Привязать Telegram'}
                                </div>
                                <div className="text-[12px] text-t3 mt-[2px]">
                                    {profile?.telegram_id
                                        ? 'Вы получаете уведомления о новых записях в Telegram'
                                        : 'Получайте уведомления о новых записях прямо в мессенджер'}
                                </div>
                            </div>
                        </div>
                        <a
                            href={linkTgLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-[12px] font-bold px-4 py-2 rounded-r-sm transition-all ${
                                profile?.telegram_id
                                ? 'bg-bg-custom text-t2 border border-border-custom hover:bg-border-light'
                                : 'bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-hover'
                            }`}
                        >
                            {profile?.telegram_id ? 'Перепривязать' : 'Подключить'}
                        </a>
                    </div>
                </div>
            </div>
          )}

          <div>
            <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Ваша ссылка на бот</div>
            <div className="card">
              <p className="text-[13.5px] text-t2 leading-relaxed mb-4">
                Отправьте эту ссылку вашим клиентам. Они смогут самостоятельно смотреть ваше расписание и записываться на тренировки.
              </p>
              <div className="bg-bg-custom border border-border-light rounded-r-md p-3 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-2 text-[12px] font-mono text-accent truncate">
                  <IconBrandTelegram size={18} className="shrink-0" />
                  <span>{botLink}</span>
                </div>
                <button
                  className="bg-white border border-border-custom text-t2 text-[11px] font-bold p-[6px_12px] rounded-lg cursor-pointer whitespace-nowrap transition-all hover:border-accent hover:text-accent flex items-center gap-1.5"
                  onClick={() => {
                    navigator.clipboard.writeText(botLink);
                    alert('Ссылка скопирована!');
                  }}
                >
                  <IconCopy size={14} /> Скопировать
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Визитка тренера</div>
            <div className="card mb-6">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white relative overflow-hidden shadow-xl border border-white/10">
                    <div className="flex items-center gap-4 relative z-10">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-accent" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-2xl border-2 border-accent/40">🏋️</div>
                        )}
                        <div>
                            <div className="text-[18px] font-bold tracking-tight">{profile?.full_name || 'Ваше Имя'}</div>
                            <div className="text-[12px] text-accent font-medium uppercase tracking-wider">{profile?.specialization || 'Специализация'}</div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 relative z-10">
                        <div className="flex items-center gap-2 text-[13px] opacity-80">
                            <IconBrandTelegram size={14} className="text-accent" />
                            <span>{botUsername}</span>
                        </div>
                    </div>

                    <div className="mt-8 relative z-10">
                        <div className="text-[11px] text-white/40 uppercase tracking-[0.2em] mb-2">Записаться онлайн</div>
                        <div className="flex items-center justify-between gap-4">
                             <div className="bg-white p-1.5 rounded-lg shrink-0">
                                 {/* Placeholder for QR Code */}
                                 <div className="w-16 h-16 bg-slate-100 flex items-center justify-center text-slate-800">QR</div>
                             </div>
                             <div className="text-right flex-1">
                                 <div className="text-[10px] text-white/60 leading-relaxed max-w-[140px] ml-auto italic">
                                     Отсканируйте код или перейдите по ссылке выше для записи
                                 </div>
                             </div>
                        </div>
                    </div>

                    <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>
                <button className="mt-4 w-full bg-bg-custom border border-border-light text-t2 text-[12px] font-bold py-2 rounded-lg hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2">
                    <IconCopy size={16} /> Скачать визитку для печати
                </button>
            </div>

            <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Статистика бота</div>
            <div className="card">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <IconChartBar size={18} />, val: '12', lbl: 'Активных пользователей' },
                  { icon: <IconDeviceMobile size={18} />, val: '47', lbl: 'Записей через бот' },
                  { val: '94%', lbl: 'Конверсия', color: 'text-green-custom' },
                  { val: '2', lbl: 'Новых за неделю' },
                ].map((stat, i) => (
                  <div key={i} className="bg-bg-custom rounded-r-xl p-4 border border-border-light flex flex-col items-center text-center">
                    <div className={`text-[24px] font-bold text-t1 tracking-tight leading-none ${stat.color || ''}`}>{stat.val}</div>
                    <div className="text-[11px] text-t3 mt-1.5 font-medium leading-tight">{stat.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Предпросмотр (как видит клиент)</div>
          <div className="bg-[#54a9eb] rounded-r-xl p-6 shadow-xl relative overflow-hidden h-[500px]">
             {/* Telegram Header */}
             <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl backdrop-blur-md">🤖</div>
              <div>
                <div className="text-[15px] font-bold text-white">TrainerSpace Bot</div>
                <div className="text-[11px] text-white/70">bot</div>
              </div>
            </div>

            {/* Chat Bubble 1 */}
            <div className="bg-white rounded-2xl rounded-bl-none p-4 mb-3 max-w-[85%] shadow-sm relative z-10 animate-fade-up">
              <div className="text-[13px] text-gray-800 leading-relaxed">
                👋 Привет! Я помогу вам записаться на тренировку к тренеру <strong>{profile?.full_name || 'Алексей Смирнов'}</strong>.
                <br/><br/>
                У него сейчас доступно <strong>12 свободных слотов</strong> на этой неделе.
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <button className="w-full bg-[#0088cc] text-white text-[12px] font-bold py-2.5 rounded-xl hover:bg-[#0077b5] transition-colors">
                   📅 Записаться
                </button>
                <button className="w-full bg-gray-100 text-gray-700 text-[12px] font-bold py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
                   👤 Мои записи
                </button>
              </div>
            </div>

            {/* User Reply */}
            <div className="bg-[#effdde] rounded-2xl rounded-br-none p-3 mb-3 max-w-[50%] ml-auto shadow-sm relative z-10 animate-fade-up delay-150">
              <div className="text-[13px] text-gray-800">📅 Записаться</div>
            </div>

            {/* Chat Bubble 2 */}
            <div className="bg-white rounded-2xl rounded-bl-none p-4 max-w-[85%] shadow-sm relative z-10 animate-fade-up delay-300">
              <div className="text-[13px] text-gray-800 leading-relaxed">Отлично! Выберите удобный день:</div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {['ПН 19.05', 'ВТ 20.05', 'СР 21.05', 'ЧТ 22.05'].map(day => (
                  <button key={day} className="bg-gray-50 border border-gray-100 text-gray-700 text-[12px] font-semibold py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Decor Circles */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/5 rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[20px] left-[-20px] w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
