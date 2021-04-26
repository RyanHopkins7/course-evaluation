import withSession from '../../../lib/session';
import { connectToDatabase } from '../../../util/mongodb';
import { ObjectId } from 'mongodb';
import sanitize from 'mongo-sanitize';

export default withSession(async (req, res) => {
    const { course_id } = sanitize(req.query);
    const user = req.session.get('user');
    const { client } = await connectToDatabase();
    const accounts = client.db('courseEvaluation').collection('accounts');
    const courses = client.db('courseEvaluation').collection('courses');

    if (!(user && user._id)) {
        res.status(403).json({
            status: 'Authentication required',
        });
        return;
    }

    try {
        ObjectId(courseId);
    } catch (err) {
        res.status(400).json({
            status: 'Invalid course id. Must be 12 bytes',
        });
        return;
    }

    const sessionAccount = await accounts.findOne({
        _id: {
            $eq: ObjectId(user._id)
        }
    });

    if (['PATCH', 'DELETE'].includes(req.method) && sessionAccount.type !== 'admin') {
        res.status(401).json({
            status: 'Unauthorized',
        });
        return;
    }

    if (req.method === 'GET') {
        // Get course info
        const course = await courses.findOne({
            _id: {
                $eq: ObjectId(course_id)
            }
        });
    
        if (course) {
            res.status(200).json({
                course: course,
            });
        } else {
            res.status(404).json({
                status: 'Course not found',
            });
        }
        return;
    } else if (req.method === 'PATCH') {
        // Update course (admin only)
    } else if (req.method === 'DELETE') {
        // Delete course (admin only)
    } else {
        res.status(405).json({
            status: 'Method not allowed. Allowed methods: [GET, PATCH, DELETE]',
        });
        return;
    }
});