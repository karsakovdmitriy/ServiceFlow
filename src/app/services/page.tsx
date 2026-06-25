'use client';

import React, { useState } from 'react';
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconMapPin, IconClock, IconCurrencyRubel, IconUsers, IconBarbell, IconDotsVertical } from '@tabler/icons-react';
import { useStore, Service, Venue } from '@/lib/store';
import PortalModal from '@/components/PortalModal';

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

  const [newData, setNewData] = useState({ name: '', duration: 60, price: 1000, is_group: false, venue_id: '', moyklass_class_id: '', moyklass_room_id: '' });
  const [editData, setEditData] = useState<Partial<Service>>({});

  const [newVenueData, setNewVenueData] = useState({ name: '', address: '' });
  const [editVenueData, setEditVenueData] = useState<Partial<Venue>>({});

  const handleAdd = () => {
    addService({
      ...newData,
      venue_id: newData.venue_id || null,
      moyklass_class_id: newData.moyklass_class_id ? parseInt(newData.moyklass_class_id) : undefined,
      moyklass_room_id: newData.moyklass_room_id ? parseInt(newData.moyklass_room_id) : undefined
    } as any);
    setNewData({ name: '', duration: 60, price: 1000, is_group: false, venue_id: '', moyklass_class_id: '', moyklass_room_id: '' });
    setIsAdding(false);
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditData({
        ...service,
        moyklass_class_id: service.moyklass_class_id ? (service.moyklass_class_id as any) : '',
        moyklass_room_id: service.moyklass_room_id ? (service.moyklass_room_id as any) : ''
    });
  };

  const handleUpdate = () => {
    if (editingId) {
      const formattedData = {
          ...editData,
          moyklass_class_id: editData.moyklass_class_id ? parseInt(editData.moyklass_class_id as any) : undefined,
          moyklass_room_id: editData.moyklass_room_id ? parseInt(editData.moyklass_room_id as any) : undefined
      };
      updateService(editingId, formattedData);
      setEditingId(null);
    }
  };

  const handleAddVenue = () => {
    addVenue(newVenueData as any);
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
    <div className="animate-fade-up max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-[14px] font-bold text-t1 uppercase tracking-wider">Услуги и площадки</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-accent text-white text-[13px] font-bold px-5 py-2.5 rounded-xl hover:bg-accent-hover transition-all flex items-center gap-2 shadow-lg shadow-accent/10 active:scale-95"
        >
          <IconPlus size={18} stroke={2.5} /> <span className="hidden sm:inline">Добавить услугу</span>
        </button>
      </div>

      {/* Services List - Desktop Table */}
      <div className="hidden md:block bg-surface rounded-3xl border border-border overflow-hidden shadow-sh-sm">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-bg-custom border-b border-border">
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Услуга</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest hidden md:table-cell">Тип</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Длительность</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Стоимость</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
                {services.map(service => (
                    <tr key={service.id} className="group hover:bg-bg-custom transition-colors">
                        <td className="px-6 py-5">
                            <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-t1">{service.name}</span>
                                {service.venue && (
                                    <span className="text-[11px] text-t3 mt-1 flex items-center gap-1">
                                        <IconMapPin size={12} stroke={2} /> {service.venue.name}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${service.is_group ? 'bg-blue-custom/10 text-blue-custom' : 'bg-bg-custom text-t3 border border-border'}`}>
                                {service.is_group ? 'Групповая' : 'Индивид.'}
                            </span>
                        </td>
                        <td className="px-6 py-5 text-[13px] font-medium text-t2">
                            {service.duration} мин
                        </td>
                        <td className="px-6 py-5 text-[14px] font-bold text-t1">
                            {service.price} ₽
                        </td>
                        <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => startEdit(service)}
                                    className="p-2 text-t3 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                                >
                                    <IconEdit size={16} stroke={1.5} />
                                </button>
                                <button
                                    onClick={() => removeService(service.id)}
                                    className="p-2 text-t3 hover:text-red-custom hover:bg-red-custom/10 rounded-lg transition-all"
                                >
                                    <IconTrash size={16} stroke={1.5} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Services List - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {services.map(service => (
          <div key={service.id} className="bg-surface p-5 rounded-2xl border border-border shadow-sh-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[15px] font-bold text-t1">{service.name}</div>
                {service.venue && (
                  <div className="text-[11px] text-t3 mt-1 flex items-center gap-1">
                    <IconMapPin size={12} stroke={2} /> {service.venue.name}
                  </div>
                )}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${service.is_group ? 'bg-blue-custom/10 text-blue-custom' : 'bg-bg-custom text-t3 border border-border'}`}>
                {service.is_group ? 'Групповая' : 'Индивид.'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-4">
                <span className="text-t2 font-medium">{service.duration} мин</span>
                <span className="text-t1 font-bold">{service.price} ₽</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(service)}
                  className="w-8 h-8 flex items-center justify-center bg-bg-custom text-t3 rounded-lg hover:text-accent"
                >
                  <IconEdit size={16} />
                </button>
                <button
                  onClick={() => removeService(service.id)}
                  className="w-8 h-8 flex items-center justify-center bg-bg-custom text-t3 rounded-lg hover:text-red-custom"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
        {services.length === 0 && (
            <div className="py-20 text-center text-t3 text-[13px] font-medium italic">
                Услуги еще не добавлены
            </div>
        )}

      <div className="flex items-center justify-between mt-20 mb-10">
        <h1 className="text-[14px] font-bold text-t1 uppercase tracking-wider">Площадки</h1>
        <button
          onClick={() => setIsAddingVenue(true)}
          className="bg-bg-custom text-t1 border border-border text-[13px] font-bold px-5 py-2.5 rounded-xl hover:bg-surface transition-all flex items-center gap-2 shadow-sh-sm active:scale-95"
        >
          <IconPlus size={18} stroke={2.5} /> <span className="hidden sm:inline">Добавить площадку</span>
        </button>
      </div>

      {/* Venues List - Desktop Table */}
      <div className="hidden md:block bg-surface rounded-3xl border border-border overflow-hidden shadow-sh-sm">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-bg-custom border-b border-border">
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Название</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest">Адрес</th>
                    <th className="px-6 py-4 text-[11px] font-bold text-t3 uppercase tracking-widest"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
                {venues.map(venue => (
                    <tr key={venue.id} className="group hover:bg-bg-custom transition-colors">
                        <td className="px-6 py-5">
                            <span className="text-[14px] font-bold text-t1">{venue.name}</span>
                        </td>
                        <td className="px-6 py-5 text-[13px] font-medium text-t2">
                            {venue.address || '—'}
                        </td>
                        <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { setEditingVenueId(venue.id); setEditVenueData(venue); }}
                                    className="p-2 text-t3 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                                >
                                    <IconEdit size={16} stroke={1.5} />
                                </button>
                                <button
                                    onClick={() => removeVenue(venue.id)}
                                    className="p-2 text-t3 hover:text-red-custom hover:bg-red-custom/10 rounded-lg transition-all"
                                >
                                    <IconTrash size={16} stroke={1.5} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Venues List - Mobile Cards */}
      <div className="md:hidden space-y-4">
        {venues.map(venue => (
          <div key={venue.id} className="bg-surface p-5 rounded-2xl border border-border shadow-sh-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[15px] font-bold text-t1">{venue.name}</div>
                <div className="text-[12px] text-t3 mt-1 flex items-center gap-1">
                  <IconMapPin size={12} stroke={2} /> {venue.address || 'Адрес не указан'}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingVenueId(venue.id); setEditVenueData(venue); }}
                  className="w-8 h-8 flex items-center justify-center bg-bg-custom text-t3 rounded-lg"
                >
                  <IconEdit size={16} />
                </button>
                <button
                  onClick={() => removeVenue(venue.id)}
                  className="w-8 h-8 flex items-center justify-center bg-bg-custom text-t3 rounded-lg"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
        {venues.length === 0 && (
            <div className="py-20 text-center text-t3 text-[13px] font-medium italic">
                Площадки еще не добавлены
            </div>
        )}

      {/* Add/Edit Service Modal */}
      <PortalModal isOpen={isAdding || !!editingId} onClose={() => { setIsAdding(false); setEditingId(null); }}>
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
                  placeholder="Напр. Персональная консультация"
                  value={editingId ? editData.name : newData.name}
                  onChange={e => editingId ? setEditData({...editData, name: e.target.value}) : setNewData({...newData, name: e.target.value})}
                  className="w-full input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Длительность</label>
                  <input
                    type="number"
                    value={editingId ? editData.duration : newData.duration}
                    onChange={e => editingId ? setEditData({...editData, duration: parseInt(e.target.value)}) : setNewData({...newData, duration: parseInt(e.target.value)})}
                    className="w-full input-modern"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Стоимость</label>
                  <input
                    type="number"
                    value={editingId ? editData.price : newData.price}
                    onChange={e => editingId ? setEditData({...editData, price: parseInt(e.target.value)}) : setNewData({...newData, price: parseInt(e.target.value)})}
                    className="w-full input-modern"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">ID Группы (MK)</label>
                  <input
                    type="number"
                    placeholder="Class ID"
                    value={editingId ? editData.moyklass_class_id : newData.moyklass_class_id}
                    onChange={e => editingId ? setEditData({...editData, moyklass_class_id: e.target.value as any}) : setNewData({...newData, moyklass_class_id: e.target.value})}
                    className="w-full input-modern"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">ID Аудитории (MK)</label>
                  <input
                    type="number"
                    placeholder="Room ID"
                    value={editingId ? editData.moyklass_room_id : newData.moyklass_room_id}
                    onChange={e => editingId ? setEditData({...editData, moyklass_room_id: e.target.value as any}) : setNewData({...newData, moyklass_room_id: e.target.value})}
                    className="w-full input-modern"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Площадка</label>
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

              <label className="flex items-start gap-3 p-4 bg-bg-custom/50 rounded-2xl cursor-pointer hover:bg-bg-custom transition-all group">
                <div className="mt-1">
                    <input
                        type="checkbox"
                        checked={editingId ? editData.is_group : newData.is_group}
                        onChange={e => editingId ? setEditData({...editData, is_group: e.target.checked}) : setNewData({...newData, is_group: e.target.checked})}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent/20 transition-all"
                    />
                </div>
                <div>
                    <div className="text-[13.5px] font-bold text-t1 group-hover:text-accent transition-colors">Групповая услуга</div>
                    <div className="text-[11px] text-t3 leading-relaxed mt-0.5">Позволяет нескольким клиентам записаться на один и тот же временной слот.</div>
                </div>
              </label>
            </div>

            <div className="p-6 bg-bg-custom border-t border-border flex gap-3">
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="flex-1 py-3 text-[13px] font-bold text-t3 hover:text-t1 transition-all">Отмена</button>
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex-1 py-3 text-[13px] font-bold text-white bg-accent hover:bg-accent-hover rounded-xl transition-all shadow-sh-md"
              >
                Сохранить
              </button>
            </div>
          </div>
      </PortalModal>

      {/* Add/Edit Venue Modal */}
      <PortalModal isOpen={isAddingVenue || !!editingVenueId} onClose={() => { setIsAddingVenue(false); setEditingVenueId(null); }}>
          <div className="bg-surface rounded-3xl w-full max-w-md shadow-2xl animate-fade-up overflow-hidden border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-t1 tracking-tight">{editingVenueId ? 'Редактировать площадку' : 'Новая площадка'}</h2>
              <button onClick={() => { setIsAddingVenue(false); setEditingVenueId(null); }} className="text-t3 hover:text-t1 transition-colors"><IconX size={20} stroke={2} /></button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Название</label>
                <input
                  type="text"
                  placeholder="Напр. Фитнес-клуб Олимп"
                  value={editingVenueId ? editVenueData.name : newVenueData.name}
                  onChange={e => editingVenueId ? setEditVenueData({...editVenueData, name: e.target.value}) : setNewVenueData({...newVenueData, name: e.target.value})}
                  className="w-full input-modern"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-t3 uppercase tracking-widest block mb-2">Адрес</label>
                <input
                  type="text"
                  placeholder="Улица, дом, офис"
                  value={editingVenueId ? editVenueData.address : newVenueData.address}
                  onChange={e => editingVenueId ? setEditVenueData({...editVenueData, address: e.target.value}) : setNewVenueData({...newVenueData, address: e.target.value})}
                  className="w-full input-modern"
                />
              </div>
            </div>

            <div className="p-6 bg-bg-custom border-t border-border flex gap-3">
              <button onClick={() => { setIsAddingVenue(false); setEditingVenueId(null); }} className="flex-1 py-3 text-[13px] font-bold text-t3 hover:text-t1 transition-all">Отмена</button>
              <button
                onClick={editingVenueId ? handleUpdateVenue : handleAddVenue}
                className="flex-1 py-3 text-[13px] font-bold text-white bg-accent hover:bg-accent-hover rounded-xl transition-all shadow-sh-md"
              >
                Сохранить
              </button>
            </div>
          </div>
      </PortalModal>
    </div>
  );
}
