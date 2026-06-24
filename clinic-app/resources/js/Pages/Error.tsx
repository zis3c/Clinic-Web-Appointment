import React from 'react';
import { Head, Link } from '@inertiajs/react';

interface ErrorProps {
    status: number;
}

export default function ErrorPage({ status }: ErrorProps) {
    const title = {
        503: 'Service Unavailable',
        500: 'Server Error',
        404: 'Page Not Found',
        403: 'Forbidden',
    }[status] || 'An Error Occurred';

    const description = {
        503: 'Sorry, we are doing some maintenance. Please check back soon.',
        500: 'Whoops, something went wrong on our servers. We are looking into it.',
        404: 'Sorry, the page you are looking for could not be found. It might have been moved or deleted.',
        403: 'Sorry, you are forbidden from accessing this page.',
    }[status] || 'An unexpected error occurred.';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 py-12 lg:px-8 font-sans antialiased text-gray-900">
            <Head title={title} />
            
            <div className="text-center w-full max-w-2xl bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-5xl font-extrabold text-teal-600 mb-4">{status}</p>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-6">{title}</h1>
                <p className="text-lg leading-7 text-gray-500 mb-10 max-w-lg mx-auto">{description}</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-full font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                    >
                        Go Back
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
