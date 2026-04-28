import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
    forceCollide,
    zoom,
    select,
    scaleOrdinal,
    schemeTableau10
} from 'd3';
import {
    MagnifyingGlassIcon,
    ArrowPathIcon,
    XMarkIcon,
    ChevronRightIcon,
    CpuChipIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    LinkIcon,
    DocumentTextIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

export default function PaperExplorer() {
    const [title, setTitle] = useState('');
    const [graphData, setGraphData] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);

    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const simulationRef = useRef(null);

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // D3 Graph setup
    useEffect(() => {
        if (!graphData || !svgRef.current) return;

        const svg = select(svgRef.current);
        svg.selectAll('*').remove();

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        const colorScale = scaleOrdinal(schemeTableau10);

        // Create simulation
        const simulation = forceSimulation(graphData.nodes)
            .force('link', forceLink(graphData.links)
                .id(d => d.id)
                .distance(d => 80 + (1 - d.strength) * 120)
            )
            .force('charge', forceManyBody().strength(-300))
            .force('center', forceCenter(width / 2, height / 2))
            .force('collide', forceCollide().radius(d => d.id === '0' ? 38 : 8 + d.relevance * 16 + 10));

        simulationRef.current = simulation;

        // Create zoom behavior
        const zoomBehavior = zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoomBehavior);

        const g = svg.append('g');

        // Links
        const link = g.append('g')
            .selectAll('line')
            .data(graphData.links)
            .enter().append('line')
            .attr('stroke', '#666')
            .attr('stroke-opacity', 0.4)
            .attr('stroke-width', d => d.strength * 3);

        // Nodes
        const node = g.append('g')
            .selectAll('circle')
            .data(graphData.nodes)
            .enter().append('circle')
            .attr('r', d => d.id === '0' ? 28 : 8 + d.relevance * 16)
            .attr('fill', d => colorScale(d.field))
            .attr('stroke', d => d.id === '0' ? '#00d4ff' : '#fff')
            .attr('stroke-width', d => d.id === '0' ? 3 : 2)
            .style('cursor', 'pointer')
            .style('opacity', 0)
            .on('click', (event, d) => {
                setSelectedNode(d);
                // Highlight connected edges
                link.attr('stroke-opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1);
            });

        node.transition()
            .duration(600)
            .style('opacity', 1);

        // Root node pulse
        if (graphData.nodes.find(n => n.id === '0')) {
            node.filter(d => d.id === '0')
                .append('animate')
                .attr('attributeName', 'stroke-width')
                .attr('values', '3;6;3')
                .attr('dur', '2s')
                .attr('repeatCount', 'indefinite');
        }

        // Simulation tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });

        // Resize observer
        const resizeObserver = new ResizeObserver(() => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            simulation.force('center', forceCenter(newWidth / 2, newHeight / 2));
            simulation.restart();
        });
        resizeObserver.observe(container);

        return () => {
            simulation.stop();
            resizeObserver.disconnect();
        };
    }, [graphData]);

    const runSearch = async (query, shouldPushHistory = true) => {
        const safeQuery = query?.trim();
        if (!safeQuery) return;

        setLoading(true);
        setError(null);
        setSelectedNode(null);

        try {
            const response = await axios.post('/api/paper-explorer/search', {
                title: safeQuery
            }, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            setGraphData(response.data);
            if (shouldPushHistory) {
                setHistory(prev => prev[prev.length - 1] === safeQuery ? prev : [...prev, safeQuery]);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch papers');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => runSearch(title, true);

    const handleBreadcrumbClick = (index) => {
        const newTitle = history[index];
        setTitle(newTitle);
        setHistory(prev => prev.slice(0, index + 1));
        runSearch(newTitle, false);
    };

    const handleExploreNode = (nodeTitle) => {
        setTitle(nodeTitle);
        setSelectedNode(null);
        runSearch(nodeTitle, true);
    };

    const selectedNodeClass = (isMobile
        ? 'fixed bottom-0 left-0 right-0 h-[60vh] rounded-t-[20px] border-t border-slate-200 dark:border-slate-700'
        : 'w-[360px] border-l border-slate-200 dark:border-slate-700') + ' bg-white dark:bg-slate-900 p-6 overflow-y-auto transition-all duration-300 ease-out';

    return (
        <AuthenticatedLayout header={<h2 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight">Paper Explorer</h2>}>
            <Head title="Paper Explorer" />
            <div className="py-3 sm:py-5 px-2 sm:px-4 lg:px-5 max-w-[1680px] mx-auto" style={{ paddingBottom: 'calc(var(--mobile-bottom-nav-height) + 1rem)' }}>
                <div className="apple-glass rounded-2xl border-white/10 overflow-hidden shadow-xl bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-4">
                            <CpuChipIcon className="w-8 h-8 text-emerald-500" />
                            <h1 className="text-xl sm:text-2xl font-bold">PaperGraph</h1>
                        </div>
                        {history.length > 0 && (
                            <nav className="flex items-center gap-2 text-sm">
                                {history.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <button
                                            onClick={() => handleBreadcrumbClick(index)}
                                            className="hover:text-emerald-500 transition-colors truncate max-w-32 text-sm text-slate-500 dark:text-slate-300"
                                        >
                                            {item}
                                        </button>
                                        {index < history.length - 1 && <ChevronRightIcon className="w-4 h-4 text-slate-400" />}
                                    </React.Fragment>
                                ))}
                            </nav>
                        )}
                    </div>

                    <div className="flex min-h-[60vh] gap-0">
                        <div ref={containerRef} className={`flex-1 relative p-6 ${isMobile ? 'w-full' : ''}`} style={{minHeight: isMobile ? '40vh' : '60vh'}}>
                            <svg
                                ref={svgRef}
                                className="w-full h-[60vh] md:h-[70vh]"
                                style={{ background: 'transparent' }}
                            />

                            {loading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="text-center">
                                        <ArrowPathIcon className="w-8 h-8 animate-spin text-[#00d4ff] mx-auto mb-4" />
                                        <p className="text-emerald-500 font-semibold">Analyzing paper connections...</p>
                                        <div className="mt-4 flex justify-center gap-2 relative" style={{height: 80}}>
                                            {Array.from({ length: 8 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-4 h-4 bg-gray-600 rounded-full animate-pulse"
                                                    style={{
                                                        animationDelay: `${i * 0.1}s`,
                                                        position: 'absolute',
                                                        left: `${20 + Math.random() * 60}%`,
                                                        top: `${20 + Math.random() * 60}%`
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-red-400 mb-4">{error}</p>
                                        <button
                                            onClick={handleSearch}
                                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedNode && (
                            <div className={selectedNodeClass} style={isMobile ? { bottom: 'var(--mobile-bottom-nav-height)', height: 'calc(60vh - var(--mobile-bottom-nav-height))' } : {}}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
                                          style={{ backgroundColor: scaleOrdinal(schemeTableau10)(selectedNode.field) }}>
                                        {selectedNode.field}
                                    </span>
                                    {!isMobile && (
                                        <button
                                            onClick={() => setSelectedNode(null)}
                                            className="p-1 hover:bg-white/10 rounded"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{selectedNode.title}</h2>
                                <p className="text-emerald-500 text-sm mb-2">{selectedNode.year || '-'}</p>
                                {selectedNode.venue && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{selectedNode.venue}</p>
                                )}
                                {selectedNode.authors?.length > 0 && (
                                    <div className="flex items-start gap-2 mb-4">
                                        <UserGroupIcon className="w-4 h-4 mt-0.5 text-slate-400" />
                                        <p className="text-sm text-slate-600 dark:text-slate-300">{selectedNode.authors.join(', ')}</p>
                                    </div>
                                )}
                                <div className="flex items-start gap-2 mb-6">
                                    <DocumentTextIcon className="w-4 h-4 mt-0.5 text-slate-400" />
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedNode.abstract || 'No abstract available.'}</p>
                                </div>

                                {selectedNode.id !== '0' && (
                                    <div className="mb-6">
                                        <h3 className="text-emerald-500 font-bold mb-2">Why connected:</h3>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm">
                                            {graphData?.links?.find(l =>
                                                (l.source.id === '0' && l.target.id === selectedNode.id) ||
                                                (l.target.id === '0' && l.source.id === selectedNode.id)
                                            )?.reason || 'Related research area'}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => handleExploreNode(selectedNode.title)}
                                        className="w-full py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                    >
                                        Explore this paper
                                    </button>
                                    {selectedNode.paper_url && (
                                        <a
                                            href={selectedNode.paper_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <LinkIcon className="w-4 h-4" />
                                            Open Source
                                        </a>
                                    )}
                                    {selectedNode.pdf_url && (
                                        <>
                                            <a
                                                href={selectedNode.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <LinkIcon className="w-4 h-4" />
                                                Open PDF
                                            </a>
                                            <button
                                                onClick={() => setPreviewUrl(selectedNode.pdf_url)}
                                                className="w-full py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                                Preview PDF
                                            </button>
                                            <a
                                                href={selectedNode.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download
                                                className="w-full py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                                Download PDF
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-20 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                        <div className="max-w-2xl mx-auto flex gap-4">
                            <div className="flex-1 relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Enter paper title..."
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading || !title.trim()}
                                className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Explore
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {previewUrl && (
                <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-6xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="h-12 px-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">PDF Preview</span>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <XMarkIcon className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <iframe src={previewUrl} title="Paper preview" className="w-full h-[calc(85vh-3rem)]" />
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
