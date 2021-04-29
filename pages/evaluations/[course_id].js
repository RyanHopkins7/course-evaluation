import { useRouter } from 'next/router';
import Header from '../../components/header';
import withSession from '../../lib/session';
import Head from 'next/head';

export default function Evaluation({ user, server }) {
    const router = useRouter();
    const { course_id } = router.query;

    return (
        <div>
            <Head>
                <title>Evaluations</title>
            </Head>

            <Header user={user} />

            <p>{course_id}</p>
        </div>
    )
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
