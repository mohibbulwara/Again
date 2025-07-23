
'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function DishesRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        router.replace('/' + (params.toString() ? '?' + params.toString() : ''));
    }, [router, searchParams]);

    return (
        <div className="container mx-auto py-12 text-center">
            <p>Redirecting to the main page...</p>
        </div>
    );
}

export default function DishesRedirectPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DishesRedirectContent />
        </Suspense>
    );
}
