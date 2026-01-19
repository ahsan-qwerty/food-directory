export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header Skeleton */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>

                {/* Form Skeleton */}
                <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                                <div className="h-10 bg-gray-100 rounded"></div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                                <div className="h-24 bg-gray-100 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-10 bg-gray-100 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-10 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-10 bg-gray-100 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-32 bg-gray-100 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-32 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <div className="flex-1 h-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex-1 h-12 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
