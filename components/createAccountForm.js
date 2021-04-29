import { useState } from 'react';
import { fromJS } from 'immutable';

export default function CreateAccountForm(props) {
    const [status, setStatus] = useState('');

    const createAccount = event => {
        event.preventDefault();

        const username = event.target.username.value;
        const password = event.target.password.value;
        const accountType = event.target.accountType.value;

        fetch(`${props.server}/api/accounts/${username}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: password,
                type: accountType
            })
        })
            .then(response => response.json())
            .then(responseJson => {
                if (responseJson.status === 'Successfully created account') {
                    props.redirect && (window.location.href = '/');

                    props.addAccount 
                        && fetch(`${props.server}/api/accounts/${username}`)
                            .then(response => response.json())
                            .then(responseJson => {
                                props.addAccount(fromJS(responseJson.account));
                            });
                }

                setStatus(responseJson.status);
            });
    }

    return (
        <form onSubmit={createAccount}>

            <h2>Create Account</h2>

            <p>{status}</p>

            <label htmlFor="username">Username</label>
            <input id="username" name="username" type="text" autoComplete="username" required />

            <br />

            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required />

            <br />

            <label htmlFor="accountType">Account Type</label>
            <select id="accountType" name="accountType">
                <option value="students">Students</option>
                <option value="instructors">Instructors</option>
            </select>

            <br />

            <button type="submit">Create Account</button>
        </form>
    );
}
