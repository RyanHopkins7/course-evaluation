import Head from 'next/head';
import Link from 'next/link';
import withSession from '../lib/session';
import { useState } from 'react';

export default function CreateAccount() {
    const [status, setStatus] = useState('');

    const createAccount = event => {
        event.preventDefault();

        const username = event.target.username.value;
        const password = event.target.password.value;
        const accountType = event.target.accountType.value;

        fetch('/api/createaccount', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password,
                type: accountType
            })
        })
            .then(response => response.json())
            .then(responseJson => {
                switch (responseJson.status) {
                    case 'Successfully created account.':
                        // Redirect
                        window.location.href = '/';
                        break;
                    default:
                        setStatus(responseJson.status);
                        break;
                }
            });
    }

    return (
        <div>
            <Head>
                <title>Create Account</title>
            </Head>

            <h2>Create Account</h2>

            <p>{status}</p>

            <form onSubmit={createAccount}>
                <label htmlFor="username">Username</label>
                <input id="username" name="username" type="text" autoComplete="username" required />

                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" autoComplete="new-password" required />

                <label htmlFor="accountType">Account Type</label>
                <select id="accountType" name="accountType">
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                </select>

                <button type="submit">Create Account</button>
            </form>

            <Link href="/login">
                <a>Log in</a>
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

