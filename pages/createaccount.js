import Head from 'next/head';
import withSession from '../lib/session';
import { useState } from 'react';
import Header from '../components/header';

export default function CreateAccount() {
    // Create a new student or instructor account

    const [status, setStatus] = useState('');

    const createAccount = event => {
        event.preventDefault();

        const username = event.target.username.value;
        const password = event.target.password.value;
        const accountType = event.target.accountType.value;

        fetch(`/api/accounts/${username}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password,
                type: accountType
            })
        })
            .then(response => response.json())
            .then(responseJson => {
                switch (responseJson.status) {
                    case 'Successfully created account':
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

            <Header />

            <h2>Create Account</h2>

            <p>{status}</p>

            <form onSubmit={createAccount}>
                <label htmlFor="username">Username</label>
                <input id="username" name="username" type="text" autoComplete="username" required />

                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" autoComplete="new-password" required />

                <label htmlFor="accountType">Account Type</label>
                <select id="accountType" name="accountType">
                    <option value="students">Students</option>
                    <option value="instructors">Instructors</option>
                </select>

                <button type="submit">Create Account</button>
            </form>
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

