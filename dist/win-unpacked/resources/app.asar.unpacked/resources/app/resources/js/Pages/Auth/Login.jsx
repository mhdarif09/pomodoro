
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import GuestLayout from '@/Layouts/GuestLayout';
import ApplicationLogo from '@/Components/ApplicationLogo'; // optional

// Komponen Tombol Login Google (Hijau Elegan)
const GoogleLoginButton = ({ href }) => (
    <a
        href={href}
        className="group relative flex w-full items-center justify-center gap-3 rounded-xl 
                   bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-3 font-semibold text-white 
                   shadow-md transition-all duration-300 ease-in-out hover:shadow-lg hover:brightness-110 
                   active:scale-[0.98]"
    >
        {/* Icon Google putih dengan background transparan */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
                aria-hidden="true"
            >
                <path
                    fill="white"
                    d="M488 261.8C488 403.3 381.5 512 244 512 
                       109.8 512 0 402.2 0 261.8 
                       0 120.3 109.8 11.8 244 11.8
                       c70.4 0 129.8 27.5 174.9 72.1l-69.4 68.3
                       c-24-22.4-56-36.6-94-36.6
                       -72.4 0-131.5 59.1-131.5 131.5
                       s59.1 131.5 131.5 131.5
                       c79.9 0 118.8-59.9 122.9-92.4H244v-83.9h244z"
                />
            </svg>
        </div>

        <span className="text-lg tracking-wide group-hover:text-white/90">
            Continue with Google
        </span>

        {/* Efek glow halus di bawah tombol */}
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400/20 to-green-500/20 opacity-0 blur-lg transition-opacity group-hover:opacity-100"></span>
    </a>
);

export default function Login({ status }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPasswordLogin, setShowPasswordLogin] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            const response = await axios.post(route('api.login'), {
                email,
                password
            });

            if (response.data.redirect_url) {
                window.location.href = response.data.redirect_url;
            }
        } catch (error) {
            console.error("Login error:", error);
            if (error.response && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'Login failed. Please check your credentials.' });
            }
            setIsLoading(false);
        }
    };

    const isDesktop = typeof window !== 'undefined' &&
        (window.process?.versions?.electron || window.navigator.userAgent.includes('Electron'));

    const handleGoogleLogin = (e) => {
        if (isDesktop) {
            e.preventDefault();
            const googleUrl = route('login.google.redirect');
            // Open in system browser via our bridge route
            axios.get(route('desktop.open-external', { url: googleUrl }))
                .catch(err => console.error("Failed to open external browser", err));
        }
    };

    return (
        <GuestLayout>
            <Head title="Log in / Sign up" />

            <div className="mx-auto w-full max-w-sm text-center">

                <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Get started with Sarang Tumbuh
                </h1>

                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Sign in to continue to your dashboard.
                </p>

                {status && (
                    <div className="mt-4 font-medium text-sm text-green-600 dark:text-green-400">
                        {status}
                    </div>
                )}

                <div className="mt-8" onClick={handleGoogleLogin}>
                    <GoogleLoginButton href={route('login.google.redirect')} />
                </div>

                <div className="relative mt-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm font-medium leading-6">
                        <span className="bg-white px-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100">Or continue with</span>
                    </div>
                </div>

                {/* Toggle Password Login */}
                {!showPasswordLogin ? (
                    <div className="mt-6">
                        <button
                            onClick={() => setShowPasswordLogin(true)}
                            className="text-sm font-semibold text-emerald-600 hover:text-emerald-500"
                        >
                            Log in with Email & Password
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="mt-6 space-y-4 text-left">
                        {errors.general && (
                            <div className="text-red-500 text-sm text-center mb-2">{errors.general}</div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                )}

                <div className="mt-8">
                    <p className="px-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        By continuing, you agree to our{' '}
                        <Link
                            href={route('terms.show')}
                            className="underline hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link
                            href={route('policy.show')}
                            className="underline hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}