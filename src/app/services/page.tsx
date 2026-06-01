'use client';

import React, { useState } from 'react';
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconMapPin, IconClock, IconCurrencyRubel, IconUsers, IconBarbell } from '@tabler/icons-react';
import { useStore, Service } from '@/lib/store';

export default function ServicesPage() {
  const { services, venues, addService, updateService, removeService } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newData, setNewData] = useState({ name: '', duration: 60, price: 1000, is_group: false, venue_id: '' });
  const [editData, setEditData] = useState<Partial<Service>>({});

  const handleAdd = () => {
    addService({
      ...newData,
      venue_id: newData.venue_id || null
    });
    setNewData({ name: '', duration: 60, price: 1000, is_group: false, venue_id: '' });
    setIsAdding(false);
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditData(service);
  };

  const handleUpdate = () => {
    if (editingId) {
      updateService(editingId, editData);
      setEditingId(null);
    }
  };

  return (
    <div className="animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[20px] font-bold text-t1">Услуги и площадки</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-accent text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl hover:bg-accent-hover transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
        >
          <IconPlus size={18} /> Новая услуга
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="card group hover:shadow-sh-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-light text-accent flex items-center justify-center">
                {service.is_group ? <IconUsers size={20} /> : <IconBarbell size={20} />}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(service)}
                  className="p-2 text-t3 hover:text-accent hover:bg-accent-light rounded-lg transition-all"
                >
                  <IconEdit size={16} />
                </button>
                <button
                  onClick={() => removeService(service.id)}
                  className="p-2 text-t3 hover:text-red-custom hover:bg-red-light rounded-lg transition-all"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-[16px] font-bold text-t1">{service.name}</h3>
                {service.is_group && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-blue-custom bg-blue-light px-1.5 py-0.5 rounded-full uppercase tracking-wider">Групповая</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border-light pt-4">
                <div className="flex items-center gap-2">
                  <IconClock size={16} className="text-t3" />
                  <span className="text-[13px] font-medium text-t2">{service.duration} мин</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCurrencyRubel size={16} className="text-t3" />
                  <span className="text-[13px] font-bold text-t1">{service.price} ₽</span>
                </div>
              </div>

              {service.venue && (
                <div className="flex items-center gap-2 bg-bg-custom p-2 rounded-lg">
                  <IconMapPin size={16} className="text-accent" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-t1 truncate">{service.venue.name}</div>
                    <div className="text-[10px] text-t3 truncate">{service.venue.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fade-up overflow-hidden">
            <div className="p-5 border-b border-border-light flex items-center justify-between bg-bg-custom">
              <h2 className="font-bold text-t1">{editingId ? 'Редактировать услугу' : 'Новая услуга'}</h2>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-t3 hover:text-t1 transition-colors"><IconX size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-t2 block mb-1">Название услуги</label>
                <input
                  type="text"
                  placeholder="Напр. Персональная тренировка"
                  value={editingId ? editData.name : newData.name}
                  onChange={e => editingId ? setEditData({...editData, name: e.target.value}) : setNewData({...newData, name: e.target.value})}
                  className="w-full text-[13px] border border-border-custom rounded-xl p-3 bg-surface outline-none focus:border-accent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-medium text-t2 block mb-1">Длительность (мин)</label>
                  <input
                    type="number"
                    value={editingId ? editData.duration : newData.duration}
                    onChange={e => editingId ? setEditData({...editData, duration: parseInt(e.target.value)}) : setNewData({...newData, duration: parseInt(e.target.value)})}
                    className="w-full text-[13px] border border-border-custom rounded-xl p-3 bg-surface outline-none focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-t2 block mb-1">Стоимость (₽)</label>
                  <input
                    type="number"
                    value={editingId ? editData.price : newData.price}
                    onChange={e => editingId ? setEditData({...editData, price: parseInt(e.target.value)}) : setNewData({...newData, price: parseInt(e.target.value)})}
                    className="w-full text-[13px] border border-border-custom rounded-xl p-3 bg-surface outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-medium text-t2 block mb-1">Площадка</label>
                <select
                  value={editingId ? (editData.venue_id || '') : newData.venue_id}
                  onChange={e => editingId ? setEditData({...editData, venue_id: e.target.value || null}) : setNewData({...newData, venue_id: e.target.value})}
                  className="w-full text-[13px] border border-border-custom rounded-xl p-3 bg-surface outline-none focus:border-accent transition-all appearance-none"
                >
                  <option value="">Без площадки</option>
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 p-3 bg-bg-custom rounded-xl cursor-pointer hover:bg-border-light transition-all">
                <input
                  type="checkbox"
                  checked={editingId ? editData.is_group : newData.is_group}
                  onChange={e => editingId ? setEditData({...editData, is_group: e.target.checked}) : setNewData({...newData, is_group: e.target.checked})}
                  className="w-4 h-4 rounded border-border-custom text-accent focus:ring-accent"
                />
                <div>
                    <div className="text-[13px] font-bold text-t1">Групповая тренировка</div>
                    <div className="text-[11px] text-t3">Позволяет нескольким клиентам записаться на один слот</div>
                </div>
              </label>
            </div>

            <div className="p-5 bg-bg-custom border-t border-border-light flex gap-3">
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="flex-1 py-2.5 text-[13px] font-bold text-t2 hover:bg-white rounded-xl transition-all">Отмена</button>
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex-1 py-2.5 text-[13px] font-bold text-white bg-accent hover:bg-accent-hover rounded-xl transition-all shadow-lg shadow-accent/20"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
