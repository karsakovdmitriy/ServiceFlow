import React from 'react';

export default function TermsPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-black mb-8 tracking-tight text-t1">Пользовательское соглашение</h1>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">1. Общие положения</h2>
          <p className="text-t2 leading-relaxed">
            Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения между администрацией сервиса «Окошко» (далее — Сервис) и физическим лицом (далее — Пользователь), использующим возможности Сервиса.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">2. Регистрация и использование</h2>
          <p className="text-t2 leading-relaxed">
            Для использования Сервиса Пользователь обязуется пройти процедуру регистрации, предоставив достоверную информацию. Сервис предназначен для автоматизации записи на услуги и управления клиентской базой.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">3. Обязанности сторон</h2>
          <p className="text-t2 leading-relaxed">
            Сервис обязуется обеспечивать работоспособность системы, за исключением времени проведения технических работ. Пользователь обязуется не использовать Сервис для совершения противоправных действий.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">4. Ответственность</h2>
          <p className="text-t2 leading-relaxed">
            Администрация Сервиса не несет ответственности за прямые или косвенные убытки, возникшие в результате использования или невозможности использования Сервиса.
          </p>
        </div>

        <div className="pt-8 text-sm text-t3 border-t border-border">
          Последнее обновление: 24 мая 2024 г.
        </div>
      </section>
    </div>
  );
}
