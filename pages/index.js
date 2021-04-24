import Head from 'next/head';
import withSession from "../lib/session";

export default function Home({ user }) {
    return (
        <div>
            <Head>
                <title>Course Evaluation</title>
            </Head>

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
        props: { user: req.session.get('user') },
    };
});
