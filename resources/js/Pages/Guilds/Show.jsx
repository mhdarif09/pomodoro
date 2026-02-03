import React, { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    UserGroupIcon,
    TrophyIcon,
    ChatBubbleLeftRightIcon,
    ArrowLeftOnRectangleIcon,
    PaperAirplaneIcon,
    FireIcon,
    HashtagIcon,
    SpeakerWaveIcon,
    Cog6ToothIcon,
    MicrophoneIcon,
    PhoneIcon,
    VideoCameraIcon,
    InformationCircleIcon,
    UsersIcon,
    InboxIcon,
    QuestionMarkCircleIcon,
    GiftIcon,
    DocumentTextIcon,
    XMarkIcon,
    ComputerDesktopIcon,
} from '@heroicons/react/24/solid';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PhotoIcon,
    PaperClipIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import Peer from 'peerjs';

export default function GuildShow({ auth, guild, canManage }) {
    const [messages, setMessages] = useState(guild.chats || []);
    const [newMessage, setNewMessage] = useState('');
    const [activeChannel, setActiveChannel] = useState('general'); // 'general', 'dashboard', 'voice-lounge', 'leaderboard'
    const [showRightSidebar, setShowRightSidebar] = useState(true);
    const chatContainerRef = useRef(null);

    // Document Tagging State
    const [showDocPicker, setShowDocPicker] = useState(false);
    const [docSearchQuery, setDocSearchQuery] = useState('');
    const [foundDocs, setFoundDocs] = useState([]);
    const [attachedDoc, setAttachedDoc] = useState(null);

    // Voice Room State
    const [isInCall, setIsInCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // PeerJS Refs
    const localVideoRef = useRef(null);
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const [peers, setPeers] = useState({}); // { peerId: { call: CallObj, stream: MediaStream, userName: 'Name' } }
    const peersRef = useRef({}); // Ref version for callbacks
    const pollingIntervalRef = useRef(null);

    // Sync state with ref
    useEffect(() => {
        peersRef.current = peers;
    }, [peers]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            leaveRoom();
        };
    }, []);

    const leaveRoom = async () => {
        // Stop polling
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

        // Stop tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // Close calls
        Object.values(peersRef.current).forEach(p => p.call.close());
        setPeers({});

        // Destroy Peer
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }

        // Notify Backend
        try {
            await axios.post(route('api.voice.leave'), { guild_id: guild.id });
        } catch (e) { /* ignore */ }

        setIsInCall(false);
        setIsVideoOn(false);
        setIsMuted(false);
    };

    const getLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            // Initial toggle state
            stream.getVideoTracks().forEach(t => t.enabled = false); // Start with video off
            stream.getAudioTracks().forEach(t => t.enabled = true);

            return stream;
        } catch (err) {
            console.error("Failed to get local stream", err);
            return null;
        }
    };

    const joinVoiceRoom = async () => {
        setIsInCall(true);
        const stream = await getLocalStream();
        if (!stream) return;

        const peer = new Peer(undefined, {
            debug: 2
        });

        peer.on('open', async (id) => {
            console.log('My peer ID is: ' + id);
            // Register with backend
            await axios.post(route('api.voice.join'), {
                guild_id: guild.id,
                peer_id: id
            });

            // Start Polling for peers
            startPeerPolling(peer, stream, id);
        });

        peer.on('call', (call) => {
            console.log('Incoming call from:', call.peer);
            call.answer(stream); // Answer with our stream

            call.on('stream', (remoteStream) => {
                console.log('Received remote stream');
                addPeer(call.peer, call, remoteStream);
            });

            call.on('close', () => {
                removePeer(call.peer);
            });
        });

        peerRef.current = peer;
    };

    const startPeerPolling = (peer, stream, myPeerId) => {
        const poll = async () => {
            try {
                const res = await axios.get(route('api.voice.peers'), { params: { guild_id: guild.id } });
                const activeSessionList = res.data; // [{ peer_id, user_name, ... }]

                // 1. Connect to new peers
                activeSessionList.forEach(session => {
                    if (session.peer_id !== myPeerId && !peersRef.current[session.peer_id]) {
                        console.log('Calling new peer:', session.peer_id);
                        const call = peer.call(session.peer_id, stream);

                        call.on('stream', (remoteStream) => {
                            addPeer(session.peer_id, call, remoteStream, session.user_name);
                        });

                        call.on('close', () => {
                            removePeer(session.peer_id);
                        });

                        // Temporarily add with null stream until connected
                        addPeer(session.peer_id, call, null, session.user_name);
                    }
                });

                // 2. Cleanup disconnected peers (optional if we trust p2p close event, but good for safety)
                // (Omitted for brevity, relying on P2P close for now)

            } catch (e) {
                console.error("Polling error", e);
            }
        };

        poll(); // Immediate
        pollingIntervalRef.current = setInterval(poll, 5000);
    };

    const addPeer = (peerId, call, stream, userName = 'Unknown') => {
        setPeers(prev => ({
            ...prev,
            [peerId]: { call, stream, userName: userName !== 'Unknown' ? userName : (prev[peerId]?.userName || 'Guest') }
        }));
    };

    const removePeer = (peerId) => {
        setPeers(prev => {
            const newPeers = { ...prev };
            delete newPeers[peerId];
            return newPeers;
        });
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const params = !isVideoOn;
            localStreamRef.current.getVideoTracks().forEach(t => t.enabled = params);
            setIsVideoOn(params);
        }
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const params = !isMuted;
            localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !params);
            setIsMuted(params);
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            // Stop Screen Share -> Revert to Camera
            if (localStreamRef.current) {
                const tracks = localStreamRef.current.getVideoTracks();
                tracks.forEach(t => t.stop()); // Stop screen track
            }

            // Get Camera again
            const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const videoTrack = cameraStream.getVideoTracks()[0];

            // Replace track in local stream
            if (localStreamRef.current) {
                const sender = localStreamRef.current.getVideoTracks()[0];
                localStreamRef.current.removeTrack(sender);
                localStreamRef.current.addTrack(videoTrack);
            }

            // Replace track in peer connections
            Object.values(peersRef.current).forEach(p => {
                const sender = p.call.peerConnection.getSenders().find(s => s.track.kind === 'video');
                if (sender) sender.replaceTrack(videoTrack);
            });

            if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
            setIsScreenSharing(false);
            setIsVideoOn(true); // Camera is back on

        } else {
            // Start Screen Share
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];

                // Handle system stop (user clicks "Stop Sharing" in browser UI)
                screenTrack.onended = () => {
                    if (isScreenSharing) toggleScreenShare(); // Revert to camera
                };

                // Replace track in local stream
                if (localStreamRef.current) {
                    const sender = localStreamRef.current.getVideoTracks()[0];
                    sender.stop(); // Stop camera
                    localStreamRef.current.removeTrack(sender);
                    localStreamRef.current.addTrack(screenTrack);
                }

                // Replace track in peer connections
                Object.values(peersRef.current).forEach(p => {
                    const sender = p.call.peerConnection.getSenders().find(s => s.track.kind === 'video');
                    if (sender) sender.replaceTrack(screenTrack);
                });

                if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
                setIsScreenSharing(true);
                setIsVideoOn(true); // Video technically on
            } catch (e) {
                console.error("Screen share cancelled", e);
            }
        }
    };

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, activeChannel]);

    // Handle Document Search
    useEffect(() => {
        const searchDocs = async () => {
            if (docSearchQuery.length < 2) {
                setFoundDocs([]);
                return;
            }
            try {
                const res = await axios.get(route('api.documents.search'), { params: { query: docSearchQuery } });
                setFoundDocs(res.data.documents);
            } catch (err) {
                console.error("Doc search failed", err);
            }
        };
        const timeoutId = setTimeout(searchDocs, 300);
        return () => clearTimeout(timeoutId);
    }, [docSearchQuery]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !attachedDoc) return;

        let messageContent = newMessage;
        if (attachedDoc) {
            const docLink = `[📄 Doc: ${attachedDoc.title}](/dashboard/docs/${attachedDoc.id})`;
            messageContent = messageContent ? `${messageContent}\n\n${docLink}` : docLink;
        }

        try {
            // Optimistic update
            const tempId = Date.now();
            const msgObj = {
                id: tempId,
                user: auth.user,
                message: messageContent,
                created_at: new Date().toISOString()
            };
            setMessages([...messages, msgObj]); // Add to bottom

            await axios.post(route('api.guilds.chat.send', guild.id), {
                message: messageContent
            });

            setNewMessage('');
            setAttachedDoc(null);
            setShowDocPicker(false);
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    // Calculate progress
    const weeklyTarget = 5000;
    const progressPercent = Math.min((guild.weekly_xp / weeklyTarget) * 100, 100);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();

        if (isToday) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
        return date.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });
    };

    return (
        <AuthenticatedLayout header={null}>
            <Head title={`Guild: ${guild.name}`} />

            {/* App Theme Layout (Glass/Indigo/Slate) */}
            <div className="flex h-[calc(100vh-65px)] bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">

                {/* 1. LEFT SIDEBAR (Channels) */}
                <div className="w-[260px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0 z-20">
                    {/* Guild Header */}
                    <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-lg flex-shrink-0">
                                {guild.emblem}
                            </div>
                            <h1 className="font-bold text-slate-800 dark:text-white truncate">{guild.name}</h1>
                        </div>
                        {canManage && <Cog6ToothIcon className="w-5 h-5 text-slate-400 hover:text-indigo-500 cursor-pointer" />}
                    </div>

                    {/* Channels List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                        <div>
                            <div className="px-2 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Dashboard</span>
                            </div>
                            <button
                                onClick={() => setActiveChannel('dashboard')}
                                className={`w-full flex items-center px-3 py-2.5 rounded-xl group transition-all mb-1 ${activeChannel === 'dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                            >
                                <InformationCircleIcon className={`w-5 h-5 mr-3 ${activeChannel === 'dashboard' ? 'text-indigo-500' : 'text-slate-400'}`} />
                                <span className="truncate">Overview</span>
                            </button>
                            <button
                                onClick={() => setActiveChannel('leaderboard')}
                                className={`w-full flex items-center px-3 py-2.5 rounded-xl group transition-all mb-1 ${activeChannel === 'leaderboard' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                            >
                                <TrophyIcon className={`w-5 h-5 mr-3 ${activeChannel === 'leaderboard' ? 'text-amber-500' : 'text-slate-400'}`} />
                                <span className="truncate">Leaderboard</span>
                            </button>
                        </div>

                        <div>
                            <div className="flex items-center justify-between px-2 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Team Chat</span>
                                <div className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer">
                                    <PlusIcon className="w-3 h-3 text-slate-400" />
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveChannel('general')}
                                className={`w-full flex items-center px-3 py-2.5 rounded-xl group transition-all mb-1 ${activeChannel === 'general' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                            >
                                <HashtagIcon className={`w-5 h-5 mr-3 ${activeChannel === 'general' ? 'text-indigo-500' : 'text-slate-400'}`} />
                                <span className="truncate">General</span>
                            </button>
                            <button
                                onClick={() => setActiveChannel('voice-lounge')}
                                className={`w-full flex items-center px-3 py-2.5 rounded-xl group transition-all mb-1 ${activeChannel === 'voice-lounge' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                            >
                                <SpeakerWaveIcon className={`w-5 h-5 mr-3 ${activeChannel === 'voice-lounge' ? 'text-green-500' : 'text-slate-400 group-hover:text-green-500'}`} />
                                <span className="truncate">Lounge Room</span>
                            </button>
                        </div>
                    </div>

                    {/* User Mini Profile */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-teal-500/20">
                                    {auth.user.name.substring(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-slate-700 dark:text-slate-200 text-xs truncate">{auth.user.name}</div>
                                    <div className="text-[10px] text-slate-400 truncate">Online</div>
                                </div>
                            </div>
                            <div className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-colors text-slate-400">
                                <MicrophoneIcon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 min-w-0 relative z-10">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Channel Header */}
                    <div className="h-16 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between px-6 flex-shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex items-center justify-center text-slate-400">
                                {activeChannel === 'general' ? <HashtagIcon className="w-4 h-4" /> :
                                    activeChannel === 'dashboard' ? <InformationCircleIcon className="w-4 h-4" /> :
                                        activeChannel === 'voice-lounge' ? <SpeakerWaveIcon className="w-4 h-4" /> :
                                            <TrophyIcon className="w-4 h-4" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white capitalize">
                                    {activeChannel === 'general' ? 'general' :
                                        activeChannel === 'dashboard' ? 'Overview' :
                                            activeChannel === 'leaderboard' ? 'Leaderboard' :
                                                activeChannel === 'voice-lounge' ? 'Lounge Room' : activeChannel}
                                </h3>
                                {activeChannel === 'general' && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Talk about anything</p>}
                                {activeChannel === 'voice-lounge' && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Voice & Video Collaboration</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative hidden md:block">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 pl-9 pr-3 text-sm w-48 transition-all focus:w-64 focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                />
                                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>
                            <button
                                onClick={() => setShowRightSidebar(!showRightSidebar)}
                                className={`p-2 rounded-xl transition-colors ${showRightSidebar ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <UsersIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* CHANNEL CONTENT SWITCHER */}
                    {activeChannel === 'voice-lounge' ? (
                        /* VOICE ROOM VIEW */
                        <div className="flex-1 p-6 relative flex flex-col items-center justify-center">
                            {!isInCall ? (
                                <div className="text-center space-y-4">
                                    <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                        <SpeakerWaveIcon className="w-12 h-12 text-indigo-500" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Ready to join?</h2>
                                    <p className="text-slate-500 dark:text-slate-400">Join the Lounge to talk, share screen, or hang out.</p>
                                    <button
                                        onClick={() => joinVoiceRoom()}
                                        className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-500/30 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                                    >
                                        <PhoneIcon className="w-5 h-5" />
                                        Join Voice Room
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col gap-4">
                                    {/* Video Grid */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* My Video */}
                                        <div className="bg-black/80 rounded-2xl overflow-hidden relative shadow-2xl aspect-video border border-slate-800 group">
                                            <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover transform scale-x-[-1] ${!isVideoOn ? 'hidden' : ''}`} />
                                            {!isVideoOn && (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-white">
                                                        {auth.user.name.substring(0, 2)}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg backdrop-blur text-white text-sm font-medium flex items-center gap-2">
                                                <span>{auth.user.name} (You)</span>
                                                {isMuted && <MicrophoneIcon className="w-3 h-3 text-red-500" />}
                                            </div>
                                        </div>

                                        {/* Other Participants (Active) */}
                                        {Object.entries(peers).map(([id, peerObj]) => (
                                            <div key={id} className="bg-slate-800 rounded-2xl overflow-hidden relative shadow-2xl aspect-video border border-slate-700">
                                                {peerObj.stream ? (
                                                    <video
                                                        ref={el => { if (el) el.srcObject = peerObj.stream }}
                                                        autoPlay
                                                        playsInline
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                                                        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold text-white animate-pulse">
                                                            P
                                                        </div>
                                                        <span className="text-xs text-slate-400">Connecting...</span>
                                                    </div>
                                                )}

                                                <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg backdrop-blur text-white text-sm font-medium">
                                                    {peerObj.userName || 'Unknown'}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Offline Placeholders (if few peers) */}
                                        {Object.keys(peers).length === 0 && (
                                            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-slate-500 aspect-video">
                                                <p className="text-sm font-medium">Waiting for others to join...</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Controls Bar */}
                                    <div className="h-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-4 px-8">
                                        <button
                                            onClick={toggleMute}
                                            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                        >
                                            <MicrophoneIcon className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={toggleVideo}
                                            className={`p-4 rounded-full transition-all ${!isVideoOn ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                        >
                                            <VideoCameraIcon className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={toggleScreenShare}
                                            className={`p-4 rounded-full transition-all ${isScreenSharing ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                        >
                                            <ComputerDesktopIcon className="w-6 h-6" />
                                        </button>
                                        <div className="w-px h-8 bg-slate-300 dark:bg-slate-600 mx-2"></div>
                                        <button
                                            onClick={leaveRoom}
                                            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
                                        >
                                            Leave
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeChannel === 'general' ? (
                        /* CHAT VIEW */
                        <>
                            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar flex flex-col relative z-10" ref={chatContainerRef}>
                                {/* Welcome Message */}
                                <div className="mt-auto mb-8 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-3xl p-8 text-center border border-indigo-100 dark:border-indigo-900/50">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/10">
                                        <HashtagIcon className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to #general!</h1>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                        This is the start of the #general channel. Coordinate missions, share strategies, and support your guildmates!
                                    </p>
                                </div>

                                {/* Message Stream */}
                                <div className="space-y-6 pb-4">
                                    {messages.map((msg, idx) => {
                                        const isMe = msg.user.id === auth.user.id;
                                        // Simple regex to parse Markdown link for doc
                                        const docMatch = msg.message.match(/\[📄 Doc: (.*?)\]\((.*?)\)/);
                                        const displayMessage = msg.message.replace(/\[📄 Doc: .*?\]\(.*?\)/, '').trim();

                                        return (
                                            <div key={msg.id || idx} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                <div className="flex-shrink-0">
                                                    {msg.user.avatar ? (
                                                        <img src={msg.user.avatar} className="w-10 h-10 rounded-2xl object-cover shadow-sm" />
                                                    ) : (
                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-sm shadow-sm ${isMe ? 'bg-indigo-600' : 'bg-slate-400 dark:bg-slate-700'}`}>
                                                            {msg.user.name.substring(0, 2)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className="flex items-center gap-2 mb-1 px-1">
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{msg.user.name}</span>
                                                        <span className="text-[10px] text-slate-400">{formatTime(msg.created_at)}</span>
                                                    </div>

                                                    <div className={`rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-sm'}`}>
                                                        {displayMessage && <p className="whitespace-pre-wrap">{displayMessage}</p>}

                                                        {/* Render Doc Attachment if found */}
                                                        {docMatch && (
                                                            <Link
                                                                href={docMatch[2]}
                                                                className={`mt-2 flex items-center gap-3 p-3 rounded-xl border transition-all ${isMe ? 'bg-indigo-700 border-indigo-500 hover:bg-indigo-800 text-white' : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                                                            >
                                                                <div className={`p-2 rounded-lg ${isMe ? 'bg-indigo-500' : 'bg-white dark:bg-slate-800'}`}>
                                                                    <DocumentTextIcon className={`w-5 h-5 ${isMe ? 'text-white' : 'text-indigo-500'}`} />
                                                                </div>
                                                                <div className="flex-1 min-w-0 text-left">
                                                                    <div className={`font-bold text-xs truncate ${isMe ? 'text-indigo-100' : 'text-slate-900 dark:text-white'}`}>Document Attached</div>
                                                                    <div className={`font-medium truncate text-xs opacity-90 ${isMe ? 'text-white' : 'text-indigo-600 dark:text-indigo-300'}`}>{docMatch[1]}</div>
                                                                </div>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="px-6 pb-6 pt-2 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-20 relative">

                                {/* Document Picker Popover */}
                                {showDocPicker && (
                                    <div className="absolute bottom-full left-6 mb-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in slide-in-from-bottom-2">
                                        <div className="flex items-center justify-between px-2 mb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Attach Document</span>
                                            <button onClick={() => setShowDocPicker(false)}><XMarkIcon className="w-4 h-4 text-slate-400" /></button>
                                        </div>
                                        <input
                                            type="text"
                                            autoFocus
                                            placeholder="Search docs..."
                                            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 mb-2 focus:ring-indigo-500"
                                            value={docSearchQuery}
                                            onChange={e => setDocSearchQuery(e.target.value)}
                                        />
                                        <div className="max-h-48 overflow-y-auto space-y-1">
                                            {foundDocs.length === 0 ? (
                                                <div className="text-center py-4 text-slate-400 text-xs">No documents found</div>
                                            ) : (
                                                foundDocs.map(doc => (
                                                    <button
                                                        key={doc.id}
                                                        onClick={() => { setAttachedDoc(doc); setShowDocPicker(false); }}
                                                        className="w-full text-left flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg group"
                                                    >
                                                        <DocumentTextIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{doc.title}</div>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Attached Doc Preview */}
                                {attachedDoc && (
                                    <div className="absolute bottom-full left-6 mb-2 flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-700 text-xs font-bold animate-in slide-in-from-bottom-2">
                                        <DocumentTextIcon className="w-4 h-4" />
                                        <span>{attachedDoc.title}</span>
                                        <button onClick={() => setAttachedDoc(null)} className="ml-2 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5"><XMarkIcon className="w-3 h-3" /></button>
                                    </div>
                                )}

                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 transition-all focus-within:ring-2 focus-within:ring-indigo-500/50">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowDocPicker(!showDocPicker)}
                                            className={`p-2 rounded-xl transition-colors ${showDocPicker || attachedDoc ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                            title="Attach Document"
                                        >
                                            <PaperClipIcon className="w-6 h-6" />
                                        </button>
                                        <form onSubmit={handleSendMessage} className="flex-1">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                placeholder={`Message #general...`}
                                                className="w-full border-none bg-transparent focus:ring-0 text-slate-800 dark:text-white placeholder-slate-400 font-medium py-3"
                                            />
                                            <button type="submit" hidden></button>
                                        </form>
                                        <div className="flex items-center gap-1 pr-2 border-l border-slate-100 dark:border-slate-700 pl-2">
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim() && !attachedDoc}
                                                className="p-2 bg-indigo-500 text-white rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-600 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                                            >
                                                <PaperAirplaneIcon className="w-5 h-5 -ml-0.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* DASHBOARD / STATS VIEW (Existing) */
                        <div className="flex-1 p-8 overflow-y-auto z-10">
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="text-center mb-12 relative">
                                    <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-[2.5rem] mx-auto flex items-center justify-center text-7xl mb-6 shadow-2xl shadow-indigo-500/20 ring-4 ring-white dark:ring-slate-700 relative z-10">
                                        {guild.emblem}
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -z-0"></div>
                                    <h2 className="text-4xl font-[900] text-slate-900 dark:text-white mb-2">{guild.name}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">{guild.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none border border-slate-100 dark:border-slate-700 text-center group hover:-translate-y-1 transition-transform">
                                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Total XP</h3>
                                        <p className="text-4xl text-indigo-600 dark:text-indigo-400 font-[900] tracking-tight">{guild.total_xp.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none border border-slate-100 dark:border-slate-700 text-center group hover:-translate-y-1 transition-transform">
                                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Members</h3>
                                        <p className="text-4xl text-teal-500 font-[900] tracking-tight">{guild.members.length}</p>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none border border-slate-100 dark:border-slate-700 text-center group hover:-translate-y-1 transition-transform">
                                        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Rank</h3>
                                        <p className="text-4xl text-amber-500 font-[900] tracking-tight">#{guild.rank}</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <FireIcon className="w-64 h-64 -mr-16 -mt-16" />
                                    </div>

                                    <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                                            <FireIcon className="w-6 h-6" />
                                        </div>
                                        Weekly Mission Progress
                                    </h3>

                                    <div className="relative pt-2 z-10">
                                        <div className="flex mb-3 items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold py-1 px-3 uppercase rounded-full text-indigo-700 bg-indigo-100">
                                                    XP Goal
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                    {Math.round(progressPercent)}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-slate-100 dark:bg-slate-700">
                                            <div style={{ width: `${progressPercent}%` }} className="shadow-lg shadow-indigo-500/30 flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"></div>
                                        </div>
                                        <p className="text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                                            {guild.weekly_xp.toLocaleString()} / {weeklyTarget.toLocaleString()} XP collected this week
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. RIGHT SIDEBAR (Members & Status) */}
                {showRightSidebar && (
                    <div className="w-[280px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-l border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0 z-20 animate-in slide-in-from-right duration-300">
                        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">

                            {/* Mission Card (Pinned) */}
                            <div className="mb-8 p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                                <h3 className="text-xs font-extrabold uppercase mb-3 flex items-center tracking-wider opacity-90">
                                    <FireIcon className="w-4 h-4 mr-1.5" />
                                    Weekly Goal
                                </h3>

                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-2xl font-[900]">{Math.round(progressPercent)}%</span>
                                    <span className="text-xs font-bold opacity-80 mb-1.5">{guild.weekly_xp} XP</span>
                                </div>

                                <div className="w-full bg-black/20 rounded-full h-2 mb-2 backdrop-blur-sm">
                                    <div className="bg-white h-2 rounded-full shadow-sm" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Members</h3>
                                <div className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-500 dark:text-slate-300">
                                    {guild.members.length}
                                </div>
                            </div>

                            <div className="space-y-2">
                                {guild.members.map(member => (
                                    <div key={member.id} className="flex items-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer group transition-all hover:scale-[1.02]">
                                        <div className="relative mr-4">
                                            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
                                                {member.name.substring(0, 2)}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <div className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {member.name}
                                                </div>
                                                {member.role === 'leader' && <TrophyIcon className="w-3 h-3 text-amber-500" />}
                                            </div>
                                            <div className="text-xs text-slate-400 group-hover:text-slate-500">Level {member.level}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
