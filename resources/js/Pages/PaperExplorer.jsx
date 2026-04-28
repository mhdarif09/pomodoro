import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
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
    CpuChipIcon
} from '@heroicons/react/24/outline';

export default function PaperExplorer() {
    const [title, setTitle] = useState('');
    const [graphData, setGraphData] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
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
            })
            .transition()
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

    const handleSearch = async () => {
        if (!title.trim()) return;

        setLoading(true);
        setError(null);
        setSelectedNode(null);

        try {
            const response = await axios.post('/api/paper-explorer/search', {
                title: title.trim()
            }, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            setGraphData(response.data);
            setHistory(prev => [...prev, title.trim()]);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch papers');
        } finally {
            setLoading(false);
        }
    };

    const handleBreadcrumbClick = (index) => {
        const newTitle = history[index];
        setTitle(newTitle);
        setHistory(prev => prev.slice(0, index + 1));
        // Re-search with this title
        setTimeout(() => handleSearch(), 0);
    };

    const handleExploreNode = (nodeTitle) => {
        setTitle(nodeTitle);
        setHistory(prev => [...prev, nodeTitle]);
        setSelectedNode(null);
        setTimeout(() => handleSearch(), 0);
    };

    const selectedNodeClass = (isMobile
        ? 'fixed bottom-0 left-0 right-0 h-[60vh] rounded-t-[20px] border-t border-[#1e1e2e]'
        : 'w-80 border-l border-[#1e1e2e]') + ' bg-[#111118] p-6 overflow-y-auto transition-all duration-300 ease-out';

    return (
        <div>
            <Head title="Paper Explorer" />
            <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" style={{ paddingBottom: 'calc(var(--mobile-bottom-nav-height) + 1rem)' }}>
                <div className="apple-glass rounded-2xl border-white/10 overflow-hidden shadow-xl bg-[#0d0d14]">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <div className="flex items-center gap-4">
                            <CpuChipIcon className="w-8 h-8 text-[#00d4ff]" />
                            <h1 className="text-2xl font-bold font-heading">PaperGraph</h1>
                        </div>
                        {history.length > 0 && (
                            <nav className="flex items-center gap-2 text-sm">
                                {history.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <button
                                            onClick={() => handleBreadcrumbClick(index)}
                                            className="hover:text-[#00d4ff] transition-colors truncate max-w-32 text-sm text-slate-300"
                                        >
                                            {item}
                                        </button>
                                        {index < history.length - 1 && <ChevronRightIcon className="w-4 h-4 text-[#666]" />}
                                    </React.Fragment>
                                ))}
                            </nav>
                        )}
                    </div>

                    <div className="flex min-h-[60vh] gap-6">
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
                                        <p className="text-[#00d4ff]">Analyzing paper connections...</p>
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
                                            className="px-4 py-2 bg-[#00d4ff] text-black rounded-lg hover:bg-[#00d4ff]/80 transition-colors"
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
                                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                                          style={{ backgroundColor: scaleOrdinal(schemeTableau10)(selectedNode.field), color: 'black' }}>
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

                                <h2 className="text-xl font-bold font-heading mb-2">{selectedNode.title}</h2>
                                <p className="text-[#00d4ff] text-sm mb-4">{selectedNode.year}</p>
                                <p className="text-gray-300 text-sm mb-6 leading-relaxed">{selectedNode.abstract}</p>

                                {selectedNode.id !== '0' && (
                                    <div className="mb-6">
                                        <h3 className="text-[#00d4ff] font-bold mb-2">Why connected:</h3>
                                        <p className="text-gray-300 text-sm">
                                            {graphData?.links?.find(l =>
                                                (l.source.id === '0' && l.target.id === selectedNode.id) ||
                                                (l.target.id === '0' && l.source.id === selectedNode.id)
                                            )?.reason || 'Related research area'}
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleExploreNode(selectedNode.title)}
                                    className="w-full py-3 bg-[#00d4ff] text-black font-bold rounded-lg hover:bg-[#00d4ff]/80 transition-colors"
                                >
                                    Explore this paper
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="h-20 border-t border-[#1e1e2e] bg-[#0d0d14] p-4">
                        <div className="max-w-2xl mx-auto flex gap-4">
                            <div className="flex-1 relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Enter paper title..."
                                    className="w-full pl-10 pr-4 py-3 bg-[#111118] border border-[#1e1e2e] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4ff]"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading || !title.trim()}
                                className="px-6 py-3 bg-[#00d4ff] text-black font-bold rounded-lg hover:bg-[#00d4ff]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Explore
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}