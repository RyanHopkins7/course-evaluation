import { useState, useEffect } from 'react';
import { List, Map, fromJS } from 'immutable';
import Link from 'next/link';

export default function EvaluationsTable(props) {
    const [courses, setCourses] = useState(List());

    // Map course_id => student => evaluation
    const [coursesToEvals, setCoursesToEvals] = useState(Map());

    useEffect(() => {
        // Set courses

        if (props.user.type === 'students') {
            fetch(`${props.server}/api/accounts/${props.user.username}`)
                .then(response => response.json())
                .then(responseJson => {
                    if (responseJson.account.courses) {
                        responseJson.account.courses.forEach(course_id => {
                            fetch(`${props.server}/api/courses/${course_id}`)
                                .then(response => response.json())
                                .then(responseJson => {
                                    console.log(responseJson);
                                    setCourses(prevCourses => prevCourses.push(fromJS(responseJson.course)));
                                });
                        });
                    }
                });
        } else {
            fetch(`${props.server}/api/courses`)
                .then(response => response.json())
                .then(responseJson => {
                    setCourses(fromJS(responseJson.courses));
                });
        }
    }, []);

    return (
        <div>
            {
                props.user.type === 'students' &&
                <table>
                    <thead>
                        <tr>
                            {courses.map((course, i) => <th key={i}>{course.get('title')}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {
                                courses.map((course, i) =>
                                    <td key={i}>
                                        <Link href={`/evaluations/${course.get('_id')}`}>
                                            <button>Submit Evaluation</button>
                                        </Link>
                                    </td>
                                )
                            }
                        </tr>
                    </tbody>
                </table>
            }
        </div>
    )
}