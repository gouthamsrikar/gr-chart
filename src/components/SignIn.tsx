import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const SignIn: React.FC = () => {
    const { data: session, status } = useSession();
    const router = useRouter()

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (session) {
        router.push('/chart')
    }

    if (!session) {
        return (
            <div className='w-full h-full flex-col items-center justify-center p-5'>
                <button className='bg-black text-white rounded-full p-4' onClick={() => signIn('google')}>Sign in with Google</button>
            </div>
        );
    }

    return <div>Welcome, {session.user?.name}</div>;
};

export default SignIn;
