import withSession from '../../lib/session';
import { connectToDatabase } from '../../util/mongodb';
import { ObjectId } from 'mongodb';

export default withSession(async (req, res) => {
    const user = req.session.get('user');
    const { client } = await connectToDatabase();
    const courses = client.db('courseEvaluation').collection('courses');
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

    if (req.method === 'GET') {
        // Get all courses
        res.status(200).json({
            courses: await courses.find().toArray(),
        });
    } else if (req.method === 'POST') {
        // Create new course (admin only)
        const title = sanitize(req.body.title);
        const credits = sanitize(req.body.credits);

        if (sessionAccount.type !== 'admin') {
            res.status(401).json({
                status: 'Unauthorized',
            });
            return;
        }

        if (!title || !credits) {
            res.status(400).json({
                status: 'Invalid request. Send POST with {title:courseTitle, credits:credits}',
            });
            return;
        }

        const newCourse = await courses.insertOne({
            title: title,
            credits: credits
        });
        
        if (!newCourse.insertedId) {
            res.status(500).json({
                status: 'Coult not insert new course',
            });
            return;
        }

        res.status(201).json({
            status: 'Successfully inserted course',
            insertedId: newCourse.insertedId
        });
    } else {
        res.status(405).json({
            status: "Method not allowed. Allowed methods: [GET, POST]",
        });
    }
});