import { useState, useEffect } from 'react';
import { List, Map, fromJS } from 'immutable';

export default function CreateEvalResponseForm(props) {
    const [questions, setQuestions] = useState(List());
    const [status, setStatus] = useState('');

    useEffect(() => {
        // Set questions
        fetch(`${props.server}/api/surveys/questions`)
            .then(response => response.json())
            .then(responseJson => {
                setQuestions(fromJS(responseJson.questions));
            });
    }, []);

    const createResponse = event => {
        event.preventDefault();

        fetch(`${props.server}/api/surveys/responses/${props.course_id}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                responses: questions
                    .toMap()
                    .flip()
                    .map((_, question) => event.target[question].value)
                    .toJS(),
            })
        })
            .then(response => response.json())
            .then(responseJson => {
                if (responseJson.status === 'Successfully submitted survey response') {
                    window.location.href = '/';
                } else {
                    setStatus(responseJson.status);
                }
            });
    }

    return (
        <div>
            {questions.isEmpty()
                ? <h3>No evaluation questions found</h3>
                :
                <form onSubmit={createResponse}>
                    <h3>Submit Course Evaluation</h3>

                    <p>{status}</p>

                    {
                        questions.map((question, i) => (
                            <div key={i}>
                                <label htmlFor={question}>{question}</label>
                                <input id={question} name={question} type="text" required />
                            </div>
                        ))
                    }

                    <button type="submit">Submit Response</button>
                </form>
            }
        </div>
    )
}