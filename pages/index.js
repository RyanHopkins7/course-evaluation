import Head from 'next/head';
import withSession from '../lib/session';
import Header from '../components/header';

import '../styles/home.module.css';

export default function Home({ user }) {
    return (
        <div>
            <Head>
                <title>Course Evaluation</title>
            </Head>

            <Header user={user} />

            <h2>Home</h2>
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
