'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [sectors, setSectors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        company_name: '',
        // company_profile: '',
        sector_id: '',
        category_id: [],
        sub_category_ids: [],
        // company_competence: '',
        // year_of_incorporation: '',
        // no_of_employees: '',
        // certification: '',
        // company_address: '',
        // company_email_address: '',
        // web_address: '',
        // person_name: '',
        // person_designation: '',
        // person_cell_no: '',
        // person_whatsapp_no: '',
        // person_email_address: ''
    });

    // Fetch sectors, categories, and sub-categories on mount
    useEffect(() => {
        async function fetchData() {
            try {
                const [sectorsRes, categoriesRes, subCategoriesRes] = await Promise.all([
                    fetch('/api/sectors'),
                    fetch('/api/categories'),
                    fetch('/api/subcategories')
                ]);

                const sectorsData = await sectorsRes.json();
                const categoriesData = await categoriesRes.json();
                const subCategoriesData = await subCategoriesRes.json();

                setSectors(sectorsData.sectors);
                setCategories(categoriesData.categories);
                setSubCategories(subCategoriesData.subCategories);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load form data. Please refresh the page.');
            }
        }
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMultiSelectChange = (e, fieldName) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selected.push(parseInt(options[i].value));
            }
        }
        setFormData(prev => ({
            ...prev,
            [fieldName]: selected
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (!formData.company_name) {
            setError('Company name is required');
            setLoading(false);
            return;
        }

        if (!formData.sector_id) {
            setError('Please select a sector');
            setLoading(false);
            return;
        }

        if (formData.category_id.length === 0) {
            setError('Please select at least one category');
            setLoading(false);
            return;
        }

        // if (!formData.company_email_address) {
        //     setError('Company email is required');
        //     setLoading(false);
        //     return;
        // }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    sector_id: parseInt(formData.sector_id)
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/companies');
                }, 2000);
            } else {
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setError('Failed to submit registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
                    <div className="text-green-600 text-6xl mb-4">✓</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                    <p className="text-gray-600 mb-4">
                        Your company has been registered successfully. Redirecting to companies page...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Registration</h1>
                    <p className="text-gray-600">
                        Register your company in the TDAP Food Division Directory
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            {/* <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Profile
                                </label>
                                <textarea
                                    name="company_profile"
                                    value={formData.company_profile}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Describe your company's background, mission, and activities..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Competence
                                </label>
                                <input
                                    type="text"
                                    name="company_competence"
                                    value={formData.company_competence}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., Export, Manufacturing, Processing"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year of Incorporation
                                </label>
                                <input
                                    type="number"
                                    name="year_of_incorporation"
                                    value={formData.year_of_incorporation}
                                    onChange={handleInputChange}
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Employees
                                </label>
                                <input
                                    type="number"
                                    name="no_of_employees"
                                    value={formData.no_of_employees}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Certifications
                                </label>
                                <input
                                    type="text"
                                    name="certification"
                                    value={formData.certification}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="e.g., ISO 9001, HACCP, Halal (comma separated)"
                                />
                            </div> */}
                        </div>
                    </div>

                    {/* Business Categories */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Business Categories</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Main Sector <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="sector_id"
                                    value={formData.sector_id}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                >
                                    <option value="">Select Sector</option>
                                    {sectors.map(sector => (
                                        <option key={sector.id} value={sector.id}>
                                            {sector.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categories <span className="text-red-500">*</span>
                                    <span className="text-xs text-gray-500 ml-1">(Hold Ctrl/Cmd to select multiple)</span>
                                </label>
                                <select
                                    multiple
                                    value={formData.category_id}
                                    onChange={(e) => handleMultiSelectChange(e, 'category_id')}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
                                    required
                                >
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sub-Categories (Products)
                                    <span className="text-xs text-gray-500 ml-1">(Hold Ctrl/Cmd to select multiple)</span>
                                </label>
                                <select
                                    multiple
                                    value={formData.sub_category_ids}
                                    onChange={(e) => handleMultiSelectChange(e, 'sub_category_ids')}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
                                >
                                    {subCategories.map(subCategory => (
                                        <option key={subCategory.id} value={subCategory.id}>
                                            {subCategory.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Company Contact Information */}
                    {/* <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Company Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Address
                                </label>
                                <textarea
                                    name="company_address"
                                    value={formData.company_address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="company_email_address"
                                    value={formData.company_email_address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    name="web_address"
                                    value={formData.web_address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                    </div> */}

                    {/* Contact Person Information */}
                    {/* <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Person Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Person Name
                                </label>
                                <input
                                    type="text"
                                    name="person_name"
                                    value={formData.person_name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Designation
                                </label>
                                <input
                                    type="text"
                                    name="person_designation"
                                    value={formData.person_designation}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="person_cell_no"
                                    value={formData.person_cell_no}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="+92 XXX XXXXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    WhatsApp Number
                                </label>
                                <input
                                    type="tel"
                                    name="person_whatsapp_no"
                                    value={formData.person_whatsapp_no}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="+92 XXX XXXXXXX"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Person Email
                                </label>
                                <input
                                    type="email"
                                    name="person_email_address"
                                    value={formData.person_email_address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 text-gray-950 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div> */}

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-700 text-white px-6 py-3 rounded-md hover:bg-green-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? 'Submitting...' : 'Register Company'}
                        </button>
                        <Link
                            href="/companies"
                            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors text-center font-medium"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
