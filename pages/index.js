import Head from 'next/head';
import withSession from '../lib/session';
import Header from '../components/header';
import AccountsTable from '../components/accountsTable';
import CoursesTable from '../components/coursesTable';
import EvaluationsTable from '../components/evaluationsTable';
import Link from 'next/link';

export default function Home({ user, server }) {
    // Home page

    return (
        <div>
            <Head>
                <title>Course Registration And Evaluation</title>
            </Head>

            <Header user={user} />

            <h2>
                <Link href="/courses">
                    <a>Courses</a>
                </Link>
            </h2>

            <CoursesTable user={user} server={server} />

            <h2>
                <Link href="/evaluations">
                    <a>Evaluations</a>
                </Link>
            </h2>

            <EvaluationsTable user={user} server={server} />

            {user.type === 'admin' &&
                <div>
                    <h2>
                        <Link href="/accounts">
                            <a>Accounts</a>
                        </Link>
                    </h2>

                    <AccountsTable server={server} />
                </div>
            }
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
