import { useState, useEffect } from 'react';
import { List, Set, Map, fromJS } from 'immutable';
import Link from 'next/link';

export default function EvaluationsTable(props) {
    // TODO: move this up to parent
    const [courses, setCourses] = useState(Set());
    // TODO: move this up to parent
    const [evalResponses, setEvalResponses] = useState(List());
    const [students, setStudents] = useState(List());

    // Map course_id -> students
    const [coursesToStudents, setCoursesToStudents] = useState(Map());

    useEffect(() => {
        // Set evaluation responses
        fetch(`${props.server}/api/surveys/responses`)
            .then(response => response.json())
            .then(responseJson => {
                setEvalResponses(fromJS(responseJson.responses));
            });

        // Set students
        fetch(`${props.server}/api/accounts`)
            .then(response => response.json())
            .then(responseJson => {
                setStudents(
                    fromJS(responseJson.accounts)
                        .filter(account => account.get('type') === 'students')
                );
            });

        // Set courses
        if (props.user.type !== 'admin') {
            fetch(`${props.server}/api/accounts/${props.user.username}`)
                .then(response => response.json())
                .then(responseJson => {
                    if (responseJson.account.courses) {
                        responseJson.account.courses.forEach(course_id => {
                            // TODO: it'd probably be bettter to put this into a useEffect...
                            fetch(`${props.server}/api/courses/${course_id}`)
                                .then(response => response.json())
                                .then(responseJson => {
                                    setCourses(prevCourses => prevCourses.add(fromJS(responseJson.course)));
                                });
                        });
                    }
                });
        } else {
            fetch(`${props.server}/api/courses`)
                .then(response => response.json())
                .then(responseJson => {
                    setCourses(Set(responseJson.courses.map(course => fromJS(course))));
                });
        }
    }, []);

    useEffect(() => {
        // Get students for each course
        courses.forEach(course => {
            if (!coursesToStudents.has(course.get('_id'))) {
                fetch(`${props.server}/api/courses/${course.get('_id')}/students`)
                    .then(response => response.json())
                    .then(responseJson => {
                        setCoursesToStudents(prevStudents =>
                            prevStudents.set(
                                course.get('_id'),
                                fromJS(responseJson.students)
                            )
                        );
                    });
            }
        });
    }, [courses]);

    return (
        <div>
            {
                props.user.type === 'students'
                    ?
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                {courses.map((course, i) => <th key={i} scope="col">{course.get('title')}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th>Time Completed</th>
                                {
                                    courses.map((course, i) =>
                                        <td key={i}>
                                            {evalResponses.some(response => course.get('_id') === response.get('course')) &&
                                                <p>
                                                    {evalResponses
                                                        .filter(response => course.get('_id') === response.get('course'))
                                                        .first()
                                                        .get('timeCompleted')
                                                    }
                                                </p>
                                            }
                                        </td>
                                    )
                                }
                            </tr>
                            <tr>
                                <th scope="row">Status</th>
                                {
                                    courses.map((course, i) =>
                                        <td key={i}>
                                            {!evalResponses.some(response => course.get('_id') === response.get('course'))
                                                ?
                                                <Link href={`/evaluations/${course.get('_id')}`}>
                                                    <button>Fill Out Evaluation</button>
                                                </Link>
                                                :
                                                <p>Response submitted</p>
                                            }
                                        </td>
                                    )
                                }
                            </tr>
                        </tbody>
                    </table>
                    :
                    <div>
                        {evalResponses.isEmpty()
                            ?
                            <h3>No responses found</h3>
                            :
                            <table>
                                <thead>
                                    <tr>
                                        <th></th>
                                        {courses.map((course, i) => <th key={i} scope="col">{course.get('title')}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">Response rate</th>
                                        {courses.map((course, i) => (
                                            <td key={i}>
                                                {evalResponses
                                                    .filter(response => course.get('_id') === response.get('course'))
                                                    .size / (
                                                        coursesToStudents.get(course.get('_id')) 
                                                            ? coursesToStudents.get(course.get('_id')).size
                                                            : 0
                                                    ) * 100
                                                } %
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th scope="row">View responses</th>
                                        {courses.map((course, i) => (
                                            <td key={i}>
                                                <Link href={`/evaluations/${course.get('_id')}`}>
                                                    <button>View Results</button>
                                                </Link>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        }
                    </div>
            }
        </div>
    )
}