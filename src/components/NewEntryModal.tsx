'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconX, IconChevronDown } from '@tabler/icons-react';
import { useStore } from '@/lib/store';

export default function NewEntryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { services, addSession } = useStore();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    serviceId: services[0]?.id || ''
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update serviceId when services load
  useEffect(() => {
    if (services.length > 0 && !formData.serviceId) {
        setFormData(prev => ({ ...prev, serviceId: services[0].id }));
    }
  }, [services]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === formData.serviceId);
    addSession({
      name: formData.name,
      date: formData.date,
      time: `${formData.startTime} – ${formData.endTime}`,
      service: service?.name
    });
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Новая запись</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-gray-700">Имя клиента</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-[14px]"
              placeholder="Введите имя и фамилию"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-gray-700">Услуга</label>
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none text-[14px]"
                value={formData.serviceId}
                onChange={e => setFormData({...formData, serviceId: e.target.value})}
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.price} ₽)</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <IconChevronDown size={16} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-gray-700">Дата</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-[14px]"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">От</label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-[14px]"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">До</label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-[14px]"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold text-[14px] rounded-xl hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-brand-500 text-white font-bold text-[14px] rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/25 active:scale-[0.98]"
            >
              Создать запись
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
