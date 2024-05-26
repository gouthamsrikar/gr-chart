// pages/authenticated.tsx
import LineChart from '@/components/LineChart';
import { useSession } from 'next-auth/react';

const AuthenticatedPage: React.FC = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || !session.user) {
    return <div>Access Denied</div>;
  }

  return (
    <div className='m-0 p-14 bg-black h-screen w-screen'>
      <h1 className=' text-white'>Welcome, {session.user.name}</h1>
      <div className='h-full w-full ' >
        <LineChart />
      </div>
    </div>
  );
};

export default AuthenticatedPage;
