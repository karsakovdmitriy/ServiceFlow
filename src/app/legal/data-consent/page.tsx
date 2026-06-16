import React from 'react';

export default function DataConsentPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-black mb-8 tracking-tight text-t1">Согласие на обработку персональных данных</h1>

      <section className="space-y-6">
        <p className="text-t2 leading-relaxed">
          Настоящим, регистрируясь в Сервисе «Окошко», я даю свое согласие на обработку моих персональных данных в соответствии с Федеральным законом №152-ФЗ «О персональных данных».
        </p>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">Перечень данных</h2>
          <ul className="list-disc pl-5 space-y-2 text-t2">
            <li>Фамилия, Имя, Отчество;</li>
            <li>Адрес электронной почты;</li>
            <li>Номер мобильного телефона;</li>
            <li>Фотография профиля;</li>
            <li>ID в мессенджере Telegram.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">Цели обработки</h2>
          <p className="text-t2 leading-relaxed">
            Данные обрабатываются в целях предоставления доступа к функционалу Сервиса, осуществления коммуникации, отправки уведомлений о записях и повышения качества обслуживания.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">Срок действия</h2>
          <p className="text-t2 leading-relaxed">
            Согласие действует с момента регистрации до момента удаления аккаунта Пользователем или по письменному требованию.
          </p>
        </div>

        <div className="pt-8 text-sm text-t3 border-t border-border">
          Последнее обновление: 24 мая 2024 г.
        </div>
      </section>
    </div>
  );
}
