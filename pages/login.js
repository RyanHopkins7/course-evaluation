import Head from 'next/head';
import Link from 'next/link';
import withSession from "../lib/session";

export default function Home() {
    return (
        <div>
            <Head>
                <title>Log In</title>
            </Head>

            <h2>Log In</h2>

            <Link href="/createaccount">
                <a>Create Account</a>
            </Link>
        </div>
    );
}

export const getServerSideProps = withSession(async function ({ req, res }) {
    // Redirect to index if user already logged in
    const user = req.session.get('user');

    if (user) {
        return {
            redirect: {
                destination: '/',
                permanent: true,
            },
        };
    }

    return { props: {} };
});

