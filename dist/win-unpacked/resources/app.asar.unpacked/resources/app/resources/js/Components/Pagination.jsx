import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    return (
        <nav className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
                {links[0].url ? (
                    <Link href={links[0].url} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Previous
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-white cursor-not-allowed">
                        Previous
                    </span>
                )}
                 {links[links.length - 1].url ? (
                    <Link href={links[links.length - 1].url} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        Next
                    </Link>
                ) : (
                    <span className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-white cursor-not-allowed">
                        Next
                    </span>
                )}
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-end">
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {links.map((link, index) => {
                            // Jika URL null (seperti '...') maka tampilkan sebagai teks biasa
                            if (link.url === null) {
                                return (
                                    <span
                                        key={index}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400"
                                    />
                                );
                            }

                            // Tentukan className berdasarkan status link
                            const className = `relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                link.active
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-gray-900' // Halaman aktif
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700' // Halaman tidak aktif
                            }`;
                            
                            // Tambahkan kelas untuk sudut-sudut (opsional tapi bagus)
                            const roundedClass = index === 0 ? 'rounded-l-md' 
                                            : index === links.length - 1 ? 'rounded-r-md' 
                                            : '';
                            
                            return (
                                <Link
                                    key={index}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`${className} ${roundedClass}`}
                                />
                            );
                        })}
                    </nav>
                </div>
            </div>
        </nav>
    );
}