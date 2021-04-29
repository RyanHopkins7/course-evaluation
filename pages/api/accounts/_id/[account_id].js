import withSession from '../../../../lib/session';
import { connectToDatabase } from '../../../../util/mongodb';
import sanitize from 'mongo-sanitize';
import { ObjectId } from 'mongodb';

export default withSession(async (req, res) => {
    const { account_id } = sanitize(req.query);
    const user = req.session.get('user');
    const { client } = await connectToDatabase();
    const accounts = client.db('courseEvaluation').collection('accounts');
    
    if (!(user && user._id)) {
        res.status(403).json({
            status: 'Authentication required',
        });
        return;
    }

    const sessionAccount = await accounts.findOne({
        _id: {
            $eq: ObjectId(user._id)
        }
    });

    try {
        ObjectId(account_id);
    } catch (err) {
        res.status(400).json({
            status: 'Invalid account id. Must be 12 bytes',
        });
        return;
    }
    
    if (req.method === 'GET') {
        // Allow instructors and admins to get account info by id
        const account = await accounts.findOne({
            _id: {
                $eq: ObjectId(account_id)
            }
        });

        if (account) {
            res.status(200).json({
                account: {
                    _id: account._id,
                    username: account.username,
                    type: account.type,
                },
            });
        } else {
            res.status(404).json({
                status: 'Account not found'
            });
        }
    } else {
        res.status(405).json({
            status: "Method not allowed. Allowed methods: [GET]",
        });
    }
});

