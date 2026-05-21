import React from 'react';

export default function BotPage() {
  return (
    <div className="animate-fade-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Ваша ссылка на бот</div>
          <div className="card mb-4">
            <p className="text-[13px] text-t2 leading-[1.65] mb-3.5">Отправьте клиентам ссылку — они запишутся самостоятельно через Telegram:</p>
            <div className="bg-bg-custom border border-border-light rounded-r-sm p-[11px_14px] flex items-center justify-between gap-2.5 text-[13px] font-mono text-t1 mb-2.5">
              <span>t.me/your_trainer_bot</span>
              <button className="bg-white border border-border-custom text-t2 text-[12px] font-medium p-[5px_11px] rounded-[6px] cursor-pointer whitespace-nowrap transition-all hover:border-accent hover:text-accent">Скопировать</button>
            </div>
          </div>

          <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Статистика бота</div>
          <div className="card">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { val: '12', lbl: 'Активных пользователей' },
                { val: '47', lbl: 'Записей через бот' },
                { val: '94%', lbl: 'Конверсия', color: 'text-green-custom' },
                { val: '2', lbl: 'Новых за неделю' },
              ].map((stat, i) => (
                <div key={i} className="bg-bg-custom rounded-r-md p-3.5 text-center border border-border-light">
                  <div className={`text-[26px] font-bold text-t1 tracking-[-1px] leading-none ${stat.color || ''}`}>{stat.val}</div>
                  <div className="text-[11.5px] text-t3 mt-[3px]">{stat.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em] mb-3">Предпросмотр бота</div>
          <div className="bg-gradient-to-br from-[#0088cc] to-[#00A8E8] rounded-r-lg p-5 shadow-[0_6px_24px_rgba(0,136,204,0.25)]">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-9 h-9 bg-white/18 rounded-full flex items-center justify-center text-[16px]">🤖</div>
              <div>
                <div className="text-[14px] font-semibold text-white">TrainerSpace Bot</div>
                <div className="text-[11px] text-white/65">онлайн</div>
              </div>
            </div>

            <div className="bg-white rounded-[10px_10px_10px_2px] p-[10px_12px] mb-2 max-w-[82%] shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              <div className="text-[12.5px] text-[#1a1a2e] leading-[1.55]">
                👋 Привет! Я помогу записаться на тренировку к <strong>Алексею Смирнову</strong>.<br/><br/>Выберите действие:
              </div>
              <div className="flex gap-1.5 flex-wrap mt-2">
                <button className="bg-white/14 border border-white/28 text-white text-[11.5px] font-medium p-[6px_11px] rounded-[7px] cursor-pointer transition-all hover:bg-white/26">📅 Записаться</button>
                <button className="bg-white/14 border border-white/28 text-white text-[11.5px] font-medium p-[6px_11px] rounded-[7px] cursor-pointer transition-all hover:bg-white/26">👤 Мои записи</button>
                <button className="bg-white/14 border border-white/28 text-white text-[11.5px] font-medium p-[6px_11px] rounded-[7px] cursor-pointer transition-all hover:bg-white/26">❓ Помощь</button>
              </div>
            </div>

            <div className="bg-[#e7fdd4] rounded-[10px_10px_2px_10px] p-[10px_12px] mb-2 max-w-[80%] ml-auto shadow-[0_2px_8px_rgba(0,0,0,0.09)]">
              <div className="text-[12.5px] text-[#1a2e1a]">📅 Записаться</div>
            </div>

            <div className="bg-white rounded-[10px_10px_10px_2px] p-[10px_12px] mb-2 max-w-[82%] shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
              <div className="text-[12.5px] text-[#1a1a2e] leading-[1.55]">Отлично! Выберите удобный день:</div>
              <div className="flex gap-1.5 flex-wrap mt-2">
                <button className="bg-white/14 border border-white/28 text-white text-[11.5px] font-medium p-[6px_11px] rounded-[7px] cursor-pointer transition-all hover:bg-white/26">ПН 19</button>
                <button className="bg-white/14 border border-white/28 text-white text-[11.5px] font-medium p-[6px_11px] rounded-[7px] cursor-pointer transition-all hover:bg-white/26">ВТ 20</button>
                <button className="bg-white/14 border border-white/28 text-white text-[11.5px] font-medium p-[6px_11px] rounded-[7px] cursor-pointer transition-all hover:bg-white/26">СР 21</button>
                <button className="bg-white/14 border border-white/28 text-white text-[11.5px] font-medium p-[6px_11px] rounded-[7px] cursor-pointer transition-all hover:bg-white/26">ЧТ 22</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
