'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const COUNTRY_CITIES = {
    Australia: ['Adelaide', 'Brisbane', 'Melbourne', 'Perth', 'Sydney'],
    Bangladesh: ['Chittagong', 'Dhaka'],
    Brazil: ['Brasília', 'Rio de Janeiro', 'São Paulo'],
    Canada: ['Calgary', 'Montreal', 'Ottawa', 'Toronto', 'Vancouver'],
    China: ['Beijing', 'Chengdu', 'Guangzhou', 'Shanghai', 'Shenzhen', 'Qingdao'],
    Egypt: ['Alexandria', 'Cairo'],
    France: ['Lyon', 'Marseille', 'Nice', 'Paris'],
    Germany: ['Berlin', 'Cologne', 'Düsseldorf', 'Frankfurt', 'Hamburg', 'Munich'],
    Japan: ['Nagoya', 'Osaka', 'Tokyo', 'Yokohama'],
    Lebanon: ['Beirut', 'Tripoli'],
    Malaysia: ['Johor Bahru', 'Kuala Lumpur', 'Penang'],
    Morocco: ['Casablanca', 'Marrakech', 'Rabat'],
    Oman: ['Muscat', 'Salalah'],
    Philippines: ['Cebu', 'Davao', 'Manila'],
    Qatar: ['Al Wakrah', 'Doha'],
    'Saudi Arabia': ['Dammam', 'Jeddah', 'Mecca', 'Medina', 'Riyadh'],
    'South Africa': ['Cape Town', 'Durban', 'Johannesburg', 'Pretoria'],
    'South Korea': ['Busan', 'Incheon', 'Seoul'],
    'Sri Lanka': ['Colombo', 'Kandy'],
    'United Arab Emirates': ['Abu Dhabi', 'Dubai', 'Sharjah'],
    'United Kingdom': ['Birmingham', 'Edinburgh', 'London', 'Manchester'],
    'United States': ['Chicago', 'Dallas', 'Houston', 'Los Angeles', 'New York', 'San Francisco', 'Las Vegas'],
    'Kenya': ['Nairobi'],
    'Spain': ['Barcelona', 'Madrid', 'Valencia'],
    'Uzbekistan': ['Tashkent'],
};

const COUNTRY_OPTIONS = Object.keys(COUNTRY_CITIES).sort();

