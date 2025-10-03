import { useState, useEffect, useRef } from 'react';
import { 
  RocketLaunchIcon, SparklesIcon, BoltIcon, ShieldCheckIcon, ChartBarIcon, 
  UserGroupIcon, CheckIcon, ArrowRightIcon, StarIcon, CpuChipIcon, CodeBracketIcon
} from '@heroicons/react/24/outline';

// --- Helper Components for Advanced UI ---

const CursorLight = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-30 transition duration-300"
      style={{
        background: `radial-gradient(600px at ${position.x}px ${position.y}px, rgba(34, 197, 94, 0.1), transparent 80%)`
      }}
    />
  );
};

const StatCounter = ({ end, duration = 2000, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const targetRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                let start = 0;
                const increment = end / (duration / 16);
                const timer = setInterval(() => {
                    start += increment;
                    if (start >= end) {
                        setCount(end);
                        clearInterval(timer);
                    } else {
                        setCount(Math.ceil(start));
                    }
                }, 16);
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }

        return () => observer.disconnect();
    }, [end, duration]);
    
    return <span ref={targetRef}>{count.toLocaleString()}{suffix}</span>;
};

// --- Main Page Component ---

export default function HyperModernLandingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const heroMockupRef = useRef(null);

  useEffect(() => {
    const el = heroMockupRef.current;
    if (!el) return;

    const onMouseMove = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      el.style.setProperty('--rotateX', `${-y * 10}deg`);
      el.style.setProperty('--rotateY', `${x * 10}deg`);
    };

    const onMouseLeave = () => {
      el.style.setProperty('--rotateX', '0deg');
      el.style.setProperty('--rotateY', '0deg');
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const features = [
    { icon: <BoltIcon className="h-8 w-8" />, title: 'AI-Powered Journaling', description: 'Unlock insights from your daily experiences with an AI that understands you.', size: 'large' },
    { icon: <ShieldCheckIcon className="h-8 w-8" />, title: 'Intelligent Pomodoro', description: 'Conquer goals with a focus timer that adapts to your workflow.' },
    { icon: <SparklesIcon className="h-8 w-8" />, title: 'PDF Intelligence', description: 'Instantly extract key insights and summaries from any PDF.' },
    { icon: <ChartBarIcon className="h-8 w-8" />, title: 'Dynamic Goal Mapping', description: 'Visualize your dreams and transform them into achievable milestones.', size: 'large' },
    { icon: <UserGroupIcon className="h-8 w-8" />, title: 'Community Alliances', description: 'Join forces with like-minded achievers.' },
    { icon: <RocketLaunchIcon className="h-8 w-8" />, title: 'Learning Expeditions', description: 'Embark on curated learning paths to level up.' }
  ];

  const testimonials = [
    { quote: "This platform completely transformed how I approach my goals. The AI journaling feature is like having a personal coach available 24/7.", name: "Sarah Chen", role: "Product Designer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", rating: 5},
    { quote: "The Pomodoro timer with AI insights helped me finish my thesis 2 weeks early. I'm more focused than ever before!", name: "Marcus Johnson", role: "PhD Candidate", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", rating: 5},
    { quote: "Finally, a productivity tool that understands me. The community support is incredible, and I've achieved goals I thought were impossible.", name: "Priya Sharma", role: "Entrepreneur", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80", rating: 5}
  ];

  const pricingPlans = [
    { plan: 'Explorer', price: { monthly: 'Free', yearly: 'Free' }, features: ['AI Journaling (10 entries/month)', 'Basic Pomodoro Timer', 'Goal Tracking (3 goals)', 'Community Access'] },
    { plan: 'Navigator', price: { monthly: '$12', yearly: '$120' }, features: ['Unlimited AI Journaling', 'Advanced Pomodoro Analytics', 'Unlimited Goals', 'PDF Intelligence (50/month)', 'Priority Support'], highlighted: true },
    { plan: 'Captain', price: { monthly: '$29', yearly: '$280' }, features: ['Everything in Navigator', 'Team Collaboration (5 members)', 'Unlimited PDF Processing', 'Advanced AI Insights'], comingSoon: true }
  ];

  const GlowingCard = ({ children, className = '', large = false }) => (
    <div className={`relative p-px rounded-3xl bg-white/5 group ${className} ${large ? 'lg:col-span-2' : ''}`}>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
      <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-[23px] h-full p-8">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans antialiased overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-repeat opacity-[0.03]"></div>
      <CursorLight />
      
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-lg bg-gray-950/50 border-b border-white/10">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Sarang<span className="text-white font-light">Tumbuh</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-gray-300 hover:text-white transition duration-300">Features</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition duration-300">Testimonials</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition duration-300">Pricing</a>
          </div>
          <button className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105">
            Get Started
          </button>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="pt-48 pb-20 px-6 text-center" style={{ perspective: '2000px' }}>
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Engineer Your<br/>
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Personal Growth
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12">
              An intelligent ecosystem to organize your mind, supercharge your focus, and achieve what once seemed impossible.
            </p>
            <div className="flex justify-center gap-4">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105">
                <span className="flex items-center gap-2">Start Free <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
              </button>
            </div>
          </div>
          <div 
            ref={heroMockupRef}
            className="relative mt-20 max-w-5xl mx-auto transition-transform duration-100 ease-out" 
            style={{ transform: 'rotateX(var(--rotateX)) rotateY(var(--rotateY))', transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 bg-white/10 rounded-2xl blur-2xl"></div>
            <div className="relative bg-gray-900/80 p-2 rounded-2xl border border-white/10 backdrop-blur-lg shadow-2xl shadow-black/40">
                <div className="aspect-video bg-gray-800 rounded-lg p-4 border border-white/10 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-grow bg-gray-900/50 rounded-md p-4 border border-white/10 text-gray-500 text-left">
                        <p className="font-mono text-sm text-emerald-400">&gt; Loading personal dashboard...</p>
                        <p className="font-mono text-sm text-gray-400">&gt; Goals synced: 3/3</p>
                        <p className="font-mono text-sm text-gray-400">&gt; Focus session active: Project Phoenix</p>
                    </div>
                </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 sm:py-32 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">The Complete Toolkit for <span className="text-emerald-400">Peak Performance</span></h2>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto">From scattered thoughts to structured success. We've built the tools, you build the future.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <GlowingCard key={idx} large={feature.size === 'large'}>
                  <div className="inline-flex p-3 bg-white/5 border border-white/10 rounded-xl mb-6 text-emerald-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </GlowingCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Converse with Your Content</h2>
              <p className="text-lg text-gray-400">Our AI goes beyond summarizing. Ask questions, get insights, and turn static documents into dynamic knowledge.</p>
            </div>
            <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 lg:p-8 shadow-2xl shadow-black/40">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3">
                        <h3 className="font-bold text-white mb-4 text-xl flex items-center gap-2"><CpuChipIcon className="w-6 h-6 text-emerald-400"/> AI Assistant</h3>
                        <p className="text-gray-400 mb-4">Prompt the AI with a command. It understands context and provides detailed responses.</p>
                        <div className="bg-white/5 p-4 rounded-lg font-mono text-sm text-emerald-300 border border-white/10">
                            <p>&gt; Summarize the key arguments in this research paper about neuroplasticity.</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-white/5 p-4 rounded-lg border border-white/10 min-h-[200px]">
                        <p className="font-mono text-sm text-gray-300 typing-animation">The paper argues that... </p>
                    </div>
                </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 sm:py-32 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Join <StatCounter end={50000} suffix="+" /> High Achievers</h2>
              <p className="text-lg text-gray-400">Don't just take our word for it. Here's what our users say.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <GlowingCard key={idx} className="hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => <StarIcon key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-gray-300 mb-6 italic">"{t.quote}"</p>
                  <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400/50" />
                    <div>
                      <div className="font-bold text-white">{t.name}</div><div className="text-sm text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </GlowingCard>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 sm:py-32 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter">Find Your Perfect Plan</h2>
              <p className="text-lg text-gray-400">Start for free, upgrade when you're ready.</p>
            </div>
            {/* Pricing Toggle can be added here if needed */}
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {pricingPlans.map((plan) => (
                <div key={plan.plan} className={`relative p-8 rounded-3xl ${plan.highlighted ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-white/5 border border-white/10'}`}>
                  {plan.highlighted && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">Most Popular</div>}
                  <h3 className="text-2xl font-bold text-white">{plan.plan}</h3>
                  <div className="mt-4 flex items-baseline"><span className="text-5xl font-extrabold text-white">{plan.price.monthly}</span>{plan.price.monthly !== 'Free' && <span className="ml-2 text-white/70">/month</span>}</div>
                  <ul className="mt-8 space-y-4 flex-grow">
                    {plan.features.map((feature, idx) => (<li key={idx} className="flex items-start gap-3"><CheckIcon className={`h-6 w-6 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-emerald-400'}`} /><span>{feature}</span></li>))}
                  </ul>
                  <button disabled={plan.comingSoon} className={`mt-10 w-full rounded-xl py-4 font-bold text-lg transition-all duration-300 ${plan.comingSoon ? 'bg-gray-600 cursor-not-allowed opacity-60' : plan.highlighted ? 'bg-white text-emerald-600 hover:bg-gray-100' : 'bg-emerald-500 hover:bg-emerald-600'}`}>{plan.comingSoon ? 'Coming Soon' : 'Choose Plan'}</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-32 px-6">
          <div className="container mx-auto max-w-4xl text-center">
            <GlowingCard>
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tighter">Ready to Build Your Future?</h2>
              <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">Your journey to peak performance starts now. No credit card required.</p>
              <button className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105">
                <span className="flex items-center gap-3">Claim Your Free Account <RocketLaunchIcon className="h-6 w-6 group-hover:rotate-12 transition-transform" /></span>
              </button>
            </GlowingCard>
          </div>
        </section>
      </main>
      
      {/* Footer - Simplified for brevity, can be expanded */}
      <footer className="border-t border-white/10 mt-20">
        <div className="container mx-auto px-6 py-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Sarang Tumbuh. All rights reserved.</p>
        </div>
      </footer>
      
      <style jsx global>{`
        .typing-animation {
          width: 0;
          overflow: hidden;
          white-space: nowrap;
          border-right: .15em solid #2dd4bf;
          animation: typing 3s steps(30, end) forwards, blink-caret .75s step-end infinite;
        }

        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }

        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: #2dd4bf; }
        }
      `}</style>
    </div>
  );
}