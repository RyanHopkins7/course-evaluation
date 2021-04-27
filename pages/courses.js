import Head from 'next/head';
import withSession from '../lib/session';
import Header from '../components/header';
import CoursesTable from '../components/coursesTable';

export default function Courses({ user, server }) {
    // Courses page

    return (
        <div>
            <Head>
                <title>Courses</title>
            </Head>

            <Header user={user} />
            
            <h2>Courses</h2>

            <CoursesTable user={user} server={server} />
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
