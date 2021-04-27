import withSession from '../../../lib/session';
import { connectToDatabase } from '../../../util/mongodb';
import { ObjectId } from 'mongodb';

export default withSession(async (req, res) => {
    // Relating to surveys connected to courses related to user
    const user = req.session.get('user');
    const { client } = await connectToDatabase();
    const accounts = client.db('courseEvaluation').collection('accounts');
    const surveyResponses = client.db('courseEvaluation').collection('surveyResponses');

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

    if (req.method === 'GET') {
        // Get survey responses
        if (sessionAccount.type === 'admin') {
            res.status(200).json({
                responses: await surveyResponses.find().toArray(),
            });
        } else if (sessionAccount.type === 'instructors') {
            res.status(200).json({
                responses: await surveyResponses.find({
                    course: {
                        $in: sessionAccount.courses || []
                    }
                }).toArray(),
            });
        } else {
            res.status(200).json({
                responses: await surveyResponses.find({
                    completedBy: {
                        $eq: sessionAccount._id
                    }
                }).toArray(),
            });
        }
    } else {
        res.status(405).json({
            status: 'Method not allowed. Allowed methods: [GET]',
        });
    }
});