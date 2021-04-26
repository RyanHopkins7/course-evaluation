import withSession from '../../lib/session';
import { connectToDatabase } from '../../util/mongodb';
import { ObjectId } from 'mongodb';

export default withSession(async (req, res) => {
    if (req.method === 'GET') {
        // Get all accounts (admin only)
        const user = req.session.get('user');

        if (!(user && user._id)) {
            res.status(403).json({
                status: "Authentication required",
            });
            return;
        }

        const { client } = await connectToDatabase();
        const accounts = client.db('courseEvaluation').collection('accounts');

        const sessionAccount = await accounts.findOne({
            _id: {
                $eq: ObjectId(user._id)
            }
        });

        if (sessionAccount.type !== 'admin') {
            res.status(401).json({
                status: "Unauthorized",
            });
            return;
        }

        res.status(200).json({
            accounts: await accounts.find().toArray(),
        });
        return;
    } else {
        res.status(405).json({
            status: "Method not allowed. Allowed methods: [GET]",
        });
        return;
    }
});