const labelCls = 'block text-sm font-medium text-secondary mb-2';
const subLabelCls = 'block text-xs font-medium text-muted mb-1';
const inputCls = 'glass-input w-full px-3 py-2';

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params?.id;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [sectors, setSectors] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        deskOfficer: '',
        startDate: '',
        endDate: '',
        region: '',
        country: '',
        city: '',
        sectorIds: [],
        tdapCost: '',
        exhibitorCost: '',
        totalEstimatedBudget: '',
        recommendedByJustification: '',
        description: '',
    });

    const countryOptions = Array.from(
        new Set([...(formData.country ? [formData.country] : []), ...COUNTRY_OPTIONS].filter(Boolean))
    ).sort();

    const cityOptions = formData.country
        ? Array.from(new Set([
            ...(COUNTRY_CITIES[formData.country] || []),
            ...(formData.city ? [formData.city] : []),
        ]))
        : [];

    // Load sectors list
    useEffect(() => {
        fetch('/api/sectors')
            .then((r) => r.json())
            .then((data) => setSectors(data.sectors || []))
            .catch(() => { });
    }, []);

    // Load existing event data
    useEffect(() => {
        async function fetchEvent() {
            if (!eventId) return;
            try {
                const res = await fetch(`/api/events?id=${eventId}`);
                const data = await res.json();
                if (!res.ok) {
                    setError(data.error || 'Failed to load event');
                    return;
                }
                const toDateInput = (v) => {
                    if (!v) return '';
                    const d = new Date(v);
                    if (Number.isNaN(d.getTime())) return '';
                    return d.toISOString().slice(0, 10);
                };
                setFormData({
                    name: data.name || '',
                    deskOfficer: data.deskOfficer || '',
                    startDate: toDateInput(data.startDate || data.eventDate),
                    endDate: toDateInput(data.endDate),
                    region: data.region || '',
                    country: data.country || '',
                    city: data.city || '',
                    // Prefer junction-table IDs; fall back to empty
                    sectorIds: Array.isArray(data.sectorIds) ? data.sectorIds : [],
                    tdapCost: data.tdapCost != null ? String(data.tdapCost) : '',
                    exhibitorCost: data.exhibitorCost != null ? String(data.exhibitorCost) : '',
                    totalEstimatedBudget: data.totalEstimatedBudget != null ? String(data.totalEstimatedBudget) : '',
                    recommendedByJustification: data.recommendedByJustification || '',
                    description: data.description || '',
                });
            } catch (err) {
                console.error('Error fetching event:', err);
                setError('Failed to load event');
            } finally {
                setLoading(false);
            }
        }
        fetchEvent();
    }, [eventId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'country' ? { city: '' } : {}),
        }));
    };

    const toggleSector = (id) => {
        setFormData((prev) => ({
            ...prev,
            sectorIds: prev.sectorIds.includes(id)
                ? prev.sectorIds.filter((s) => s !== id)
                : [...prev.sectorIds, id],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const payload = {
                id: parseInt(eventId),
                name: formData.name,
                deskOfficer: formData.deskOfficer || null,
                eventDate: formData.startDate || null,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
                region: formData.region || null,
                country: formData.country || null,
                city: formData.city || null,
                sectorIds: formData.sectorIds,
                tdapCost: formData.tdapCost || null,
                exhibitorCost: formData.exhibitorCost || null,
                totalEstimatedBudget: formData.totalEstimatedBudget || null,
                recommendedByJustification: formData.recommendedByJustification || null,
                description: formData.description || null,
            };
            const res = await fetch('/api/events', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to update event');
                return;
            }
            setSuccess('Event updated successfully! Redirecting...');
            setTimeout(() => {
                router.push(`/events/${eventId}`);
            }, 1500);
        } catch (err) {
            console.error('Error updating event:', err);
            setError('Failed to update event');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-wrapper flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 glass-spinner"></div>
                    <p className="mt-4 text-secondary">Loading event...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        Edit Exhibition / Event
                    </h1>
                    <p className="text-secondary">Update Excel planning fields</p>
                </div>

                <div className="glass-card p-6 md:p-8">
                    {error && (
                        <div className="mb-6 alert-error px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 alert-success px-4 py-3 text-sm">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className={labelCls}>
                                Exhibition Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={inputCls}
                                placeholder="e.g., Gulfood 2024, Food & Hospitality Expo"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Desk Officer</label>
                            <input
                                type="text"
                                name="deskOfficer"
                                value={formData.deskOfficer}
                                onChange={handleChange}
                                className={inputCls}
                                placeholder="e.g., Mr. Ahmed"
                            />
                        </div>

                        <div>
                            <label className={labelCls}>
                                Dates <span className="text-red-400">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={subLabelCls}>Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className={inputCls}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={subLabelCls}>End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelCls}>Region</label>
                                <input
                                    type="text"
                                    name="region"
                                    value={formData.region}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g., Oceania"
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Country</label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className={inputCls}
                                >
                                    <option value="">Select Country</option>
                                    {countryOptions.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>City</label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    disabled={!formData.country}
                                    className={inputCls}
                                >
                                    <option value="">{formData.country ? 'Select City' : 'Select country first'}</option>
                                    {cityOptions.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Sector / Products – multi-select pills */}
                        <div>
                            <label className={labelCls}>
                                Sector / Products
                                {formData.sectorIds.length > 0 && (
                                    <span className="ml-2 text-xs font-normal text-accent-green">
                                        ({formData.sectorIds.length} selected)
                                    </span>
                                )}
                            </label>
                            {sectors.length === 0 ? (
                                <p className="text-sm text-muted">Loading sectors…</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {sectors.map((s) => {
                                        const selected = formData.sectorIds.includes(s.id);
                                        return (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => toggleSector(s.id)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${selected
                                                    ? 'bg-green-700 text-white border-green-700'
                                                    : 'bg-white/10 text-secondary border-white/20 hover:border-green-500 hover:text-white'
                                                    }`}
                                            >
                                                {selected && <span className="mr-1">✓</span>}
                                                {s.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelCls}>TDAP Cost (Rs.)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="tdapCost"
                                    value={formData.tdapCost}
                                    onChange={handleChange}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Participation Fee (Rs.)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="exhibitorCost"
                                    value={formData.exhibitorCost}
                                    onChange={handleChange}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Total Estimated Budget (Rs.)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="totalEstimatedBudget"
                                    value={formData.totalEstimatedBudget}
                                    onChange={handleChange}
                                    className={inputCls}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Recommended by / Justification</label>
                            <textarea
                                name="recommendedByJustification"
                                value={formData.recommendedByJustification}
                                onChange={handleChange}
                                rows={3}
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Notes / Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className={inputCls}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn-outline px-6 py-2 text-sm font-semibold"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary px-6 py-2 text-sm font-semibold disabled:opacity-60"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
