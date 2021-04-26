import withSession from '../../../lib/session';
import { connectToDatabase } from '../../../util/mongodb';
import sanitize from 'mongo-sanitize';
import { ObjectId } from 'mongodb';

export default withSession(async (req, res) => {
    // Relating to questions required in all new survey responses
    const user = req.session.get('user');
    const { client } = await connectToDatabase();
    const accounts = client.db('courseEvaluation').collection('accounts');
    const surveyQuestions = client.db('courseEvaluation').collection('surveyQuestions');
    const sessionAccount = await accounts.findOne({
        _id: {
            $eq: ObjectId(user._id)
        }
    });

    if (!(user && user._id)) {
        res.status(403).json({
            status: 'Authentication required',
        });
        return;
    }

    if (['POST', 'DELETE'].includes(req.method) && sessionAccount.type !== 'admin') {
        res.status(401).json({
            status: 'Unauthorized',
        });
        return;
    }

    if (req.method === 'GET') {
        // Get all questions
        res.status(200).json({
            questions: await surveyQuestions.findOne({}, {
                questions: 1
            }) || [],
        });
    } else if (req.method === 'POST') {
        // Create new question (admin only)
        const newQuestion = sanitize(req.body.question);

        if (!newQuestion) {
            res.status(400).json({
                status: 'Invalid request. Send a POST with {question:newQuestion}',
            });
            return;
        }

        const result = accounts.updateOne({}, {
            $addToSet: {
                questions: [newQuestion]
            }
        }, {
            upsert: true
        });

        res.status(result.modifiedCount === 1 ? 200 : 500).json({
            status: result.modifiedCount === 1 
                ? 'Successfully inserted question' 
                : 'Could not insert new question',
        });
    } else if (req.method === 'DELETE') {
        // Delete question (admin only)
        const questionToRemove = sanitize(req.body.question);

        if (!questionToRemove) {
            res.status(400).json({
                status: 'Invalid request. Send a DELETE with {question:questionToRemove}',
            });
            return;
        }

        if (!await surveyQuestions.findOne()
            || !await surveyQuestions.findOne({ questions: questionToRemove })) {

            res.status(404).json({
                status: 'Question not found',
            });
            return;

        }

        const result = surveyQuestions.updateOne({}, {
            $pull: {
                questions: {
                    $eq: questionToRemove
                }
            }
        });

        res.status(result.modifiedCount === 1 ? 200 : 500).json({
            status: result.modifiedCount === 1 
                ? 'Successfully deleted question' 
                : 'Could not delete question',
        });
    } else {
        res.status(405).json({
            status: 'Method not allowed. Allowed methods: [GET, POST, DELETE]',
        });
    }
});