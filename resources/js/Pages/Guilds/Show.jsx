import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react'; // ensure router is imported
import { Dialog, Transition } from '@headlessui/react';
import {
    ChatBubbleLeftRightIcon, TrophyIcon, UserGroupIcon,
    BoltIcon, ArrowRightIcon, FireIcon, DocumentTextIcon, LockClosedIcon,
    BanknotesIcon, CreditCardIcon, ExclamationTriangleIcon, SparklesIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function GuildOverview({ auth, guild, members }) {
    const [messages, setMessages] = useState(guild.chats || []);
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef(null);

    // Economy State
    const [isTopUpOpen, setIsTopUpOpen] = useState(false);
    const [isWalletOpen, setIsWalletOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState(100);
    const [cashoutAmount, setCashoutAmount] = useState(100);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [paymentDetails, setPaymentDetails] = useState('');

    // Get user prop for redeemable_xp
    const { props } = usePage();
    const user = auth.user; // auth prop is already passed to component, cleaner to use that

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Midtrans Snap Effect
    useEffect(() => {
        if (props.flash.snap_token) {
            if (window.snap) {
                window.snap.pay(props.flash.snap_token, {
                    onSuccess: function (result) {
                        router.reload({ only: ['guild'] });
                    },
                    onPending: function (result) {
                        router.reload();
                    },
                    onError: function (result) {
                        console.error("Payment failed", result);
                    },
                    onClose: function () {
                        console.log('Customer closed the popup without finishing the payment');
                    }
                });
            } else {
                console.error("Midtrans Snap is not loaded");
            }
        }
    }, [props.flash.snap_token]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await axios.post(route('api.guilds.chat.send', guild.id), {
                message: newMessage
            });
            setMessages(prev => [...prev, {
                id: res.data.message.id,
                user_name: auth.user.name,
                message: res.data.message.message,
                time: 'Just now',
                is_system: false
            }]);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <AuthenticatedLayout header={null}>
            <Head>
                <title>{`${guild.name} - Overview`}</title>
                <script
                    src={props.midtrans.is_production
                        ? 'https://app.midtrans.com/snap/snap.js'
                        : 'https://app.sandbox.midtrans.com/snap/snap.js'}
                    data-client-key={props.midtrans.client_key}
                ></script>
            </Head>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-slate-900 dark:text-white">
                {/* Header / Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-8 mb-8 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">
                        {guild.emblem}
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="text-6xl bg-white/10 p-4 rounded-3xl backdrop-blur-md shadow-inner border border-white/20">
                            {guild.emblem}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                                {guild.name}
                                {guild.is_private && (
                                    <span className="px-3 py-1 rounded-full bg-slate-900/50 border border-slate-700/50 text-slate-300 text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                                        <LockClosedIcon className="w-3 h-3" /> Private
                                    </span>
                                )}
                            </h1>
                            <p className="text-emerald-200 text-lg max-w-2xl font-medium">
                                {guild.description || "A guild for productive heroes."}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                                <div className="flex flex-wrap gap-3">
                                    <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <UserGroupIcon className="w-4 h-4" /> {guild.member_count} / {guild.max_members} Members
                                    </span>
                                    {guild.is_leader && (
                                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Invite Code:</span>
                                            <code className="font-mono font-bold text-emerald-600 dark:text-emerald-400 select-all">{guild.invite_code}</code>
                                        </div>
                                    )}
                                </div>
                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold backdrop-blur-sm border border-amber-500/30 flex items-center gap-1">
                                    <BoltIcon className="w-3 h-3" /> {guild.total_xp} XP Generated
                                </span>
                                {/* XP Balance (No button here, just status) */}
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border flex items-center gap-1 transition-all ${guild.xp_balance < 500 ? 'bg-amber-500/30 text-amber-200 border-amber-400/50' : 'bg-teal-500/20 text-teal-300 border-teal-500/30'}`}>
                                        <BanknotesIcon className="w-3 h-3" /> {guild.xp_balance || 0} XP Fund
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Stats & QuickNav */}
                    <div className="space-y-8">
                        {/* Navigation Menu */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Command Center</h3>
                            <nav className="space-y-3">
                                {/* Leader Bank (Psychological Placement) */}
                                {guild.is_leader && (
                                    <button
                                        onClick={() => setIsTopUpOpen(true)}
                                        className={`w-full flex flex-col p-4 rounded-3xl border transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group mb-4 ${guild.xp_balance < 500 ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-all" />
                                        <div className="flex items-center justify-between w-full mb-2 relative z-10">
                                            <span className="font-black text-[10px] uppercase tracking-widest text-slate-400">Guild Treasury</span>
                                            {guild.xp_balance < 500 && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[9px] font-black rounded-full animate-pulse">
                                                    LOW BALANCE
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between w-full relative z-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 group-hover:rotate-6 transition-transform">
                                                    <BanknotesIcon className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-base font-black text-slate-800 dark:text-white leading-tight">Invest in Guild</div>
                                                    <div className="text-[11px] font-bold text-slate-500">{guild.xp_balance || 0} XP Banked</div>
                                                </div>
                                            </div>
                                            <ArrowRightIcon className="w-5 h-5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </button>
                                )}
                                <Link
                                    href={route('guilds.tasks.index', guild.id)}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                                >
                                    <span className="font-bold flex items-center gap-3">
                                        <BoltIcon className="w-5 h-5" /> Mission Board
                                    </span>
                                    <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button
                                    onClick={() => setIsWalletOpen(true)}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                                >
                                    <span className="font-bold flex items-center gap-3">
                                        <CreditCardIcon className="w-5 h-5" /> My Wallet
                                    </span>
                                    <span className="bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {user.redeemable_xp || 0} XP
                                    </span>
                                </button>
                                <Link
                                    href={route('guilds.nexus', guild.id)}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                                >
                                    <span className="font-bold flex items-center gap-3">
                                        <FireIcon className="w-5 h-5" /> Focus Nexus
                                    </span>
                                    <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href={route('guilds.report', guild.id)}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                                >
                                    <span className="font-bold flex items-center gap-3">
                                        <TrophyIcon className="w-5 h-5" /> Guild Report
                                    </span>
                                    <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href={route('guilds.divisions.index', guild.id)}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                                >
                                    <span className="font-bold flex items-center gap-3">
                                        <UserGroupIcon className="w-5 h-5" /> Divisions
                                    </span>
                                    <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href={route('guilds.documents.index', guild.id)}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                                >
                                    <span className="font-bold flex items-center gap-3">
                                        <DocumentTextIcon className="w-5 h-5" /> Guild Archives
                                    </span>
                                    <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </nav>
                        </div>


                        {/* Members Widget */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Squad Members</h3>
                                <Link href="#" className="text-xs font-bold text-emerald-500 hover:underline">View All</Link>
                            </div>
                            <div className="flex -space-x-3 overflow-hidden py-2">
                                {members.map((member) => (
                                    <div key={member.id} title={member.name} className="relative inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">
                                        {member.avatar ? <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" /> : member.name.charAt(0)}
                                    </div>
                                ))}
                                {(guild.member_count > 5) && (
                                    <div className="relative inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xs">
                                        +{guild.member_count - 5}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Arena Leaderboard Widget */}
                        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 shadow-xl border border-indigo-800 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <TrophyIcon className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <SparklesIcon className="w-5 h-5 text-yellow-300" />
                                    <h3 className="font-bold text-lg">Top Arena Thinkers</h3>
                                </div>
                                <div className="space-y-3">
                                    {(guild.arena_leaders || []).map((leader, index) => (
                                        <div key={leader.id} className="flex items-center justify-between p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs ring-2 ring-indigo-300">
                                                    {leader.avatar ? <img src={leader.avatar} alt={leader.name} className="h-full w-full rounded-full object-cover" /> : leader.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm leading-tight">{leader.name}</p>
                                                    <p className="text-[10px] text-indigo-300 font-medium">{leader.arena_rank || 'Novice'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-yellow-300 text-base">{leader.arena_xp || 0}</p>
                                                <p className="text-[9px] uppercase tracking-wider text-indigo-200">XP</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!guild.arena_leaders || guild.arena_leaders.length === 0) && (
                                        <div className="text-center text-indigo-300 text-sm py-4">No arena data yet.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Chat / Activity Feed */}
                    <div className="lg:col-span-2 h-[600px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur">
                            <div className="flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-500" />
                                <h3 className="font-bold text-slate-700 dark:text-slate-200">Guild Hall (Chat & Activity)</h3>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
                            {messages.length === 0 && (
                                <div className="text-center text-slate-400 py-10 text-sm">
                                    No activity yet. Start the conversation!
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={`flex gap-3 ${msg.user_name === auth.user.name ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.user_name === auth.user.name ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {msg.user_name.charAt(0)}
                                    </div>
                                    <div className={`max-w-[75%] space-y-1 ${msg.user_name === auth.user.name ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-400">{msg.user_name}</span>
                                            <span className="text-[9px] text-slate-300">{msg.time}</span>
                                        </div>
                                        <div className={`px-4 py-2 rounded-2xl text-sm ${msg.user_name === auth.user.name
                                            ? 'bg-emerald-600 text-white rounded-tr-none'
                                            : (msg.message.includes('telah menyelesaikan misi')
                                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 w-full'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none')
                                            }`}>
                                            {/* Render markdown-ish bold for system messages */}
                                            {msg.message.includes('**') ? (
                                                <span dangerouslySetInnerHTML={{ __html: msg.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                            ) : msg.message}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Message Guild Hall..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-emerald-500/50 font-medium placeholder-slate-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 hover:scale-105 transition-transform"
                                >
                                    <ArrowRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                {/* Top Up Modal */}
                <Transition appear show={isTopUpOpen} as={React.Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setIsTopUpOpen(false)}>
                        <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                        </Transition.Child>
                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-100 dark:border-slate-800">
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-slate-900 dark:text-white flex items-center gap-2">
                                            <BanknotesIcon className="w-6 h-6 text-teal-500" /> Top Up Guild XP
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Buy XP to fund missions for your members. Rate: 100 XP = Rp 1.000.
                                            </p>
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount (XP)</label>
                                                    <input type="number" min="100" step="100" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" />
                                                </div>
                                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center">
                                                    <span className="text-sm font-medium">Total Price:</span>
                                                    <span className="text-lg font-black text-teal-600 dark:text-teal-400">Rp {Number((topUpAmount / 100) * 1000).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex justify-end gap-3">
                                            <button onClick={() => setIsTopUpOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                                            <button
                                                onClick={() => {
                                                    router.post(route('guilds.buy-xp', guild.id), { amount_xp: topUpAmount }, { onSuccess: () => setIsTopUpOpen(false) });
                                                }}
                                                className="px-4 py-2 text-sm font-bold text-white bg-teal-500 rounded-xl hover:bg-teal-600"
                                            >
                                                Pay & Top Up
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* Wallet Modal */}
                <Transition appear show={isWalletOpen} as={React.Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setIsWalletOpen(false)}>
                        <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                        </Transition.Child>
                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 text-left align-middle shadow-xl transition-all border border-slate-100 dark:border-slate-800">
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-slate-900 dark:text-white flex items-center gap-2">
                                            <CreditCardIcon className="w-6 h-6 text-emerald-500" /> My Wallet
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-center mb-4">
                                                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Redeemable Balance</div>
                                                <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">{user.redeemable_xp || 0} XP</div>
                                                <div className="text-xs text-slate-400 mt-1">≈ Rp {Number(((user.redeemable_xp || 0) / 100) * 1000).toLocaleString()}</div>
                                            </div>

                                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                                Cashout your hard-earned XP to your bank account or e-wallet. Minimum 500 XP.
                                            </p>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">XP to Cashout</label>
                                                    <div className="relative">
                                                        <input type="number" min="100" max={user.redeemable_xp} value={cashoutAmount} onChange={(e) => setCashoutAmount(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">XP</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                                                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
                                                            <option value="">Select Method</option>
                                                            <option value="Bank Transfer">Bank Transfer</option>
                                                            <option value="GoPay">GoPay</option>
                                                            <option value="OVO">OVO</option>
                                                            <option value="Dana">Dana</option>
                                                            <option value="ShopeePay">ShopeePay</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Number</label>
                                                        <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="e.g. 1234567890" className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold" />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account Name</label>
                                                    <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g. Muhammad Arif" className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold" />
                                                </div>

                                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                                        <span>Gross Amount</span>
                                                        <span>Rp {Number((cashoutAmount / 100) * 1000).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-red-500">
                                                        <span>Fee (3%)</span>
                                                        <span>- Rp {Number(((cashoutAmount / 100) * 1000) * 0.03).toLocaleString()}</span>
                                                    </div>
                                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-center">
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Net Receipt</span>
                                                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                                            Rp {Number(((cashoutAmount / 100) * 1000) * 0.97).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs leading-relaxed">
                                                    <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    <p>Proses pencairan membutuhkan waktu <b>2x24 jam kerja</b> untuk verifikasi. Pastikan data rekening benar.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex justify-end gap-3">
                                            <button onClick={() => setIsWalletOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700">Cancel</button>
                                            <button
                                                disabled={!cashoutAmount || cashoutAmount > user.redeemable_xp || !paymentMethod || !accountNumber || !accountName}
                                                onClick={() => {
                                                    router.post(route('xp.cashout'), {
                                                        amount_xp: cashoutAmount,
                                                        payment_method: paymentMethod,
                                                        account_number: accountNumber,
                                                        account_name: accountName
                                                    }, { onSuccess: () => setIsWalletOpen(false) });
                                                }}
                                                className="px-4 py-2 text-sm font-bold text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                                            >
                                                Request Cashout
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

            </div>
        </AuthenticatedLayout>
    );
}
