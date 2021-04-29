import { List, fromJS } from 'immutable';
import { useState, useEffect } from 'react';

export default function AccountsTable(props) {
    const [accounts, setAccounts] = useState(List());

    useEffect(() => {
        if (props.accounts) {
            setAccounts(props.accounts);
        } else {
            fetch(`${props.server}/api/accounts`)
                .then(response => response.json())
                .then(responseJson => {
                    setAccounts(fromJS(responseJson.accounts));
                });
        }
    }, [props.accounts]);

    return (
        <div>
            {accounts.isEmpty()
                ?
                <h3>No accounts found</h3>
                :
                <table>
                    <thead>
                        <tr>
                            {accounts.first().keySeq().map((key, i) => <th key={i}>{key}</th>).toJS()}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            accounts.map((account, i) =>
                                <tr key={i}>
                                    {account.entrySeq().map((entry, i) => {
                                        const [key, val] = entry;

                                        // TODO: display courses?
                                        // TODO: account deletion?
                                        // TODO: password reset?
                                        return key !== 'courses' &&
                                            <td key={i}>
                                                {val}
                                            </td>
                                    })}
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            }
        </div>
    );
}
