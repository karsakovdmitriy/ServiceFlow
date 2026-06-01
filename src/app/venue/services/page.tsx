'use client';

import React, { useState } from 'react';
import { IconPlus, IconTrash, IconEdit, IconX, IconClock, IconMapPin, IconStethoscope } from '@tabler/icons-react';
import { useStore, Service } from '@/lib/store';

export default function VenueServices() {
  const { services, venueStaff, addService, updateService, removeService, venues } = useStore();
  const currentVenue = venues[0];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newData, setNewData] = useState({ name: '', duration: 60, price: 1000, is_group: false, venue_id: currentVenue?.id || '', assigned_trainer_id: '' });
  const [editData, setEditData] = useState<Partial<Service>>({});

  const venueServices = services.filter(s => s.venue_id === currentVenue?.id);

  const handleAdd = () => {
    addService({
      ...newData,
      venue_id: currentVenue?.id || null,
      assigned_trainer_id: (newData as any).assigned_trainer_id || null
    } as any);
    setNewData({ name: '', duration: 60, price: 1000, is_group: false, venue_id: currentVenue?.id || '', assigned_trainer_id: '' });
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
    <div className="animate-fade-up max-w-[1000px] mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-t1">Услуги площадки</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-accent text-white text-[13px] font-bold px-5 py-2.5 rounded-xl hover:bg-accent-hover transition-all flex items-center gap-2"
        >
          <IconPlus size={18} stroke={2.5} /> Добавить услугу
        </button>
      </div>

      <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sh-sm">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-bg-custom border-b border-border">
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Название</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Мастер</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Длительность</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Стоимость</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest text-right"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
                {venueServices.map(service => {
                    const assignedStaff = venueStaff.find(st => st.trainer_id === (service as any).assigned_trainer_id);
                    return (
                        <tr key={service.id} className="group hover:bg-bg-custom transition-colors">
                            <td className="px-6 py-5">
                                <span className="text-[14px] font-bold text-t1">{service.name}</span>
                            </td>
                            <td className="px-6 py-5">
                                <span className="text-[13px] text-t2">
                                    {assignedStaff ? assignedStaff.trainer_name : 'Любой мастер'}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-[13px] font-medium text-t2">{service.duration} мин</td>
                            <td className="px-6 py-5 text-[14px] font-bold text-t1">{service.price} ₽</td>
                            <td className="px-6 py-5 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(service)} className="p-2 text-t3 hover:text-accent rounded-lg transition-all"><IconEdit size={16} /></button>
                                    <button onClick={() => removeService(service.id)} className="p-2 text-t3 hover:text-red-custom rounded-lg transition-all"><IconTrash size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
        {venueServices.length === 0 && (
            <div className="py-20 text-center text-t3 text-[13px] font-medium italic">Услуги на этой площадке еще не добавлены</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl w-full max-w-md shadow-2xl animate-fade-up overflow-hidden border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-t1 tracking-tight">{editingId ? 'Редактировать услугу' : 'Новая услуга'}</h2>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-t3 hover:text-t1 transition-colors"><IconX size={20} stroke={2} /></button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Название</label>
                <input
                  type="text"
                  value={editingId ? editData.name : newData.name}
                  onChange={e => editingId ? setEditData({...editData, name: e.target.value}) : setNewData({...newData, name: e.target.value})}
                  className="w-full input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Длительность (мин)</label>
                  <input
                    type="number"
                    value={editingId ? editData.duration : newData.duration}
                    onChange={e => editingId ? setEditData({...editData, duration: parseInt(e.target.value)}) : setNewData({...newData, duration: parseInt(e.target.value)})}
                    className="w-full input-modern"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Стоимость (₽)</label>
                  <input
                    type="number"
                    value={editingId ? editData.price : newData.price}
                    onChange={e => editingId ? setEditData({...editData, price: parseInt(e.target.value)}) : setNewData({...newData, price: parseInt(e.target.value)})}
                    className="w-full input-modern"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Назначенный мастер</label>
                <select
                  value={editingId ? ((editData as any).assigned_trainer_id || '') : newData.assigned_trainer_id}
                  onChange={e => editingId ? setEditData({...editData, assigned_trainer_id: e.target.value || null} as any) : setNewData({...newData, assigned_trainer_id: e.target.value})}
                  className="w-full input-modern appearance-none"
                >
                  <option value="">Любой мастер</option>
                  {venueStaff.map(st => (
                    <option key={st.id} value={st.trainer_id}>{st.trainer_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 bg-bg-custom border-t border-border flex gap-3">
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="flex-1 py-3 text-[13px] font-bold text-t3 hover:text-t1 transition-all">Отмена</button>
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex-1 py-3 text-[13px] font-bold text-white bg-accent hover:bg-accent-hover rounded-xl transition-all"
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
