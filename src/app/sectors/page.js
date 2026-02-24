'use client';

import { useEffect, useState } from 'react';

export default function SectorsPage() {
    const [sectors, setSectors]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName]   = useState('');
    const [saving, setSaving]       = useState(false);
    const [error, setError]         = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch('/api/sectors')
            .then(r => r.json())
            .then(d => setSectors(d.sectors || []))
            .catch(() => setError('Failed to load sectors'))
            .finally(() => setLoading(false));
    }, []);

    const startEdit  = (sector) => { setEditingId(sector.id); setEditName(sector.name); setError(null); };
    const cancelEdit = () => { setEditingId(null); setEditName(''); setError(null); };

    const saveEdit = async () => {
        if (!editingId || !editName.trim()) { setError('Sector name cannot be empty'); return; }
        setSaving(true);
        setError(null);
        try {
            const res  = await fetch('/api/sectors', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingId, name: editName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to update sector'); return; }
            setSectors(prev => prev.map(s => s.id === data.sector.id ? { ...s, name: data.sector.name } : s));
            setEditingId(null);
            setEditName('');
        } catch {
            setError('Failed to update sector');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Sectors</h1>
                    <p className="text-secondary">View and edit the food sectors used across the directory.</p>
                </div>

                <div className="glass-card p-6">
                    {error && (
                        <div className="alert-error text-sm px-3 py-2 mb-4">{error}</div>
                    )}

                    {loading ? (
                        <div className="text-center py-8 text-secondary">Loading sectors…</div>
                    ) : sectors.length === 0 ? (
                        <div className="text-center py-8 text-secondary">No sectors found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b glass-divider">
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted uppercase tracking-wider">ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-muted uppercase tracking-wider">HS Code</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                    {sectors.map(sector => (
                                        <tr key={sector.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-sm text-muted">{sector.id}</td>
                                            <td className="px-4 py-3 text-sm text-white">
                                                {editingId === sector.id ? (
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="glass-input w-full px-2 py-1 text-sm"
                                                    />
                                                ) : sector.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-secondary">{sector.hsCode || '—'}</td>
                                            <td className="px-4 py-3 text-sm text-right">
                                                {editingId === sector.id ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="btn-outline px-3 py-1 text-xs"
                                                            disabled={saving}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={saveEdit}
                                                            className="btn-primary px-3 py-1 text-xs"
                                                            disabled={saving}
                                                        >
                                                            {saving ? 'Saving…' : 'Save'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(sector)}
                                                        className="btn-outline px-3 py-1 text-xs"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
