import React, { useEffect, useMemo, useState } from 'react';
import { DynamicIcon, iconNames } from 'lucide-react/dynamic';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../services/api';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [icon, setIcon] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameAr, setEditNameAr] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const onCreate = async () => {
    setError(null);
    if (!nameAr.trim() || !nameEn.trim()) {
      setError('Both Arabic and English names are required.');
      return;
    }
    setSaving(true);
    try {
      const created = await createCategory({
        name_ar: nameAr.trim(),
        name_en: nameEn.trim(),
        icon: icon.trim() || null
      });
      setCategories((prev) => [created, ...prev]);
      setNameAr('');
      setNameEn('');
      setIcon('');
    } catch (e: any) {
      setError(e?.message || 'Failed to add category.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditNameAr(cat.name_ar || '');
    setEditNameEn(cat.name_en || '');
    setEditIcon(cat.icon || '');
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNameAr('');
    setEditNameEn('');
    setEditIcon('');
  };

  const onSave = async (id: string) => {
    setError(null);
    if (!editNameAr.trim() || !editNameEn.trim()) {
      setError('Both Arabic and English names are required.');
      return;
    }
    setSavingId(id);
    try {
      const updated = await updateCategory(id, {
        name_ar: editNameAr.trim(),
        name_en: editNameEn.trim(),
        icon: editIcon.trim() || null
      });
      setCategories((prev) => prev.map((cat) => (cat.id === id ? updated : cat)));
      cancelEdit();
    } catch (e: any) {
      setError(e?.message || 'Failed to update category.');
    } finally {
      setSavingId(null);
    }
  };

  const onDelete = async (id: string) => {
    setError(null);
    if (!window.confirm('Delete this category? Posts using it will be uncategorized.')) return;
    setDeletingId(id);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      if (editingId === id) cancelEdit();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete category.');
    } finally {
      setDeletingId(null);
    }
  };

  const iconSet = useMemo(() => new Set(iconNames), []);
  const normalizeIconName = (value?: string | null) => {
    const raw = (value || '').trim();
    if (!raw) return null;
    const cleaned = raw
      .replace(/^Lucide/i, '')
      .replace(/Icon$/i, '')
      .replace(/[_\s]+/g, '-')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase();
    return cleaned;
  };
  const resolveIconName = (value?: string | null) => {
    const name = normalizeIconName(value);
    if (!name) return null;
    if (iconSet.has(name)) return name;
    return null;
  };

  const renderIcon = (value?: string | null) => {
    if (!value) return <DynamicIcon name="folder" className="w-5 h-5" fallback={() => null} />;
    if (value.startsWith('http') || value.startsWith('/')) {
      return <img src={value} alt="" className="w-5 h-5 object-contain" />;
    }
    const resolved = resolveIconName(value);
    if (resolved) return <DynamicIcon name={resolved} className="w-5 h-5" fallback={() => null} />;
    return <DynamicIcon name="folder" className="w-5 h-5" fallback={() => null} />;
  };

  const iconHint = useMemo(() => {
    const match = (icon || '').trim();
    if (!match) return 'Lucide icon name (e.g. utensils) or image URL';
    const resolved = resolveIconName(match);
    if (resolved) return `Lucide icon: ${resolved}`;
    if (match.startsWith('http') || match.startsWith('/')) return 'Image URL';
    return 'Unknown icon name';
  }, [icon, iconSet]);

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Categories</h1>
      <div className="flex flex-wrap gap-3 mb-3">
        <input className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm" placeholder="Name (AR)" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
        <input className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm" placeholder="Name (EN)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
        <div className="flex items-center gap-2">
          <input
            className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm"
            placeholder="Icon (e.g. utensils) or URL"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />
          <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
            {renderIcon(icon)}
          </div>
        </div>
        <span className="text-xs text-gray-300 self-center">
          {iconHint} ·{' '}
          <a
            href="https://lucide.dev/icons"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-white"
          >
            Browse icons
          </a>
        </span>
        <button
          onClick={onCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60"
          disabled={saving}
        >
          {saving ? 'Adding...' : 'Add'}
        </button>
      </div>
      {error && <div className="text-xs text-red-300 mb-4">{error}</div>}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
            {editingId === cat.id ? (
              <div className="w-full flex flex-wrap items-center gap-2">
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
                <input
                  className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  placeholder="Icon (e.g. utensils) or URL"
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                />
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                  {renderIcon(editIcon)}
                </div>
                <button
                  onClick={() => onSave(cat.id)}
                  className="bg-primary text-white px-3 py-2 rounded-lg text-xs disabled:opacity-60"
                  disabled={savingId === cat.id}
                >
                  {savingId === cat.id ? 'Saving...' : 'Save'}
                </button>
                <button onClick={cancelEdit} className="bg-white/10 border border-white/10 px-3 py-2 rounded-lg text-xs">
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                  {renderIcon(cat.icon)}
                </div>
                <div className="text-sm font-semibold flex-1">{cat.name_en || cat.name_ar}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(cat)} className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-xs">
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(cat.id)}
                    className="bg-red-500/15 border border-red-400/30 text-red-200 px-3 py-1.5 rounded-lg text-xs disabled:opacity-60"
                    disabled={deletingId === cat.id}
                  >
                    {deletingId === cat.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
