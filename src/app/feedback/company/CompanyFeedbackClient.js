'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const UNMATERIALIZED_REASONS = [
    'Price competitiveness',
    'Quality specifications',
    'Credit terms',
    'Logistics / transportation cost',
    'Minimum order quantity',
    'Other (please specify)',
];

const COMPETITOR_METHODS = [
    'Pricing strategy',
    'Product differentiation',
    'Packaging & branding',
    'Promotional offers',
    'Strong buyer network',
    'Other (please specify)',
];

const SATISFACTION_OPTIONS = [
    'Very satisfied',
    'Satisfied',
    'Neutral',
    'Dissatisfied',
];

function SectionHeading({ title }) {
    return (
        <div className="pt-6 pb-2 border-t glass-divider">
            <h2 className="text-base font-semibold text-accent-green uppercase tracking-wide">{title}</h2>
        </div>
    );
}

function Field({ label, required, hint, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-secondary mb-1">
                {label}{required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {hint && <p className="text-xs text-muted mb-1">{hint}</p>}
            {children}
        </div>
    );
}

const inputCls = 'glass-input w-full px-3 py-2 text-sm';

export default function CompanyFeedbackClient() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId') ? Number(searchParams.get('eventId')) : null;
    const companyIdParam = searchParams.get('companyId') ? Number(searchParams.get('companyId')) : null;

    const [company, setCompany] = useState(null);
    const [companyLoading, setCompanyLoading] = useState(!!companyIdParam);

    // Fetch company data for display
    useEffect(() => {
        if (!companyIdParam) return;
        setCompanyLoading(true);
        fetch(`/api/companies?id=${companyIdParam}`)
            .then((r) => r.json())
            .then((data) => { if (data.company) setCompany(data.company); })
            .catch(() => {})
            .finally(() => setCompanyLoading(false));
    }, [companyIdParam]);

    const [form, setForm] = useState({
        productsExhibited: '',
        b2bMeetings: '',
        existingCustomers: '',
        newContacts: '',
        visitorsCountries: '',
        ordersBooked: '',
        expectedOrders: '',
        hadUnmaterializedInquiries: '',
        unmaterializedReasons: [],
        unmaterializedOther: '',
        majorCompetitors: '',
        competitorMarketingMethods: [],
        competitorMethodsOther: '',
        problemsFaced: '',
        improvementSuggestions: '',
        tdapRecommendations: '',
        continueFairParticipation: '',
        satisfactionLevel: '',
        additionalComments: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const toggleCheckbox = (field, value) => {
        setForm((prev) => {
            const current = prev[field];
            return {
                ...prev,
                [field]: current.includes(value)
                    ? current.filter((v) => v !== value)
                    : [...current, value],
            };
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!eventId) { setError('Invalid event link.'); return; }

        setSubmitting(true);
        setError(null);

        const reasons = form.unmaterializedReasons.map((r) =>
            r === 'Other (please specify)' && form.unmaterializedOther
                ? `Other: ${form.unmaterializedOther}` : r
        );
        const methods = form.competitorMarketingMethods.map((m) =>
            m === 'Other (please specify)' && form.competitorMethodsOther
                ? `Other: ${form.competitorMethodsOther}` : m
        );

        try {
            const res = await fetch('/api/event-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    companyId: companyIdParam,
                    productsExhibited: form.productsExhibited,
                    b2bMeetings: form.b2bMeetings,
                    existingCustomers: form.existingCustomers,
                    newContacts: form.newContacts,
                    visitorsCountries: form.visitorsCountries,
                    ordersBooked: form.ordersBooked,
                    expectedOrders: form.expectedOrders,
                    hadUnmaterializedInquiries:
                        form.hadUnmaterializedInquiries === 'yes' ? true
                            : form.hadUnmaterializedInquiries === 'no' ? false : null,
                    unmaterializedReasons: reasons,
                    majorCompetitors: form.majorCompetitors,
                    competitorMarketingMethods: methods,
                    problemsFaced: form.problemsFaced,
                    improvementSuggestions: form.improvementSuggestions,
                    tdapRecommendations: form.tdapRecommendations,
                    continueFairParticipation:
                        form.continueFairParticipation === 'yes' ? true
                            : form.continueFairParticipation === 'no' ? false : null,
                    satisfactionLevel: form.satisfactionLevel,
                    additionalComments: form.additionalComments,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to submit feedback.'); return; }
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError('Failed to submit feedback.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="page-wrapper flex items-center justify-center px-4 py-16">
                <div className="glass-card max-w-lg w-full p-8 text-center">
                    <div className="w-16 h-16 icon-circle-green mx-auto mb-4">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-primary mb-2">Thank You!</h2>
                    <p className="text-secondary">Your feedback has been submitted successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper py-8 px-4">
            <main className="container mx-auto max-w-2xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-primary">Exhibitor Feedback Form</h1>
                    <p className="text-muted mt-1 text-sm">Post-Exhibition — TDAP Agro Food Division</p>
                </div>

                {/* Company Info Card */}
                {companyLoading ? (
                    <div className="mb-5 glass-card p-4 animate-pulse">
                        <div className="h-4 rounded w-1/3 mb-2" style={{background: 'var(--glass-bg-hover)'}} />
                        <div className="h-3 rounded w-2/3" style={{background: 'var(--glass-bg)'}} />
                    </div>
                ) : company ? (
                    <div className="mb-5 glass-card p-4" style={{borderColor: 'rgba(34,197,94,0.30)'}}>
                        <p className="text-xs font-semibold text-accent-green uppercase tracking-wide mb-2">Company</p>
                        <p className="text-primary font-semibold text-base">{company.name}</p>
                        {company.address && (
                            <p className="text-secondary text-sm mt-0.5">{company.address}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                            {company.representativeName && <span>👤 {company.representativeName}</span>}
                            {company.representativeTel && <span>📞 {company.representativeTel}</span>}
                            {company.representativeWhatsapp && <span>💬 {company.representativeWhatsapp}</span>}
                            {company.representativeEmail && <span>✉️ {company.representativeEmail}</span>}
                        </div>
                    </div>
                ) : null}

                <form onSubmit={onSubmit} className="glass-card p-6 md:p-8 space-y-5">
                    {error && (
                        <div className="alert-error px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    {/* ── Products ── */}
                    <SectionHeading title="Products Exhibited" />

                    <Field label="Product(s) Exhibited">
                        <textarea name="productsExhibited" value={form.productsExhibited} onChange={onChange} rows={2} className={inputCls} placeholder="List the products you exhibited" />
                    </Field>

                    {/* ── Business Results ── */}
                    <SectionHeading title="Business Results" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="B2B Meetings During the Fair">
                            <input type="number" min="0" name="b2bMeetings" value={form.b2bMeetings} onChange={onChange} className={inputCls} />
                        </Field>
                        <Field label="Existing Customers Met">
                            <input type="number" min="0" name="existingCustomers" value={form.existingCustomers} onChange={onChange} className={inputCls} />
                        </Field>
                        <Field label="Worthwhile New Business Contacts">
                            <input type="number" min="0" name="newContacts" value={form.newContacts} onChange={onChange} className={inputCls} />
                        </Field>
                        <Field label="Country of Origin of Visitors / Buyers">
                            <input type="text" name="visitorsCountries" value={form.visitorsCountries} onChange={onChange} className={inputCls} placeholder="e.g., UAE, Germany, UK" />
                        </Field>
                        <Field label="Orders Booked During the Fair (USD)">
                            <input type="number" min="0" step="0.01" name="ordersBooked" value={form.ordersBooked} onChange={onChange} className={inputCls} />
                        </Field>
                        <Field label="Expected Future Orders (USD)">
                            <input type="number" min="0" step="0.01" name="expectedOrders" value={form.expectedOrders} onChange={onChange} className={inputCls} />
                        </Field>
                    </div>

                    {/* ── Inquiries & Competition ── */}
                    <SectionHeading title="Inquiries & Competition" />

                    <Field label="Did you receive inquiries that did not materialize into actual business?" required>
                        <div className="flex gap-6 mt-1">
                            {['yes', 'no'].map((v) => (
                                <label key={v} className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                                    <input type="radio" name="hadUnmaterializedInquiries" value={v} checked={form.hadUnmaterializedInquiries === v} onChange={onChange} className="accent-green-400" />
                                    {v === 'yes' ? 'Yes' : 'No'}
                                </label>
                            ))}
                        </div>
                    </Field>

                    {form.hadUnmaterializedInquiries === 'yes' && (
                        <Field label="If yes, what were the main reasons?">
                            <div className="space-y-2 mt-1">
                                {UNMATERIALIZED_REASONS.map((r) => (
                                    <label key={r} className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                                        <input type="checkbox" checked={form.unmaterializedReasons.includes(r)} onChange={() => toggleCheckbox('unmaterializedReasons', r)} className="accent-green-400" />
                                        {r}
                                    </label>
                                ))}
                                {form.unmaterializedReasons.includes('Other (please specify)') && (
                                    <input type="text" name="unmaterializedOther" value={form.unmaterializedOther} onChange={onChange} className={`${inputCls} mt-1`} placeholder="Please specify…" />
                                )}
                            </div>
                        </Field>
                    )}

                    <Field label="Who were your major competitors at the fair?">
                        <input type="text" name="majorCompetitors" value={form.majorCompetitors} onChange={onChange} className={inputCls} placeholder="e.g., Indian exporters, Turkish companies" />
                    </Field>

                    <Field label="What marketing methods were used by competitors?">
                        <div className="space-y-2 mt-1">
                            {COMPETITOR_METHODS.map((m) => (
                                <label key={m} className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                                    <input type="checkbox" checked={form.competitorMarketingMethods.includes(m)} onChange={() => toggleCheckbox('competitorMarketingMethods', m)} className="accent-green-400" />
                                    {m}
                                </label>
                            ))}
                            {form.competitorMarketingMethods.includes('Other (please specify)') && (
                                <input type="text" name="competitorMethodsOther" value={form.competitorMethodsOther} onChange={onChange} className={`${inputCls} mt-1`} placeholder="Please specify…" />
                            )}
                        </div>
                    </Field>

                    {/* ── Evaluation & Suggestions ── */}
                    <SectionHeading title="Evaluation & Suggestions" />

                    <Field label="Problems Faced During the Exhibition (if any)">
                        <textarea name="problemsFaced" value={form.problemsFaced} onChange={onChange} rows={3} className={inputCls} />
                    </Field>

                    <Field label="Suggestions for Improvement in Future Fairs">
                        <textarea name="improvementSuggestions" value={form.improvementSuggestions} onChange={onChange} rows={3} className={inputCls} />
                    </Field>

                    <Field label="Any Specific Recommendations for TDAP">
                        <textarea name="tdapRecommendations" value={form.tdapRecommendations} onChange={onChange} rows={3} className={inputCls} />
                    </Field>

                    <Field label="Should TDAP continue participation in this fair in future?" required>
                        <div className="flex gap-6 mt-1">
                            {['yes', 'no'].map((v) => (
                                <label key={v} className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                                    <input type="radio" name="continueFairParticipation" value={v} checked={form.continueFairParticipation === v} onChange={onChange} className="accent-green-400" />
                                    {v === 'yes' ? 'Yes' : 'No'}
                                </label>
                            ))}
                        </div>
                    </Field>

                    <Field label="Are you satisfied with the overall arrangements at the fair?">
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            {SATISFACTION_OPTIONS.map((opt) => (
                                <label key={opt} className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                                    <input type="radio" name="satisfactionLevel" value={opt} checked={form.satisfactionLevel === opt} onChange={onChange} className="accent-green-400" />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </Field>

                    <Field label="Additional Comments (if any)">
                        <textarea name="additionalComments" value={form.additionalComments} onChange={onChange} rows={3} className={inputCls} />
                    </Field>

                    <div className="pt-4 border-t glass-divider">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary w-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
                        >
                            {submitting ? 'Submitting…' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
