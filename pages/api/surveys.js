import withSession from '../../lib/session';
import { connectToDatabase } from '../../util/mongodb';
import { ObjectId } from 'mongodb';

export default withSession(async (req, res) => {
    if (req.method === 'GET') {
        // Get survey responses
        const user = req.session.get('user');
        const { client } = await connectToDatabase();
        const surveys = client.db('courseEvaluation').collection('surveys');
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

        if (sessionAccount.type === 'admin') {
            // Return all surveys
            res.status(200).json({
                surveys: await surveys.find().toArray(),
            });
            return;
        } else if (sessionAccount.type === 'instructors') {
            // Return surveys for courses taught by the instructor
            // TODO
        } else {
            // Return surveys for courses the student is registered in
            // TODO
        }
    } else {
        res.status(405).json({
            status: "Method not allowed. Allowed methods: [GET]",
        });
        return;
    }
});