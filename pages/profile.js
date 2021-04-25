import Head from 'next/head';
import withSession from '../lib/session';
import { useState } from 'react';
import Header from '../components/header';

export default function Profile({ user }) {
    // Profile page with password reset

    const [status, setStatus] = useState('');

    const resetPassword = event => {
        event.preventDefault();

        const oldPassword = event.target.oldPassword.value;
        const newPassword = event.target.newPassword.value;

        fetch(`/api/accounts/${user.username}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                oldPassword: oldPassword,
                newPassword: newPassword
            })
        })
            .then(response => response.json())
            .then(responseJson => {
                setStatus(responseJson.status);
            });
    }

    return (
        <div>
            <Head>
                <title>Profile</title>
            </Head>

            <Header user={user} />

            <h2>Profile</h2>

            <p>{user.username}</p>
            <p>{user.type}</p>
            <h3>Reset password</h3>

            <p>{status}</p>

            <form onSubmit={resetPassword}>
                <label htmlFor="oldPassword">Old Password</label>
                <input id="oldPassword" name="oldPassword" type="password" autoComplete="current-password" required />

                <label htmlFor="newPassword">New Password</label>
                <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required />

                <button type="submit">Log In</button>
            </form>
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

