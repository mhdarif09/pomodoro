
import { Head, Link } from '@inertiajs/react';
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
    return (
        <GuestLayout>
            <Head title="Log in / Sign up" />

            <div className="mx-auto w-full max-w-sm text-center">

                <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Get started with Sarang Tumbuh
                </h1>

                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                    Sign in with Google to continue. No password needed.
                </p>

                {status && (
                    <div className="mt-4 font-medium text-sm text-green-600 dark:text-green-400">
                        {status}
                    </div>
                )}

                <div className="mt-8">
                    <GoogleLoginButton href={route('login.google.callback')} />
                </div>

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
