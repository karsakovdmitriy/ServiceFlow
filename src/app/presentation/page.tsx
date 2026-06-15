import React from 'react';
import {
  IconWindow,
  IconCalendarEvent,
  IconUsers,
  IconBrandTelegram,
  IconChartBar,
  IconClock,
  IconShieldCheck,
  IconArrowRight,
  IconStar,
  IconDeviceMobile
} from '@tabler/icons-react';

const Presentation = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-indigo-100">
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#6366F1] rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <IconWindow size={20} stroke={2} />
          </div>
          <span className="text-xl font-black tracking-tight">Окошко</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-slate-500">
          <a href="#masters" className="hover:text-indigo-600 transition-colors">Мастерам</a>
          <a href="#venues" className="hover:text-indigo-600 transition-colors">Площадкам</a>
          <a href="#clients" className="hover:text-indigo-600 transition-colors">Клиентам</a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-up">
          <IconShieldCheck size={14} /> SaaS решение 2024
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Ваш бизнес в одном <span className="text-[#6366F1]">Окошке</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Интеллектуальная экосистема для сферы услуг: автоматизация записи, CRM и прозрачное взаимодействие мастеров и площадок.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <button className="px-8 py-4 bg-[#6366F1] text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1">
            Начать бесплатно
          </button>
          <button className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Смотреть демо
          </button>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <img src="/screenshots/dashboard.png" alt="Dashboard Preview" className="w-full h-auto" />
        </div>
      </section>

      {/* For Masters */}
      <section id="masters" className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[#6366F1] font-bold uppercase tracking-widest text-xs mb-4">Для специалистов</div>
            <h2 className="text-4xl font-black tracking-tight mb-6">Масштабируйте талант, а не рутину</h2>
            <div className="space-y-6">
              {[
                { icon: IconCalendarEvent, title: 'Умное расписание', desc: 'Автоматическая блокировка слотов и гибкие часы работы.' },
                { icon: IconUsers, title: 'CRM в кармане', desc: 'Полная история клиентов и аналитика их предпочтений.' },
                { icon: IconBrandTelegram, title: 'Запись 24/7', desc: 'Клиенты бронируют время через бота, пока вы отдыхаете.' },
              ].map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6366F1] shrink-0">
                    <f.icon size={24} stroke={1.5} />
                  </div>
                  <div>
                    <div className="font-bold text-lg mb-1">{f.title}</div>
                    <div className="text-slate-500 text-sm leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-indigo-50 rounded-3xl scale-95 group-hover:scale-100 transition-transform"></div>
            <img src="/screenshots/schedule.png" alt="Schedule" className="relative rounded-2xl shadow-xl border border-slate-100" />
          </div>
        </div>
      </section>

      {/* Analytics Break */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <img src="/screenshots/analytics.png" alt="Analytics" className="rounded-2xl shadow-2xl border border-slate-800" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-black tracking-tight mb-6">Видьте свой успех в цифрах</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Финансовая аналитика за 6 месяцев покажет реальную динамику ваших доходов и поможет планировать рост.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-3xl font-black text-[#6366F1] mb-1">99%</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Точность учета</div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-400 mb-1">+40%</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Рост записи</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Venues */}
      <section id="venues" className="py-24 bg-[#F8FAFC] px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="text-[#6366F1] font-bold uppercase tracking-widest text-xs mb-4">Для площадок</div>
          <h2 className="text-4xl font-black tracking-tight">Эффективное управление пространством</h2>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: IconUsers, title: 'Управление мастерами', desc: 'Привязывайте штатных и независимых специалистов к локации.' },
            { icon: IconChartBar, title: 'Загрузка площадки', desc: 'Анализируйте плотность записей и оптимизируйте время.' },
            { icon: IconClock, title: 'Синхронизация', desc: 'Автоматический учет режима работы площадки при бронировании.' },
          ].map((c, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#6366F1] mb-6">
                <c.icon size={28} stroke={1.5} />
              </div>
              <div className="font-bold text-xl mb-3">{c.title}</div>
              <div className="text-slate-500 text-sm leading-relaxed">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Telegram Bot */}
      <section id="clients" className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <IconBrandTelegram size={14} /> Telegram Native
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-6">Запись, которую любят клиенты</h2>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">
              Никаких лишних приложений. Знакомый интерфейс мессенджера, мгновенные уведомления и запись за 30 секунд.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                'Автоматические напоминания о визите',
                'Сбор честных отзывов после сессии',
                'Личный кабинет со списком записей',
                'Быстрый перенос в один клик'
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 font-bold text-slate-700">
                  <div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <IconShieldCheck size={14} stroke={2.5} />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
            <button className="flex items-center gap-2 text-[#6366F1] font-black group">
              Посмотреть демо бота <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="flex justify-center">
             <div className="relative w-full max-w-[400px]">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                <img src="/screenshots/bot.png" alt="Bot Preview" className="relative rounded-[2.5rem] shadow-2xl border-8 border-slate-900" />
             </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto bg-[#6366F1] rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

           <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 relative z-10">Готовы открыть <br/>свое «Окошко»?</h2>
           <p className="text-indigo-100 text-lg mb-10 max-w-md mx-auto relative z-10">
             Присоединяйтесь к сообществу профессионалов, которые выбирают умную автоматизацию.
           </p>
           <button className="px-10 py-5 bg-white text-[#6366F1] rounded-2xl font-black text-lg hover:bg-slate-50 transition-all shadow-xl relative z-10 hover:-translate-y-1">
             Создать аккаунт бесплатно
           </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <IconWindow size={20} />
            </div>
            <span className="text-xl font-black tracking-tight">Окошко</span>
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <span>© 2024</span>
            <a href="#" className="hover:text-[#6366F1]">Privacy</a>
            <a href="#" className="hover:text-[#6366F1]">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Presentation;
