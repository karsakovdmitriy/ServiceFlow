import React from 'react';

export default function OfferPage() {
  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-black mb-8 tracking-tight text-t1">Публичная оферта</h1>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">1. Предмет оферты</h2>
          <p className="text-t2 leading-relaxed">
            Настоящая оферта является официальным предложением Сервиса «Окошко» по оказанию информационно-технологических услуг по автоматизации бизнес-процессов записи.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">2. Акцепт оферты</h2>
          <p className="text-t2 leading-relaxed">
            Акцептом настоящей оферты является регистрация Пользователя в Сервисе и/или оплата услуг согласно выбранному тарифному плану.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">3. Стоимость услуг</h2>
          <p className="text-t2 leading-relaxed">
            Стоимость услуг определяется действующими тарифами, размещенными на сайте Сервиса. Сервис оставляет за собой право изменять тарифы в одностороннем порядке с уведомлением за 14 дней.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-3 text-t1">4. Порядок оказания услуг</h2>
          <p className="text-t2 leading-relaxed">
            Услуги считаются оказанными надлежащим образом и принятыми в полном объеме, если в течение 3-х дней после окончания расчетного периода от Пользователя не поступило мотивированных претензий.
          </p>
        </div>

        <div className="pt-8 text-sm text-t3 border-t border-border">
          Последнее обновление: 24 мая 2024 г.
        </div>
      </section>
    </div>
  );
}
