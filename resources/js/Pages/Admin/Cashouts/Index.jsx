import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    BanknotesIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UserCircleIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const CashoutIndex = ({ payouts }) => {
    const [processingId, setProcessingId] = useState(null);

    const handleProcess = (payoutId) => {
        if (confirm('Are you sure you want to approve this cashout request? It will be marked as processed.')) {
            setProcessingId(payoutId);
            router.put(route('admin.cashouts.update', payoutId), {
                status: 'processed'
            }, {
                onFinish: () => setProcessingId(null)
            });
        }
    };

    const handleReject = (payoutId) => {
        const reason = prompt('Enter a reason for rejection (optional):');
        if (reason !== null) { // Handle cancel
            setProcessingId(payoutId);
            router.put(route('admin.cashouts.update', payoutId), {
                status: 'rejected',
                admin_notes: reason
            }, {
                onFinish: () => setProcessingId(null)
            });
        }
    };

    return (
        <AdminLayout
            header={<h2 className="font-bold text-xl text-slate-800 dark:text-neutral-200 leading-tight">💸 Cashout Requests</h2>}
        >
            <Head title="Admin - Cashout Requests" />

            <div className="py-8 max-w-7xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600">
                                <BanknotesIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Withdrawal Requests</h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Review and process user XP cashout requests.</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4 text-right">Amount (XP)</th>
                                    <th className="px-6 py-4 text-right">Fee (3%)</th>
                                    <th className="px-6 py-4 text-right">Net Amount</th>
                                    <th className="px-6 py-4">Payment Details</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {payouts.data.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                                                    {payout.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{payout.user.name}</div>
                                                    <div className="text-xs text-slate-500">{payout.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium text-slate-600 dark:text-slate-300">
                                            {payout.amount_xp.toLocaleString()} XP
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-red-500 text-xs">
                                            Rp {Number(payout.fee).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-black text-emerald-600 text-lg">
                                            Rp {Number(payout.net_amount_idr).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                {payout.payment_method}
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono mt-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded inline-block">
                                                {payout.account_number}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">
                                                A.N {payout.account_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1",
                                                payout.status === 'pending' && "bg-amber-100 text-amber-600",
                                                payout.status === 'processed' && "bg-emerald-100 text-emerald-600",
                                                payout.status === 'rejected' && "bg-red-100 text-red-600",
                                            )}>
                                                {payout.status === 'pending' && <ClockIcon className="h-3 w-3" />}
                                                {payout.status === 'processed' && <CheckCircleIcon className="h-3 w-3" />}
                                                {payout.status === 'rejected' && <XCircleIcon className="h-3 w-3" />}
                                                {payout.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-slate-500">
                                            {new Date(payout.created_at).toLocaleDateString()}
                                            <div className="text-[10px] opacity-70">
                                                {new Date(payout.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {payout.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleProcess(payout.id)}
                                                            disabled={processingId === payout.id}
                                                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Approve & Mark Processed"
                                                        >
                                                            <CheckCircleIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(payout.id)}
                                                            disabled={processingId === payout.id}
                                                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Reject & Refund XP"
                                                        >
                                                            <XCircleIcon className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                {payout.status !== 'pending' && (
                                                    <span className="text-xs text-slate-400 italic">
                                                        {payout.status === 'rejected' && payout.admin_notes ? `Note: ${payout.admin_notes}` : 'No actions'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {payouts.data.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                            No cashout requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {payouts.links && payouts.links.length > 3 && (
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-center gap-2">
                            {payouts.links.map((link, i) => (
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

export default CashoutIndex;
