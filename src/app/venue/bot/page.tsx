'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { IconBrandTelegram, IconInfoCircle, IconExternalLink, IconCopy, IconCheck } from '@tabler/icons-react';
import { QRCodeSVG } from 'qrcode.react';

export default function VenueBotPage() {
  const { venues, isDemoMode } = useStore();
  const venue = venues[0];
  const [copied, setCopied] = React.useState(false);

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'TrainerSpaceBot';
  const botLink = `https://t.me/${botUsername}?start=v_${venue?.id || 'id'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(botLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-up max-w-[1000px] mx-auto space-y-12">
      <h1 className="text-2xl font-bold text-t1">Telegram бот площадки</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
            <section className="bg-surface p-8 rounded-3xl border border-border shadow-sh-sm space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/5 flex items-center justify-center text-accent">
                        <IconBrandTelegram size={28} stroke={1.5} />
                    </div>
                    <div>
                        <div className="text-[16px] font-bold text-t1 tracking-tight">Ваш бот для записи</div>
                        <div className="text-[13px] text-t3">Клиенты могут записываться на вашу площадку через Telegram</div>
                    </div>
                </div>

                <div className="p-4 bg-bg-custom rounded-2xl border border-border flex items-center justify-between gap-4">
                    <div className="text-[13px] font-mono text-t2 truncate">{botLink}</div>
                    <button onClick={handleCopy} className="p-2 text-t3 hover:text-accent transition-colors shrink-0">
                        {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                    </button>
                </div>

                <div className="flex gap-4">
                    <a
                        href={botLink}
                        target="_blank"
                        className="flex-1 bg-accent text-white py-3 rounded-xl text-[13px] font-bold hover:bg-accent-hover transition-all text-center flex items-center justify-center gap-2"
                    >
                        Открыть в TG <IconExternalLink size={16} />
                    </a>
                </div>
            </section>

            <section className="bg-blue-50/30 p-6 rounded-3xl border border-blue-100 space-y-4">
                <div className="flex items-center gap-2 text-blue-600">
                    <IconInfoCircle size={20} stroke={2} />
                    <h3 className="text-[14px] font-bold uppercase tracking-wider">Как это работает?</h3>
                </div>
                <ul className="space-y-3">
                    {[
                        'Разместите ссылку в Instagram или на сайте площадки',
                        'Клиент выбирает услугу и свободного мастера',
                        'Заявка появляется у вас в разделе «Заявки»',
                        'Система учитывает график работы площадки и мастеров'
                    ].map((text, i) => (
                        <li key={i} className="flex gap-3 text-[13px] text-t2 leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</span>
                            {text}
                        </li>
                    ))}
                </ul>
            </section>
        </div>

        <div className="flex flex-col items-center justify-center p-10 bg-surface rounded-3xl border border-border shadow-sh-sm">
            <div className="p-6 bg-white rounded-3xl shadow-2xl border border-border mb-6">
                <QRCodeSVG value={botLink} size={200} />
            </div>
            <div className="text-center">
                <div className="text-[15px] font-bold text-t1">QR-код площадки</div>
                <p className="text-[13px] text-t3 mt-1">Распечатайте и разместите на ресепшене</p>
            </div>
        </div>
      </div>
    </div>
  );
}
