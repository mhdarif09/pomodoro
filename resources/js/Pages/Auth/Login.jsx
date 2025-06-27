import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

// A modern Google Login Button component
const GoogleLoginButton = ({ href }) => (
    <a 
        href={href} 
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-800 transition-all hover:shadow-md dark:border-gray-600 dark:bg-white/5 dark:text-gray-300"
    >
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
            <path d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.3 109.8 11.8 244 11.8c70.4 0 129.8 27.5 174.9 72.1l-69.4 68.3c-24-22.4-56-36.6-94-36.6-72.4 0-131.5 59.1-131.5 131.5s59.1 131.5 131.5 131.5c79.9 0 118.8-59.9 122.9-92.4H244v-83.9h244v- .1z" fill="#4285F4"/>
        </svg>
        <span>Continue with Google</span>
    </a>
);

// A simple divider with "OR" text
const Divider = () => (
    <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        <span className="mx-4 flex-shrink text-xs font-medium text-gray-400">OR</span>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
    </div>
);


export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Log in" />
            
            <div className="mx-auto w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                        Welcome Back
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Log in to continue to Koderia.
                    </p>
                </div>

                {status && <div className="mb-4 font-medium text-sm text-green-600 dark:text-green-400">{status}</div>}
                
                {/* Google Login */}
                <GoogleLoginButton href={route('login.google.redirect')} />

                {/* Divider */}
                <Divider />

                {/* Email & Password Form */}
                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                        </label>
                        
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    
                    <div className="mt-6">
                        {/* We use the custom gradient style here for brand consistency */}
                        <PrimaryButton className="w-full justify-center bg-gradient-to-r from-purple-500 to-blue-500 py-3 hover:scale-105" disabled={processing}>
                            Log in
                        </PrimaryButton>
                    </div>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link href={route('register')} className="font-semibold text-purple-600 hover:underline dark:text-purple-400">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}