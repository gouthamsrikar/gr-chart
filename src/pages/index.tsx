// pages/index.tsx

import SignIn from "../components/SignIn";

const HomePage: React.FC = () => {
    console.log(process.env.GOOGLE_CLIENT_ID)
    return (
        <div>
            <SignIn />
        </div>
    );
};

export default HomePage;
