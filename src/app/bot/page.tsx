'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { IconBrandTelegram, IconCopy, IconChartBar, IconDeviceMobile, IconStarFilled, IconMessage2, IconShare, IconChevronDown, IconChevronUp, IconExternalLink, IconPrinter } from '@tabler/icons-react';
import { QRCodeSVG } from 'qrcode.react';

export default function BotPage() {
  const { profile, trainerId, isDemoMode, reviews, sessions, completedSessions } = useStore();

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'TrainerSpaceBot';
  const botLink = `https://t.me/${botUsername}?start=${trainerId || 'id'}`;
  const linkTgLink = `https://t.me/${botUsername}?start=link_${trainerId || 'id'}`;

  return (
    <div className="animate-fade-up max-w-[1000px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-12">
          <section>
            <div className="text-[11px] font-bold text-t3 uppercase tracking-widest mb-4">Ссылка на запись</div>
            <div className="space-y-4">
              <p className="text-[13px] text-t2 leading-relaxed">
                Отправьте эту ссылку вашим клиентам для записи онлайн через Telegram.
              </p>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3 group shadow-sm">
                <div className="flex items-center gap-2 text-[12px] font-bold text-accent truncate">
                  <IconBrandTelegram size={18} stroke={2} className="shrink-0" />
                  <span className="truncate">{botLink}</span>
                </div>
                <button
                  className="bg-accent text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-accent-hover transition-all flex items-center gap-1.5 active:scale-95"
                  onClick={() => {
                    navigator.clipboard.writeText(botLink);
                    alert('Ссылка скопирована!');
                  }}
                >
                  <IconCopy size={14} stroke={2} /> Копировать
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className="text-[11px] font-bold text-t3 uppercase tracking-widest mb-4">Визитка</div>
            <div className="relative group">
                {/* Simplified Light Business Card */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent"></div>

                    <div className="mb-6 relative">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-slate-50 shadow-md" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-md flex items-center justify-center text-3xl">🏋️</div>
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-green-custom w-5 h-5 rounded-full border-4 border-white"></div>
                    </div>

                    <div className="space-y-1 mb-8">
                        <h3 className="text-[20px] font-extrabold text-t1 tracking-tight">{profile?.full_name || 'Ваше Имя'}</h3>
                        <p className="text-[12px] font-bold text-accent uppercase tracking-widest">{profile?.specialization || 'Специализация'}</p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                             <div className="flex items-center gap-1 text-yellow-500 font-bold text-[12px]">
                                <IconStarFilled size={12} /> {avgRating}
                             </div>
                             <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                             <div className="text-[12px] font-bold text-t3 uppercase tracking-tighter">{reviews.length} отзывов</div>
                        </div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-4">
                             <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sh-sm">
                                <QRCodeSVG
                                    value={botLink}
                                    size={120}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/favicon.ico",
                                        x: undefined,
                                        y: undefined,
                                        height: 24,
                                        width: 24,
                                        excavate: true,
                                    }}
                                />
                             </div>
                             <div className="text-[11px] font-bold text-t2 uppercase tracking-widest leading-relaxed">
                                Записаться онлайн
                             </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button className="bg-white border border-slate-100 text-t2 text-[12px] font-bold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                        <IconPrinter size={18} stroke={1.5} /> Печать
                    </button>
                    <button
                        onClick={() => {
                            navigator.share ? navigator.share({ url: botLink }) : alert('Ссылка скопирована!');
                        }}
                        className="bg-accent/5 text-accent text-[12px] font-bold py-3 rounded-xl hover:bg-accent/10 transition-all flex items-center justify-center gap-2"
                    >
                        <IconShare size={18} stroke={2} /> Поделиться
                    </button>
                </div>
            </div>
          </section>
        </div>

        <div className="space-y-12">
          {/* Bot Preview Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
                <div className="text-[11px] font-bold text-t3 uppercase tracking-widest">Предпросмотр (в Telegram)</div>
            </div>

            <div className="bg-slate-100/50 rounded-3xl p-6 relative overflow-hidden transition-all border border-slate-100">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">🤖</div>
                    <div>
                        <div className="text-[14px] font-bold text-slate-800 leading-none">Окошко Бот</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">online</div>
                    </div>
                </div>

                {/* Bubble 1 */}
                <div className="bg-white rounded-2xl rounded-bl-none p-4 mb-4 max-w-[90%] shadow-sm animate-fade-up border border-slate-50">
                    <div className="text-[13px] text-slate-700 leading-relaxed">
                        👋 Привет! Я помогу вам записаться к тренеру <strong>{profile?.full_name || 'Алексей'}</strong>.
                        <br/><br/>
                        На этой неделе есть <strong>12 свободных слотов</strong>.
                    </div>
                </div>

                {/* Keyboard Placeholder */}
                <div className="space-y-2 mt-8">
                    <button className="w-full bg-accent text-white py-3 rounded-xl text-[13px] font-bold shadow-lg shadow-accent/20">📅 Записаться</button>
                    <button className="w-full bg-white text-slate-700 py-3 rounded-xl text-[13px] font-bold border border-slate-100">👤 Мои записи</button>
                </div>
            </div>
          </section>

          {/* Last Reviews */}
          <section>
            <div className="text-[11px] font-bold text-t3 uppercase tracking-widest mb-4">Последние отзывы</div>
            <div className="space-y-4">
                {reviews.length > 0 ? reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="p-5 bg-white rounded-2xl border border-slate-50 hover:border-slate-100 transition-all group">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[13.5px] font-bold text-t1">{review.client_name || 'Клиент'}</span>
                            <div className="flex items-center gap-0.5 text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <IconStarFilled key={i} size={10} className={i < review.rating ? 'opacity-100' : 'opacity-20'} />
                                ))}
                            </div>
                        </div>
                        <p className="text-[12.5px] text-t2 italic leading-relaxed line-clamp-2">
                            «{review.comment || 'Оценка без комментария'}»
                        </p>
                        <div className="text-[10px] text-t3 font-bold uppercase tracking-widest mt-3 opacity-60">
                            {new Date(review.created_at).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl text-t3 text-[12px] font-medium italic">Отзывов пока нет</div>
                )}
            </div>
          </section>

          {/* Bot Stats */}
          <section>
            <div className="text-[11px] font-bold text-t3 uppercase tracking-widest mb-4">Аналитика бота</div>
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Активных сессий', val: sessions.length },
                    { label: 'Всего записей', val: sessions.length + completedSessions.length },
                ].map((stat, i) => (
                    <div key={i} className="p-5 bg-white border border-slate-50 rounded-2xl flex flex-col items-center text-center shadow-sh-sm">
                        <div className="text-[24px] font-extrabold text-t1 tracking-tight">{stat.val}</div>
                        <div className="text-[10px] text-t3 font-bold uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
