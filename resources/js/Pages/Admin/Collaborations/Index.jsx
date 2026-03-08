import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BriefcaseIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const CollaborationIndex = ({ requests }) => {
    const [processingId, setProcessingId] = useState(null);

    const handleUpdateStatus = (id, newStatus) => {
        if (confirm(`Are you sure you want to mark this request as ${newStatus}?`)) {
            setProcessingId(id);
            router.put(route('admin.collaborations.update', id), {
                status: newStatus
            }, {
                onFinish: () => setProcessingId(null)
            });
        }
    };

    return (
        <AdminLayout
            header={<h2 className="font-bold text-xl text-slate-800 dark:text-neutral-200 leading-tight">🤝 Collaboration Requests</h2>}
        >
            <Head title="Admin - Collaboration Requests" />

            <div className="py-8 max-w-7xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                                <BriefcaseIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Collaboration & Demo</h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Manage incoming partnership and demo requests.</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                                    <th className="px-6 py-4">Requester</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Message</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {requests.data.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold uppercase shrink-0">
                                                    {req.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{req.name}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <EnvelopeIcon className="w-3 h-3" /> {req.email}
                                                    </div>
                                                    {req.company && (
                                                        <div className="text-xs text-indigo-500 font-semibold mt-0.5">
                                                            🏢 {req.company}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide",
                                                req.type === 'demo' && "bg-blue-100 text-blue-700",
                                                req.type === 'collaboration' && "bg-purple-100 text-purple-700",
                                                req.type === 'other' && "bg-slate-100 text-slate-600",
                                            )}>
                                                {req.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2" title={req.message}>
                                                {req.message}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1",
                                                req.status === 'pending' && "bg-amber-100 text-amber-600",
                                                req.status === 'contacted' && "bg-emerald-100 text-emerald-600",
                                                req.status === 'rejected' && "bg-red-100 text-red-600",
                                            )}>
                                                {req.status === 'pending' && <ClockIcon className="h-3 w-3" />}
                                                {req.status === 'contacted' && <CheckCircleIcon className="h-3 w-3" />}
                                                {req.status === 'rejected' && <XCircleIcon className="h-3 w-3" />}
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-slate-500">
                                            <div className="font-bold">{dayjs(req.created_at).fromNow()}</div>
                                            <div className="opacity-70">{dayjs(req.created_at).format('DD MMM YYYY')}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUpdateStatus(req.id, 'contacted')}
                                                            disabled={processingId === req.id}
                                                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Mark as Contacted"
                                                        >
                                                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                                            disabled={processingId === req.id}
                                                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Reject"
                                                        >
                                                            <XCircleIcon className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {req.status !== 'pending' && (
                                                    <span className="text-xs text-slate-400 italic">No actions</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {requests.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            No collaboration requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {requests.links && requests.links.length > 3 && (
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-2">
                            {requests.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={clsx(
                                        "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                        link.active
                                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                            : "bg-slate-50 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
                                        !link.url && "opacity-50 cursor-not-allowed"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default CollaborationIndex;
