'use client';

import React, { useState } from 'react';
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconMapPin } from '@tabler/icons-react';
import { useStore, Venue } from '@/lib/store';

export default function VenuesPage() {
  const { venues, addVenue, updateVenue, removeVenue } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [newData, setNewData] = useState({ name: '', address: '' });
  const [editData, setEditData] = useState<Partial<Venue>>({});

  const handleAdd = () => {
    if (newData.name.trim()) {
      addVenue(newData as any);
      setNewData({ name: '', address: '' });
      setIsAdding(false);
    }
  };

  const startEdit = (venue: Venue) => {
    setEditingId(venue.id);
    setEditData(venue);
  };

  const handleUpdate = () => {
    if (editingId && editData.name?.trim()) {
      updateVenue(editingId, editData);
      setEditingId(null);
    }
  };

  return (
    <div className="animate-fade-up max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[10.5px] font-semibold text-t3 uppercase tracking-[0.08em]">Ваши площадки</div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-accent text-white text-[13px] font-semibold px-4 py-2 rounded-r-sm hover:bg-accent-hover transition-all flex items-center gap-2"
        >
          <IconPlus size={16} /> Добавить площадку
        </button>
      </div>

      <div className="grid gap-4">
        {isAdding && (
          <div className="card border-2 border-accent/20 bg-accent/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[11px] text-t3 block mb-1">Название</label>
                <input
                  type="text"
                  value={newData.name}
                  onChange={e => setNewData({...newData, name: e.target.value})}
                  placeholder="Напр. Фитнес-клуб 'Олимп'"
                  className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-[11px] text-t3 block mb-1">Адрес</label>
                <input
                  type="text"
                  value={newData.address}
                  onChange={e => setNewData({...newData, address: e.target.value})}
                  placeholder="Напр. ул. Ленина, 15"
                  className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAdding(false)} className="text-[13px] px-4 py-2 text-t3 hover:text-t1 transition-colors">Отмена</button>
              <button onClick={handleAdd} className="bg-accent text-white text-[13px] font-semibold px-6 py-2 rounded-r-sm">Сохранить</button>
            </div>
          </div>
        )}

        {venues.map(venue => (
          <div key={venue.id} className="card group">
            {editingId === venue.id ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={e => setEditData({...editData, name: e.target.value})}
                    className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editData.address}
                    onChange={e => setEditData({...editData, address: e.target.value})}
                    className="w-full text-[13px] border border-border-custom rounded-r-sm p-2 bg-surface outline-none focus:border-accent"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="p-2 text-t3 hover:bg-bg-custom rounded-r-sm flex items-center gap-1 text-[13px]">
                       <IconX size={18} /> <span className="sm:hidden">Отмена</span>
                    </button>
                    <button onClick={handleUpdate} className="p-2 text-green-custom hover:bg-green-custom/10 rounded-r-sm flex items-center gap-1 text-[13px]">
                       <IconCheck size={18} /> <span className="sm:hidden">Сохранить</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-accent/5 text-accent rounded-lg">
                    <IconMapPin size={20} />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-t1">{venue.name}</div>
                    <div className="text-[12px] text-t3 mt-0.5">{venue.address || 'Адрес не указан'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(venue)}
                    className="p-2 text-t3 hover:text-accent hover:bg-accent/5 rounded-r-sm transition-all"
                  >
                    <IconEdit size={18} />
                  </button>
                  <button
                    onClick={() => removeVenue(venue.id)}
                    className="p-2 text-t3 hover:text-red-custom hover:bg-red-custom/5 rounded-r-sm transition-all"
                  >
                    <IconTrash size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {venues.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-bg-custom/50 rounded-xl border border-dashed border-border-custom">
            <IconMapPin size={48} className="mx-auto text-t3 opacity-20 mb-3" />
            <div className="text-t2 font-medium">У вас пока нет площадок</div>
            <div className="text-[13px] text-t3 mt-1">Добавьте места, где вы проводите тренировки</div>
          </div>
        )}
      </div>
    </div>
  );
}
