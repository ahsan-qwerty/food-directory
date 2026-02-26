'use client';

import ParticipantsList from '../../../../components/ParticipantsList';

export default function DelegationParticipantsList({ delegationId, participants }) {
    const handleRemove = async (companyId, companyName) => {
        const res = await fetch('/api/delegations/participants', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delegationId, companyId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to remove participant');
    };

    return (
        <ParticipantsList
            participants={participants}
            onRemove={handleRemove}
        />
    );
}
