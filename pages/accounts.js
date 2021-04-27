import Head from 'next/head';
import withSession from '../lib/session';
import Header from '../components/header';
import AccountsTable from '../components/accountsTable';
import { List, fromJS } from 'immutable';
import { useState, useEffect } from 'react';

export default function Accounts({ user, server }) {
    // Accounts page
    const [accounts, setAccounts] = useState(List());

    useEffect(() => {
        fetch(`${server}/api/accounts`)
            .then(response => response.json())
            .then(responseJson => {
                setAccounts(fromJS(responseJson.accounts));
            });
    }, []);

    return (
        <div>
            <Head>
                <title>Accounts</title>
            </Head>

            <Header user={user} />

            <h2>Accounts</h2>

            <AccountsTable server={server} />
        </div>
    );
}

export const getServerSideProps = withSession(async function ({ req, res }) {
    // Get user or redirect to /login
    const user = req.session.get('user');
    const { SERVER } = process.env;

    if (!user) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    if (user.type !== 'admin') {
        return {
            redirect: {
                destination: '/',
                permanent: true,
            },
        };
    }

    return {
        props: { user: user, server: SERVER },
    };
});
