import React, { useEffect, useState } from 'react';
import { createTag, deleteTag, fetchTags, updateTag } from '../services/api';

const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameAr, setEditNameAr] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags().then(setTags).catch(() => setTags([]));
  }, []);

  const onCreate = async () => {
    setError(null);
    if (!nameAr.trim() || !nameEn.trim()) {
      setError('Both Arabic and English names are required.');
      return;
    }
    const created = await createTag({ name_ar: nameAr.trim(), name_en: nameEn.trim() });
    setTags((prev) => [created, ...prev]);
    setNameAr('');
    setNameEn('');
  };

  const startEdit = (tag: any) => {
    setEditingId(tag.id);
    setEditNameAr(tag.name_ar || '');
    setEditNameEn(tag.name_en || '');
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNameAr('');
    setEditNameEn('');
  };

  const onSave = async (id: string) => {
    setError(null);
    if (!editNameAr.trim() || !editNameEn.trim()) {
      setError('Both Arabic and English names are required.');
      return;
    }
    setSavingId(id);
    try {
      const updated = await updateTag(id, { name_ar: editNameAr.trim(), name_en: editNameEn.trim() });
      setTags((prev) => prev.map((tag) => (tag.id === id ? updated : tag)));
      cancelEdit();
    } catch (e: any) {
      setError(e?.message || 'Failed to update tag.');
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (id: string) => {
    setError(null);
    if (!window.confirm('Delete this tag?')) return;
    setDeletingId(id);
    try {
      await deleteTag(id);
      setTags((prev) => prev.filter((tag) => tag.id !== id));
      if (editingId === id) cancelEdit();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete tag.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Tags</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <input className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm" placeholder="Name (AR)" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        <input className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm" placeholder="Name (EN)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        <button onClick={onCreate} className="bg-primary text-white px-4 py-2 rounded-lg text-sm">Add</button>
      </div>
      {error && <div className="text-xs text-red-300 mb-4">{error}</div>}
      <div className="space-y-3">
        {tags.map((tag) => (
          <div key={tag.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            {editingId === tag.id ? (
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  placeholder="Name (AR)"
                  value={editNameAr}
                  onChange={(e) => setEditNameAr(e.target.value)}
                />
                <input
                  className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  placeholder="Name (EN)"
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                />
                <button
                  onClick={() => onSave(tag.id)}
                  className="bg-primary text-white px-3 py-2 rounded-lg text-xs disabled:opacity-60"
                  disabled={savingId === tag.id}
                >
                  {savingId === tag.id ? 'Saving...' : 'Save'}
                </button>
                <button onClick={cancelEdit} className="bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-xs">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">{tag.name_en || tag.name_ar}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(tag)} className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-xs">
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(tag.id)}
                    className="bg-red-500/15 border border-red-400/30 text-red-200 px-3 py-1.5 rounded-lg text-xs disabled:opacity-60"
                    disabled={deletingId === tag.id}
                  >
                    {deletingId === tag.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagsPage;
