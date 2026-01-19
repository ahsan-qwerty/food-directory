import { NextResponse } from 'next/server';
import { companies } from '@/data/companies';

export async function POST(request) {
    try {
        const data = await request.json();

        // Validation
        if (!data.company_name) {
            return NextResponse.json(
                { error: 'Company name is required' },
                { status: 400 }
            );
        }

        if (!data.sector_id) {
            return NextResponse.json(
                { error: 'Sector is required' },
                { status: 400 }
            );
        }

        if (!data.category_id || data.category_id.length === 0) {
            return NextResponse.json(
                { error: 'At least one category is required' },
                { status: 400 }
            );
        }

        // if (!data.company_email_address) {
        //   return NextResponse.json(
        //     { error: 'Company email is required' },
        //     { status: 400 }
        //   );
        // }

        // Generate new ID (get max ID and add 1)
        const maxId = companies.reduce((max, company) =>
            company.id > max ? company.id : max, 0
        );
        const newId = maxId + 1;

        // Create new company object
        const newCompany = {
            id: newId,
            company_name: data.company_name,
            company_profile: data.company_profile || '',
            sector_id: parseInt(data.sector_id),
            category_id: data.category_id.map(id => parseInt(id)),
            sub_category_ids: data.sub_category_ids ? data.sub_category_ids.map(id => parseInt(id)) : [],
            company_competence: data.company_competence || '',
            year_of_incorporation: data.year_of_incorporation ? parseInt(data.year_of_incorporation) : null,
            no_of_employees: data.no_of_employees ? parseInt(data.no_of_employees) : null,
            certification: data.certification || '',
            company_address: data.company_address || '',
            company_email_address: data.company_email_address,
            web_address: data.web_address || '',
            person_name: data.person_name || '',
            person_designation: data.person_designation || '',
            person_cell_no: data.person_cell_no || '',
            person_whatsapp_no: data.person_whatsapp_no || '',
            person_email_address: data.person_email_address || ''
        };

        // Add to companies array (in-memory for now)
        // NOTE: In Phase 2 with MySQL, this will be a database INSERT
        companies.push(newCompany);

        return NextResponse.json({
            success: true,
            message: 'Company registered successfully',
            company: newCompany
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register company. Please try again.' },
            { status: 500 }
        );
    }
}
