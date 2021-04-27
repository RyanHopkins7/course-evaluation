import Head from 'next/head';
import withSession from '../lib/session';
import Header from '../components/header';
import { useState, useEffect } from 'react';

export default function Evaluations({ user, server }) {
    // Evaluations page
    const [evaluations, setEvaluations] = useState();

    useEffect(() => {
        fetch(`${server}/api/surveys/responses`)
            .then(response => response.json())
            .then(responseJson => {
                console.log(responseJson);
            });
    }, []);

    return (
        <div>
            <Head>
                <title>Evaluations</title>
            </Head>

            <Header user={user} />

            <h2>Evaluations</h2>
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

    return {
        props: { user: user, server: SERVER },
    };
});
