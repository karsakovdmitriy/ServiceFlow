'use client';

import React, { useState } from 'react';
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconMapPin, IconClock, IconCurrencyRubel, IconUsers, IconBarbell, IconDotsVertical } from '@tabler/icons-react';
import { useStore, Service, Venue } from '@/lib/store';

export default function ServicesPage() {
  const {
    services,
    venues,
    addService,
    updateService,
    removeService,
    addVenue,
    updateVenue,
    removeVenue
  } = useStore();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isAddingVenue, setIsAddingVenue] = useState(false);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);

  const [newData, setNewData] = useState({ name: '', duration: 60, price: 1000, is_group: false, venue_id: '' });
  const [editData, setEditData] = useState<Partial<Service>>({});

  const [newVenueData, setNewVenueData] = useState({ name: '', address: '' });
  const [editVenueData, setEditVenueData] = useState<Partial<Venue>>({});

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

  const handleAddVenue = () => {
    addVenue(newVenueData);
    setNewVenueData({ name: '', address: '' });
    setIsAddingVenue(false);
  };

  const handleUpdateVenue = () => {
    if (editingVenueId) {
        updateVenue(editingVenueId, editVenueData);
        setEditingVenueId(null);
    }
  };

  return (
    <div className="animate-fade-up max-w-[1000px] mx-auto space-y-16">
      <div className="flex items-center justify-between">
        <h2 className="text-[12px] font-bold text-t3 uppercase tracking-widest">ВАШИ УСЛУГИ</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="text-accent text-[13px] font-bold flex items-center gap-2 hover:underline"
        >
          <IconPlus size={18} stroke={2.5} /> Добавить услугу
        </button>
      </div>

      <div className="bg-transparent overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-border-light">
                    <th className="py-4 text-[10px] font-bold text-t3 uppercase tracking-widest opacity-50">Услуга</th>
                    <th className="py-4 text-[10px] font-bold text-t3 uppercase tracking-widest opacity-50 hidden md:table-cell">Тип</th>
                    <th className="py-4 text-[10px] font-bold text-t3 uppercase tracking-widest opacity-50">Длительность</th>
                    <th className="py-4 text-[10px] font-bold text-t3 uppercase tracking-widest opacity-50">Стоимость</th>
                    <th className="py-4 text-[10px] font-bold text-t3 uppercase tracking-widest opacity-50 w-10"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
                {services.map(service => (
                    <tr key={service.id} className="group hover:bg-bg-custom/50 transition-colors">
                        <td className="py-6 pr-4">
                            <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-t1 tracking-tight">{service.name}</span>
                                {service.venue && (
                                    <span className="text-[11px] text-t3 mt-1 flex items-center gap-1 font-medium opacity-60">
                                        <IconMapPin size={12} stroke={2} /> {service.venue.name}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="py-6 pr-4 hidden md:table-cell">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${service.is_group ? 'text-blue-custom' : 'text-t3 opacity-40'}`}>
                                {service.is_group ? 'Групповая' : 'Индивид.'}
                            </span>
                        </td>
                        <td className="py-6 pr-4 text-[13px] font-bold text-t2">
                            {service.duration} мин
                        </td>
                        <td className="py-6 pr-4 text-[15px] font-extrabold text-t1 tracking-tighter">
                            {service.price.toLocaleString()} ₽
                        </td>
                        <td className="py-6 text-right relative">
                            <div className="mgmt-icon">
                                <button
                                    onClick={() => {
                                        // Simplified context menu: toggle actions
                                        const confirmed = window.confirm(`Редактировать или удалить "${service.name}"?\n\nOK — Редактировать\nCancel — Удалить`);
                                        if (confirmed) startEdit(service);
                                        else if (window.confirm('Точно удалить?')) removeService(service.id);
                                    }}
                                    className="p-2 text-t3 hover:text-t1 transition-all"
                                >
                                    <IconDotsVertical size={20} stroke={1.5} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {services.length === 0 && (
            <div className="py-20 text-center text-t3 text-[13px] font-medium italic">
                Услуги еще не добавлены
            </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-12">
        <h2 className="text-[12px] font-bold text-t3 uppercase tracking-widest">ПЛОЩАДКИ</h2>
        <button
          onClick={() => setIsAddingVenue(true)}
          className="text-accent text-[13px] font-bold flex items-center gap-2 hover:underline"
        >
          <IconPlus size={18} stroke={2.5} /> Добавить площадку
        </button>
      </div>

      <div className="bg-transparent overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-border-light">
                    <th className="py-4 text-[10px] font-bold text-t3 uppercase tracking-widest opacity-50">Название</th>
                    <th className="py-4 text-[10px] font-bold text-t3 uppercase tracking-widest opacity-50">Адрес</th>
                    <th className="py-4 text-[10px] font-bold text-t3 uppercase tracking-widest opacity-50 w-10"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
                {venues.map(venue => (
                    <tr key={venue.id} className="group hover:bg-bg-custom/50 transition-colors">
                        <td className="py-6 pr-4">
                            <span className="text-[15px] font-bold text-t1 tracking-tight">{venue.name}</span>
                        </td>
                        <td className="py-6 pr-4 text-[13px] font-bold text-t2">
                            {venue.address || '—'}
                        </td>
                        <td className="py-6 text-right">
                            <div className="mgmt-icon">
                                <button
                                    onClick={() => {
                                        const confirmed = window.confirm(`Редактировать или удалить "${venue.name}"?\n\nOK — Редактировать\nCancel — Удалить`);
                                        if (confirmed) { setEditingVenueId(venue.id); setEditVenueData(venue); }
                                        else if (window.confirm('Точно удалить?')) removeVenue(venue.id);
                                    }}
                                    className="p-2 text-t3 hover:text-t1 transition-all"
                                >
                                    <IconDotsVertical size={20} stroke={1.5} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {venues.length === 0 && (
            <div className="py-20 text-center text-t3 text-[13px] font-medium italic">
                Площадки еще не добавлены
            </div>
        )}
      </div>

      {/* Add/Edit Service Modal - Full Viewport */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-surface rounded-[40px] w-full max-w-md animate-fade-up overflow-hidden border-none p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[18px] font-bold text-t1 tracking-tight">{editingId ? 'Редактировать услугу' : 'Новая услуга'}</h2>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-t3 hover:text-t1 transition-colors"><IconX size={24} stroke={2} /></button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold text-t3 uppercase tracking-widest block mb-1 opacity-60">Название</label>
                <input
                  type="text"
                  placeholder="Напр. Персональная тренировка"
                  value={editingId ? editData.name : newData.name}
                  onChange={e => editingId ? setEditData({...editData, name: e.target.value}) : setNewData({...newData, name: e.target.value})}
                  className="w-full input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-bold text-t3 uppercase tracking-widest block mb-1 opacity-60">Мин</label>
                  <input
                    type="number"
                    value={editingId ? editData.duration : newData.duration}
                    onChange={e => editingId ? setEditData({...editData, duration: parseInt(e.target.value)}) : setNewData({...newData, duration: parseInt(e.target.value)})}
                    className="w-full input-modern"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-t3 uppercase tracking-widest block mb-1 opacity-60">Цена</label>
                  <input
                    type="number"
                    value={editingId ? editData.price : newData.price}
                    onChange={e => editingId ? setEditData({...editData, price: parseInt(e.target.value)}) : setNewData({...newData, price: parseInt(e.target.value)})}
                    className="w-full input-modern"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-t3 uppercase tracking-widest block mb-1 opacity-60">Площадка</label>
                <select
                  value={editingId ? (editData.venue_id || '') : newData.venue_id}
                  onChange={e => editingId ? setEditData({...editData, venue_id: e.target.value || null}) : setNewData({...newData, venue_id: e.target.value})}
                  className="w-full input-modern appearance-none"
                >
                  <option value="">Без площадки</option>
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="mt-1">
                    <input
                        type="checkbox"
                        checked={editingId ? editData.is_group : newData.is_group}
                        onChange={e => editingId ? setEditData({...editData, is_group: e.target.checked}) : setNewData({...newData, is_group: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-200 text-accent focus:ring-0 transition-all"
                    />
                </div>
                <div>
                    <div className="text-[14px] font-bold text-t1 group-hover:text-accent transition-colors">Групповая тренировка</div>
                    <div className="text-[11px] text-t3 leading-relaxed mt-1 font-medium opacity-60">Доступно для нескольких клиентов одновременно.</div>
                </div>
              </label>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex-1 py-4 text-[14px] font-bold text-white bg-accent hover:bg-accent-hover rounded-2xl transition-all shadow-xl shadow-accent/20"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Venue Modal - Full Viewport */}
      {(isAddingVenue || editingVenueId) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-surface rounded-[40px] w-full max-w-md animate-fade-up overflow-hidden border-none p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[18px] font-bold text-t1 tracking-tight">{editingVenueId ? 'Редактировать площадку' : 'Новая площадка'}</h2>
              <button onClick={() => { setIsAddingVenue(false); setEditingVenueId(null); }} className="text-t3 hover:text-t1 transition-colors"><IconX size={24} stroke={2} /></button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold text-t3 uppercase tracking-widest block mb-1 opacity-60">Название</label>
                <input
                  type="text"
                  placeholder="Напр. Фитнес-клуб Олимп"
                  value={editingVenueId ? editVenueData.name : newVenueData.name}
                  onChange={e => editingVenueId ? setEditVenueData({...editVenueData, name: e.target.value}) : setNewVenueData({...newVenueData, name: e.target.value})}
                  className="w-full input-modern"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-t3 uppercase tracking-widest block mb-1 opacity-60">Адрес</label>
                <input
                  type="text"
                  placeholder="Улица, дом, офис"
                  value={editingVenueId ? editVenueData.address : newVenueData.address}
                  onChange={e => editingVenueId ? setEditVenueData({...editVenueData, address: e.target.value}) : setNewVenueData({...newVenueData, address: e.target.value})}
                  className="w-full input-modern"
                />
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={editingVenueId ? handleUpdateVenue : handleAddVenue}
                className="flex-1 py-4 text-[14px] font-bold text-white bg-accent hover:bg-accent-hover rounded-2xl transition-all shadow-xl shadow-accent/20"
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
