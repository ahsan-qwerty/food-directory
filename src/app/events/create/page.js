'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [sectors, setSectors] = useState([]);

    useEffect(() => {
        fetch('/api/sectors')
            .then((r) => r.json())
            .then((data) => setSectors(data.sectors || []))
            .catch(() => { });
    }, []);

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
        finalRemarks: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            // Reset city when country changes
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
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
            setError('End date cannot be before start date.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
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
                finalRemarks: formData.finalRemarks || null,
            };

            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to create event');
                return;
            }

            setSuccess('Event created successfully! Redirecting...');
            setTimeout(() => {
                router.push(`/events/${data.id}`);
            }, 1500);
        } catch (err) {
            console.error('Error creating event:', err);
            setError('Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper px-4">
            <main className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                        Create New Exhibition / Event
                    </h1>
                    <p className="text-secondary">
                        Add an event using the same fields as the Excel planning sheet
                    </p>
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
                                placeholder="e.g., Fine Food, Australia"
                                required
                            />
                        </div>

                        <div>
                            <label className={labelCls}>
                                Desk Officer
                            </label>
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
                                        min={formData.startDate || undefined}
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
                                    {COUNTRY_OPTIONS.map((c) => (
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
                                    {(COUNTRY_CITIES[formData.country] || []).map((city) => (
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
                                    placeholder="e.g., 12600000"
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Participation Fee</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="exhibitorCost"
                                    value={formData.exhibitorCost}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g., 8400000"
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Estimated Budget (Rs.)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    name="totalEstimatedBudget"
                                    value={formData.totalEstimatedBudget}
                                    onChange={handleChange}
                                    className={inputCls}
                                    placeholder="e.g., 21000000"
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
                                placeholder="e.g., Regular Event."
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="btn-outline px-6 py-2 text-sm font-semibold"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary px-6 py-2 text-sm font-semibold disabled:opacity-60"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
