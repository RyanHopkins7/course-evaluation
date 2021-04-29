import { List, fromJS } from 'immutable';
import { useState, useEffect } from 'react';

export default function CoursesTable(props) {
    const [evalResponses, setEvalResponses] = useState(List());
    // Remove _id, course, and replace completedBy with student name
    const [evalResponsesParsed, setEvalResponsesParsed] = useState(List());

    useEffect(() => {
        // Set evaluation responses
        fetch(`${props.server}/api/surveys/responses`)
            .then(response => response.json())
            .then(responseJson => {
                setEvalResponses(
                    fromJS(responseJson.responses)
                        .filter(response => response.get('course') === props.course_id)
                );
            });
    }, []);

    useEffect(async () => {
        // Parse eval responses
        evalResponses.forEach((response, i) => {
            fetch(`${props.server}/api/accounts/_id/${response.get('completedBy')}`)
                .then(response => response.json())
                .then(responseJson => {
                    console.log(responseJson);
                    setEvalResponsesParsed(
                        prevEvalResponsesParsed => prevEvalResponsesParsed
                            .push(
                                evalResponses
                                    .get(i)
                                    .set('completedBy', responseJson.account.username)
                                    .delete('_id')
                                    .delete('course')
                            )
                    );
                });
        });
    }, [evalResponses]);

    return (
        <div>
            {evalResponsesParsed.isEmpty()
                ? <h3>No responses found</h3>
                :
                <table>
                    <thead>
                        <tr>
                            {evalResponsesParsed
                                .first()
                                .delete('responses')
                                .keySeq()
                                .toList()
                                .push('questions')
                                .push('answers')
                                .map((key, i) => <th key={i}>{key}</th>)
                                .toJS()
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            evalResponsesParsed.map((response, i) =>
                                <tr key={i}>
                                    {response
                                        .set(
                                            'questions',
                                            response.get('responses').valueSeq()
                                        )
                                        .set(
                                            'answers',
                                            response.get('responses').keySeq()
                                        )
                                        .delete('responses')
                                        .entrySeq()
                                        .map((entry, i) => {
                                            const [key, val] = entry;

                                            if (['questions', 'answers'].includes(key)) {
                                                return (
                                                    <td key={i}>
                                                        <table style={{ border: 0, padding: 0 }}>
                                                            <tbody>
                                                                {val.map((v, i) => (
                                                                    <tr key={i}>
                                                                        <td>{v}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                )
                                            } else {
                                                return (
                                                    <td key={i}>
                                                        {val}
                                                    </td>
                                                )
                                            }
                                        })
                                    }
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            }
        </div>
    )
}