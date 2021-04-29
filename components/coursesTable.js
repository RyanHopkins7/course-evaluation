import { useState, useEffect } from 'react';
import { List, Map, fromJS } from 'immutable';

export default function CoursesTable(props) {
    const [courses, setCourses] = useState(List());

    // TODO: It might be better to use a single data structure for all accounts...
    const [instructors, setInstructors] = useState(List());
    const [students, setStudents] = useState(List());

    // TODO: it'd be better to use coursesToAccounts to avoid repetition...
    // Map course_id -> instructors
    const [coursesToInstructors, setCoursesToInstructors] = useState(Map());

    // Map course_id -> students
    const [coursesToStudents, setCoursesToStudents] = useState(Map());

    useEffect(() => {
        // Set courses
        if (props.courses) {
            setCourses(props.courses);
        } else {
            fetch(`${props.server}/api/courses`)
                .then(response => response.json())
                .then(responseJson => {
                    setCourses(fromJS(responseJson.courses));
                });
        }
    }, [props.courses]);

    useEffect(() => {
        // Set instructors
        fetch(`${props.server}/api/accounts`)
            .then(response => response.json())
            .then(responseJson => {
                setInstructors(
                    fromJS(responseJson.accounts)
                        .filter(account => account.get('type') === 'instructors')
                );
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
    }, []);

    useEffect(() => {
        // Get instructors for each course
        courses.forEach(course => {
            if (!coursesToInstructors.has(course.get('_id'))) {
                fetch(`${props.server}/api/courses/${course.get('_id')}/instructors`)
                    .then(response => response.json())
                    .then(responseJson => {
                        setCoursesToInstructors(prevInstructors =>
                            prevInstructors.set(
                                course.get('_id'),
                                fromJS(responseJson.instructors)
                            )
                        );
                    });
            }
        });
    }, [courses]);

    // TODO: it'd be better to raise the scope of coursesToStudents and courses to parent element
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

    const assignCourse = event => {
        event.preventDefault();

        const course_id = event.target.course_id.value;
        const username = event.target.username.value;
        const type = event.target.type.value;

        fetch(`${props.server}/api/courses/${course_id}/${type}/${username}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok && type == 'instructors') {
                    setCoursesToInstructors(prevCoursesToInstructors =>
                        prevCoursesToInstructors.set(
                            course_id,
                            prevCoursesToInstructors.has(course_id)
                                ? prevCoursesToInstructors
                                    .get(course_id)
                                    .push(
                                        instructors
                                            .filter(instructor => instructor.get('username') === username)
                                            .first()
                                    )
                                : List([
                                    instructors
                                        .filter(instructor => instructor.get('username') === username)
                                        .first()
                                ])
                        )
                    );
                }

                if (response.ok && type == 'students') {
                    setCoursesToStudents(prevCoursesToStudents =>
                        prevCoursesToStudents.set(
                            course_id,
                            prevCoursesToStudents.has(course_id)
                                ? prevCoursesToStudents
                                    .get(course_id)
                                    .push(
                                        students
                                            .filter(student => student.get('username') === username)
                                            .first()
                                    )
                                : List([
                                    students
                                        .filter(student => student.get('username') === username)
                                        .first()
                                ])
                        )
                    );
                }

                return response.json();
            })
            .then(responseJson => {
                console.log(responseJson);
            });
    }

    return (
        <div>
            {courses.isEmpty()
                ?
                <h3>No courses found</h3>
                :
                <table>
                    <thead>
                        <tr>
                            {
                                courses
                                    .first()
                                    .keySeq()
                                    .toList()
                                    .push('instructors')
                                    .push('students')
                                    .map((key, i) => <th key={i}>{key}</th>)
                                    .toJS()
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course, i) =>
                            <tr key={i}>
                                {course
                                    .entrySeq()
                                    .toList()
                                    .push(['instructors', null])
                                    .push(['students', null])
                                    .map((entry, i) => {
                                        const [key, val] = entry;

                                        return (
                                            <td key={i}>
                                                {val}

                                                {key === 'instructors' &&
                                                    <div>
                                                        {coursesToInstructors.get(course.get('_id'))
                                                            && coursesToInstructors.get(course.get('_id')).map(
                                                                (instructor, i) => <p key={i}>{instructor.get('username')}</p>
                                                            )
                                                        }
                                                        {props.user.type === 'admin' &&
                                                            <form onSubmit={assignCourse}>
                                                                <input type="hidden" name="course_id" value={course.get('_id')}></input>
                                                                <input type="hidden" name="type" value='instructors'></input>
                                                                <select name="username">
                                                                    {instructors.map((instructor, i) =>
                                                                        <option key={i} value={instructor.get('username')}>
                                                                            {instructor.get('username')}
                                                                        </option>
                                                                    ).toJS()}
                                                                </select>
                                                                <button type="submit">Assign instructor</button>
                                                            </form>
                                                        }
                                                    </div>
                                                }

                                                {key === 'students' &&
                                                    <div>
                                                        {coursesToStudents.get(course.get('_id'))
                                                            && coursesToStudents.get(course.get('_id')).map(
                                                                (student, i) => <p key={i}>{student.get('username')}</p>
                                                            )
                                                        }

                                                        {props.user.type === 'students' &&
                                                            <form onSubmit={assignCourse}>
                                                                <input type="hidden" name="course_id" value={course.get('_id')}></input>
                                                                <input type="hidden" name="type" value='students'></input>
                                                                <input type="hidden" name="username" value={props.user.username}></input>

                                                                <button type="submit">Register</button>
                                                            </form>
                                                        }
                                                    </div>
                                                }
                                            </td>
                                        );
                                    })
                                }
                            </tr>
                        )
                        }

                    </tbody>
                </table>
            }
        </div>
    );
}
