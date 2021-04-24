import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
    return (
        <div>
            <Head>
                <title>Create Account</title>
            </Head>

            <h2>Create Account</h2>

            <Link href="/login">
                <a>Log in</a>
            </Link>
        </div>
    );
}

