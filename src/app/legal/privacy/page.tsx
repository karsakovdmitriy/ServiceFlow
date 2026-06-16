import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-black mb-8 tracking-tight text-t1">Политика конфиденциальности</h1>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">1. Сбор информации</h2>
          <p className="text-t2 leading-relaxed">
            Мы собираем только те данные, которые необходимы для функционирования Сервиса: имя, адрес электронной почты, номер телефона и данные о записях.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">2. Использование данных</h2>
          <p className="text-t2 leading-relaxed">
            Персональные данные используются исключительно для аутентификации пользователей, отправки уведомлений и предоставления функционала Сервиса.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">3. Защита данных</h2>
          <p className="text-t2 leading-relaxed">
            Мы используем современные методы шифрования и Row Level Security (RLS) в базе данных Supabase для обеспечения безопасности ваших данных.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">4. Передача третьим лицам</h2>
          <p className="text-t2 leading-relaxed">
            Мы не продаем и не передаем персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ.
          </p>
        </div>

        <div className="pt-8 text-sm text-t3 border-t border-border">
          Последнее обновление: 24 мая 2024 г.
        </div>
      </section>
    </div>
  );
}
