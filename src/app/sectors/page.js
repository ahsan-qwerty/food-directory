'use client';

import { useEffect, useState } from 'react';

export default function SectorsPage() {
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchSectors() {
            setLoading(true);
            try {
                const res = await fetch('/api/sectors');
                const data = await res.json();
                setSectors(data.sectors || []);
            } catch (err) {
                console.error('Error fetching sectors:', err);
                setError('Failed to load sectors');
            } finally {
                setLoading(false);
            }
        }

        fetchSectors();
    }, []);

    const startEdit = (sector) => {
        setEditingId(sector.id);
        setEditName(sector.name);
        setError(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setError(null);
    };

    const saveEdit = async () => {
        if (!editingId || !editName.trim()) {
            setError('Sector name cannot be empty');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const res = await fetch('/api/sectors', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: editingId, name: editName.trim() }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to update sector');
                return;
            }

            const updated = data.sector;
            setSectors((prev) =>
                prev.map((s) => (s.id === updated.id ? { ...s, name: updated.name } : s))
            );
            setEditingId(null);
            setEditName('');
        } catch (err) {
            console.error('Error updating sector:', err);
            setError('Failed to update sector');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4">
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        Sectors
                    </h1>
                    <p className="text-gray-600">
                        View and edit the food sectors used across the directory.
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    {error && (
                        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8 text-gray-600">Loading sectors...</div>
                    ) : sectors.length === 0 ? (
                        <div className="text-center py-8 text-gray-600">No sectors found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            HS Code
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sectors.map((sector) => (
                                        <tr key={sector.id}>
                                            <td className="px-4 py-2 text-sm text-gray-500">{sector.id}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {editingId === sector.id ? (
                                                    <input
                                                        type="text"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                ) : (
                                                    sector.name
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-500">
                                                {sector.hsCode || '—'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-right">
                                                {editingId === sector.id ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                                            disabled={saving}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={saveEdit}
                                                            className="px-3 py-1 text-xs bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-60"
                                                            disabled={saving}
                                                        >
                                                            {saving ? 'Saving...' : 'Save'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(sector)}
                                                        className="px-3 py-1 text-xs bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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
