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
    serviceId: ''
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
  }, [services, formData.serviceId]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === formData.serviceId);
    await addSession({
      name: formData.name,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      serviceId: formData.serviceId,
      service: service?.name
    });
    onClose();
    // Reset form
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      serviceId: services[0]?.id || ''
    });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div
        className="bg-surface rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border bg-bg-custom/50">
          <h2 className="text-[17px] font-bold text-t1 tracking-tight">Новая запись</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-t3 hover:text-t1 rounded-lg hover:bg-bg-custom transition-colors"
          >
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-t2">Имя клиента</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2.5 bg-bg-custom/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-[14px] text-t1"
              placeholder="Введите имя и фамилию"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-t2">Услуга</label>
            <div className="relative">
              <select
                className="w-full px-4 py-2.5 bg-bg-custom/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all appearance-none text-[14px] text-t1"
                value={formData.serviceId}
                onChange={e => setFormData({...formData, serviceId: e.target.value})}
              >
                {services.map(s => (
                  <option key={s.id} value={s.id} className="bg-surface text-t1">
                    {s.name} ({s.price} ₽) {s.venue ? `— ${s.venue.name}` : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-t3">
                <IconChevronDown size={16} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-t2">Дата</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 bg-bg-custom/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-[14px] text-t1"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-t2">От</label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2.5 bg-bg-custom/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-[14px] text-t1"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-t2">До</label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2.5 bg-bg-custom/50 border border-border rounded-xl focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all text-[14px] text-t1"
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
              className="flex-1 px-4 py-2.5 border border-border text-t2 font-bold text-[14px] rounded-xl hover:bg-bg-custom transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-accent text-white font-bold text-[14px] rounded-xl hover:bg-accent-hover transition-all shadow-lg shadow-accent/25 active:scale-[0.98]"
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
