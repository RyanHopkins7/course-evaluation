import Head from 'next/head';
import withSession from '../lib/session';
import Header from '../components/header';

import '../styles/home.module.css';

export default function Home({ user }) {
    // Home page
    
    return (
        <div>
            <Head>
                <title>Course Registration</title>
            </Head>

            <Header user={user} />

           {/* <h1>Home</h1> */}
        </div>
    );
}

export const getServerSideProps = withSession(async function ({ req, res }) {
    // Get user or redirect to /login
    const user = req.session.get('user');

    if (!user) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    return {
        props: { user: user },
    };
});
