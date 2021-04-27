import Head from 'next/head';
import withSession from "../lib/session";
import { useState } from 'react';
import Header from '../components/header';

export default function LogIn({ server }) {
    // Sign in

    const [status, setStatus] = useState('');

    const logIn = event => {
        event.preventDefault();

        const username = event.target.username.value;
        const password = event.target.password.value;

        fetch(`${server}/api/accounts/session`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(response => response.json())
            .then(responseJson => {
                switch (responseJson.status) {
                    case 'Successfully logged in':
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
                <title>Log In</title>
            </Head>

            <Header />

            <h2>Log In</h2>

            <p>{status}</p>

            <form onSubmit={logIn}>
                <label htmlFor="username">Username</label>
                <input id="username" name="username" type="text" autoComplete="username" required />

                <br />

                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required />

                <br />

                <button type="submit">Log In</button>
            </form>
        </div>
    );
}

export const getServerSideProps = withSession(async function ({ req, res }) {
    // Redirect to index if user already logged in
    const user = req.session.get('user');
    const { SERVER } = process.env;

    if (user) {
        return {
            redirect: {
                destination: '/',
                permanent: true,
            },
        };
    }

    return { props: { server: SERVER } };
});

