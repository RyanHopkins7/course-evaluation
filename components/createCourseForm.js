import { fromJS } from 'immutable';

export default function CreateCourseForm(props) {
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
                        props.addCourse(fromJS(responseJson.course));
                    })
            })
    }

    return (
        <div>
            {props.user.type !== 'admin'
                ? null
                :
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
    )
}