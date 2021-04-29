import { useState, useEffect } from 'react';
import { Set } from 'immutable';

export default function CreateEvalQuestionForm(props) {
    const [questions, setQuestions] = useState(Set());

    useEffect(() => {
        // Set questions
        fetch(`${props.server}/api/surveys/questions`)
            .then(response => response.json())
            .then(responseJson => {
                setQuestions(Set(responseJson.questions));
            });
    }, []);

    const createEvalQuestion = event => {
        event.preventDefault();

        const question = event.target.question.value;

        fetch(`${props.server}/api/surveys/questions`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: question
            })
        })
            .then(response => {
                if (response.ok) {
                    setQuestions(prevQuestions => prevQuestions.add(question));
                }
                return response.json();
            })
            .then(responseJson => {
                console.log(responseJson);
            });

    }

    return (
        <div>
            {props.user.type !== 'admin'
                ? null
                :
                <div>
                    {questions.isEmpty()
                        ?
                        <h3>No evaluation questions found</h3>
                        :
                        <table>
                            <thead>
                                <tr>
                                    <th>Questions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    questions.map((question, i) => (
                                        <tr key={i}>
                                            <td>{question}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    }
                    <form onSubmit={createEvalQuestion}>
                        <h3>Create New Evaluation Question</h3>

                        <label htmlFor="question">Question</label>
                        <input id="question" name="question" type="text" required />

                        <br />

                        <button type="submit">Submit New Question</button>
                    </form>
                </div>
            }
        </div>
    )
}