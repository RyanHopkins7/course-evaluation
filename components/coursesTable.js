import { useState, useEffect } from 'react';
import { List, Map, fromJS } from 'immutable';

export default function CoursesTable(props) {
    const [courses, setCourses] = useState(List());
    const [instructors, setInstructors] = useState(List());

    // Map course_id -> instructors
    const [coursesToInstructors, setCoursesToInstructors] = useState(Map());

    useEffect(() => {
        // Set courses
        fetch(`${props.server}/api/courses`)
            .then(response => response.json())
            .then(responseJson => {
                setCourses(fromJS(responseJson.courses));
            });

        // Set instructors
        fetch(`${props.server}/api/accounts`)
            .then(response => response.json())
            .then(responseJson => {
                setInstructors(
                    fromJS(responseJson.accounts)
                        .filter(account => account.get('type') === 'instructors')
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

    const createNewCourse = event => {
        event.preventDefault();

        const title = event.target.title.value;
        const credits = event.target.credits.value;

        fetch(`${props.server}/api/courses`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                credits: credits
            })
        })
            .then(response => response.json())
            .then(responseJson => {
                const insertedId = responseJson.insertedId;

                fetch(`${props.server}/api/courses/${insertedId}`)
                    .then(response => response.json())
                    .then(responseJson => {
                        setCourses(courses.push(fromJS(responseJson.course)));
                    })
            })
    }

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
                if (response.ok) {
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
                                    .map((entry, i) => {
                                        const [key, val] = entry;

                                        return (
                                            <td key={i}>
                                                {key !== 'instructors'
                                                    ? val
                                                    :
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

            {typeof window !== 'undefined' && window.location.pathname !== '/' &&
                <form onSubmit={createNewCourse}>
                    <h3>Create New Course</h3>

                    <label htmlFor="title">Title</label>
                    <input id="title" name="title" required />

                    <br />

                    <label htmlFor="credits">Credits</label>
                    <select id="credits" name="credits" required>
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                    </select>

                    <br />

                    <button type="submit">Create New Course</button>
                </form>
            }
        </div>
    );
}
