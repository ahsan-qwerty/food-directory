export default function Loading() {
    return (
        <div className="page-wrapper py-8 px-4">
            <div className="container mx-auto max-w-4xl">

                {/* Header Skeleton */}
                <div className="glass-card p-6 mb-6 animate-pulse">
                    <div className="h-8 bg-white/10 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                </div>

                {/* Form Skeleton */}
                <div className="glass-card p-6 space-y-8 animate-pulse">
                    <div>
                        <div className="h-6 bg-white/10 rounded w-1/4 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <div className="h-4 bg-white/10 rounded w-1/6 mb-2"></div>
                                <div className="h-10 bg-white/5 rounded"></div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="h-4 bg-white/10 rounded w-1/6 mb-2"></div>
                                <div className="h-24 bg-white/5 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
                                <div className="h-10 bg-white/5 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-white/10 rounded w-1/4 mb-2"></div>
                                <div className="h-10 bg-white/5 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
                                <div className="h-10 bg-white/5 rounded"></div>
                            </div>
                            <div>
                                <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
                                <div className="h-10 bg-white/5 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <div className="flex-1 h-12 bg-white/10 rounded"></div>
                        <div className="flex-1 h-12 bg-white/5  rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
