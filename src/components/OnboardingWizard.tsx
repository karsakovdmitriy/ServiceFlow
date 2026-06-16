'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { IconChevronRight, IconStethoscope, IconUser, IconBuildingStore, IconCheck } from '@tabler/icons-react';

export default function OnboardingWizard() {
  const pathname = usePathname();
  const { profile, activeRole, updateProfile, loading } = useStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    specialization: '',
    category: 'Спорт',
    full_name: '',
  });

  React.useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        specialization: prev.specialization || (profile as any).specialization || '',
        category: prev.category === 'Спорт' ? ((profile as any).category || 'Спорт') : prev.category,
        full_name: prev.full_name || profile.full_name || '',
      }));
    }
  }, [profile]);

  const onboardingField = `onboarding_completed_${activeRole}` as keyof typeof profile;
  const isCompleted = profile?.[onboardingField];

  const isLegalPage = pathname?.startsWith('/legal');

  if (loading || !profile || isCompleted || isLegalPage) return null;

  const handleComplete = async () => {
    const { error } = await updateProfile({
      ...formData,
      [onboardingField]: true
    });
    if (error) {
      alert('Ошибка при сохранении профиля. Пожалуйста, попробуйте еще раз или проверьте консоль.');
    }
  };

  const renderMasterWizard = () => (
    <div className="space-y-6">
      {step === 1 && (
        <div className="animate-fade-up">
          <h2 className="text-xl font-bold text-t1 mb-2">Ваша специализация</h2>
          <p className="text-t3 text-sm mb-6">Расскажите, чем вы занимаетесь, чтобы клиенты могли вас найти.</p>
          <input
            type="text"
            placeholder="Например: Силовой тренер, Визажист..."
            className="w-full bg-bg-custom border border-border-light rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none transition-all"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          />
          <button
            onClick={() => setStep(2)}
            disabled={!formData.specialization}
            className="w-full mt-8 bg-accent text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
          >
            Далее
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="animate-fade-up">
          <h2 className="text-xl font-bold text-t1 mb-2">Категория услуг</h2>
          <p className="text-t3 text-sm mb-6">Выберите основную категорию вашей деятельности.</p>
          <div className="grid grid-cols-2 gap-3">
            {['Спорт', 'Бьюти', 'Обучение', 'Медицина', 'Другое'].map(cat => (
              <button
                key={cat}
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`p-4 rounded-xl border text-sm font-bold transition-all ${
                  formData.category === cat ? 'bg-accent text-white border-accent' : 'bg-bg-custom border-border-light text-t2 hover:border-accent/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-t2 py-3 rounded-xl font-bold text-sm">Назад</button>
            <button
              onClick={handleComplete}
              className="flex-[2] bg-accent text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg shadow-accent/20 transition-all"
            >
              Завершить
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderClientWizard = () => (
    <div className="space-y-6 animate-fade-up">
      <h2 className="text-xl font-bold text-t1 mb-2">Добро пожаловать, {profile?.full_name?.split(' ')[0]}!</h2>
      <p className="text-t3 text-sm mb-6">Подтвердите ваше имя для отображения в системе записи.</p>
      <input
        type="text"
        placeholder="Ваше имя"
        className="w-full bg-bg-custom border border-border-light rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent outline-none transition-all"
        value={formData.full_name}
        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
      />
      <button
        onClick={handleComplete}
        disabled={!formData.full_name}
        className="w-full mt-8 bg-accent text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg shadow-accent/20 transition-all disabled:opacity-50"
      >
        Начать пользоваться
      </button>
    </div>
  );

  const renderVenueWizard = () => (
    <div className="space-y-6 animate-fade-up">
      <h2 className="text-xl font-bold text-t1 mb-2">Настройка площадки</h2>
      <p className="text-t3 text-sm mb-6">Вы можете настроить детальную информацию о вашей площадке позже в профиле.</p>
      <div className="bg-accent/5 border border-accent/10 rounded-xl p-4 flex gap-4 items-center">
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white">
          <IconBuildingStore size={20} />
        </div>
        <div>
          <div className="text-[13px] font-bold text-t1">Готовы к работе?</div>
          <div className="text-[11px] text-t3">Ваша площадка теперь доступна для добавления мастеров.</div>
        </div>
      </div>
      <button
        onClick={handleComplete}
        className="w-full mt-8 bg-accent text-white py-3 rounded-xl font-bold text-sm hover:shadow-lg shadow-accent/20 transition-all"
      >
        Перейти к панели управления
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-[440px] rounded-[32px] shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8 pb-0 flex justify-between items-start">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            {activeRole === 'master' && <IconStethoscope size={24} />}
            {activeRole === 'client' && <IconUser size={24} />}
            {activeRole === 'venue' && <IconBuildingStore size={24} />}
          </div>
          <div className="flex gap-1">
             {[1, 2].map(i => (
               <div key={i} className={`h-1 rounded-full transition-all ${activeRole !== 'master' ? 'hidden' : ''} ${step >= i ? 'w-6 bg-accent' : 'w-2 bg-slate-200'}`} />
             ))}
          </div>
        </div>
        <div className="p-8">
          {activeRole === 'master' && renderMasterWizard()}
          {activeRole === 'client' && renderClientWizard()}
          {activeRole === 'venue' && renderVenueWizard()}
        </div>
      </div>
    </div>
  );
}
