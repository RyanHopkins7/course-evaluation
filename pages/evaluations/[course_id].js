import { useRouter } from 'next/router';
import Header from '../../components/header';
import CreateEvalResponseForm from '../../components/createEvalResponseForm';
import IndividualEvaluationTable from '../../components/individualEvaluationTable';
import withSession from '../../lib/session';
import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Evaluation({ user, server }) {
    const [courseTitle, setCourseTitle] = useState('');

    const router = useRouter();
    const { course_id } = router.query;

    useEffect(() => {
        // Set course title
        fetch(`${server}/api/courses/${course_id}`)
            .then(response => response.json())
            .then(responseJson => {
                setCourseTitle(responseJson.course.title);
            });
    }, []);

    return (
        <div>
            <Head>
                <title>{courseTitle} Evaluation</title>
            </Head>

            <Header user={user} />

            <h2>{courseTitle} Evaluation</h2>

            {user.type === 'students'
                ? <CreateEvalResponseForm server={server} course_id={course_id} />
                : <IndividualEvaluationTable server={server} course_id={course_id} />
            }
            
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
