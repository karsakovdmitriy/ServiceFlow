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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="bg-surface rounded-[40px] w-full max-w-md animate-fade-up overflow-hidden p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[18px] font-bold text-t1 tracking-tight">Новая запись</h2>
          <button
            onClick={onClose}
            className="text-t3 hover:text-t1 transition-colors"
          >
            <IconX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold text-t3 uppercase tracking-widest mb-1 opacity-60">Имя клиента</label>
            <input
              type="text"
              required
              className="w-full input-modern"
              placeholder="Введите имя"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-t3 uppercase tracking-widest mb-1 opacity-60">Услуга</label>
            <div className="relative">
              <select
                className="w-full input-modern appearance-none"
                value={formData.serviceId}
                onChange={e => setFormData({...formData, serviceId: e.target.value})}
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.price.toLocaleString()} ₽)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-bold text-t3 uppercase tracking-widest mb-1 opacity-60">Дата</label>
              <input
                type="date"
                required
                className="w-full input-modern"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-t3 uppercase tracking-widest mb-1 opacity-60">От</label>
                <input
                  type="time"
                  required
                  className="w-full input-modern"
                  value={formData.startTime}
                  onChange={e => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-t3 uppercase tracking-widest mb-1 opacity-60">До</label>
                <input
                  type="time"
                  required
                  className="w-full input-modern"
                  value={formData.endTime}
                  onChange={e => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              className="w-full py-4 bg-accent text-white font-bold text-[14px] rounded-2xl hover:bg-accent-hover transition-all shadow-xl shadow-accent/20 active:scale-[0.98]"
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
