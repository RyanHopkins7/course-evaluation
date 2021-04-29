import Head from 'next/head';
import withSession from '../lib/session';
import Header from '../components/header';
import EvaluationsTable from '../components/evaluationsTable';
import CreateEvalQuestionForm from '../components/createEvalQuestionForm';

export default function Evaluations({ user, server }) {
    // Evaluations page

    return (
        <div>
            <Head>
                <title>Evaluations</title>
            </Head>

            <Header user={user} />

            <h2>Evaluations</h2>

            <EvaluationsTable user={user} server={server} />

            <CreateEvalQuestionForm user={user} server={server} />
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
