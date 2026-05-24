'use client';

import React, { useState } from 'react';
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX } from '@tabler/icons-react';
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
    <div className="animate-fade-up max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em]">Ваши услуги</div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-accent text-white text-[13px] font-semibold px-4 py-2 rounded-r-sm hover:bg-accent-hover transition-all flex items-center gap-2"
        >
          <IconPlus size={16} /> Добавить услугу
        </button>
      </div>

      <div className="grid gap-4">
        {isAdding && (
          <div className="card border-2 border-accent/20 bg-accent/5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="sm:col-span-1">
                <label className="text-[11px] text-t3 block mb-1">Название</label>
                <input
                  type="text"
                  value={newData.name}
                  onChange={e => setNewData({...newData, name: e.target.value})}
                  placeholder="Напр. Персональная тренировка"
                  className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-[11px] text-t3 block mb-1">Длительность (мин)</label>
                <input
                  type="number"
                  value={newData.duration}
                  onChange={e => setNewData({...newData, duration: parseInt(e.target.value)})}
                  className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-[11px] text-t3 block mb-1">Стоимость (₽)</label>
                <input
                  type="number"
                  value={newData.price}
                  onChange={e => setNewData({...newData, price: parseInt(e.target.value)})}
                  className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="text-[11px] text-t3 block mb-1">Площадка</label>
                <select
                  value={newData.venue_id}
                  onChange={e => setNewData({...newData, venue_id: e.target.value})}
                  className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                >
                  <option value="">Без площадки</option>
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newIsGroup"
                  checked={newData.is_group}
                  onChange={e => setNewData({...newData, is_group: e.target.checked})}
                  className="rounded border-border-custom text-accent focus:ring-accent"
                />
                <label htmlFor="newIsGroup" className="text-[13px] text-t2">Групповая услуга</label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAdding(false)} className="text-[13px] px-4 py-2 text-t3 hover:text-t1 transition-colors">Отмена</button>
              <button onClick={handleAdd} className="bg-accent text-white text-[13px] font-semibold px-6 py-2 rounded-r-sm">Сохранить</button>
            </div>
          </div>
        )}

        {services.map(service => (
          <div key={service.id} className="card group">
            {editingId === service.id ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={e => setEditData({...editData, name: e.target.value})}
                    className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={editData.duration}
                    onChange={e => setEditData({...editData, duration: parseInt(e.target.value)})}
                    className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-1">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={editData.price}
                      onChange={e => setEditData({...editData, price: parseInt(e.target.value)})}
                      className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                    />
                    <select
                      value={editData.venue_id || ''}
                      onChange={e => setEditData({...editData, venue_id: e.target.value || null})}
                      className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                    >
                      <option value="">Без площадки</option>
                      {venues.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="p-2 text-t3 hover:bg-bg-custom rounded-r-sm flex items-center gap-1 text-[13px]">
                       <IconX size={18} /> <span className="sm:hidden">Отмена</span>
                    </button>
                    <button onClick={handleUpdate} className="p-2 text-green-custom hover:bg-green-custom/10 rounded-r-sm flex items-center gap-1 text-[13px]">
                       <IconCheck size={18} /> <span className="sm:hidden">Сохранить</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editIsGroup"
                      checked={editData.is_group}
                      onChange={e => setEditData({...editData, is_group: e.target.checked})}
                      className="rounded border-border-custom text-accent focus:ring-accent"
                    />
                    <label htmlFor="editIsGroup" className="text-[13px] text-t2">Групповая услуга</label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-[15px] font-semibold text-t1">{service.name}</div>
                    {service.is_group && (
                      <span className="text-[10px] font-bold bg-blue-light text-blue-custom px-1.5 py-0.5 rounded-full uppercase tracking-wider">Групповая</span>
                    )}
                  </div>
                  <div className="text-[12px] text-t3 mt-0.5">
                    {service.duration} минут · {service.price} ₽
                    {service.venue && <span className="ml-2 text-accent">· {service.venue.name}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(service)}
                    className="p-2 text-t3 hover:text-accent hover:bg-accent/5 rounded-r-sm transition-all"
                  >
                    <IconEdit size={18} />
                  </button>
                  <button
                    onClick={() => removeService(service.id)}
                    className="p-2 text-t3 hover:text-red-custom hover:bg-red-custom/5 rounded-r-sm transition-all"
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
