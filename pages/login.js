import Head from 'next/head';
import Link from 'next/link';

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

