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
        ObjectId(course_id);
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

    const course = await courses.findOne({
        _id: {
            $eq: ObjectId(course_id)
        }
    });

    if (!course) {
        res.status(404).json({
            status: 'Course not found',
        });
        return;
    }

    if (req.method === 'GET') {
        // Get course info
        res.status(200).json({
            course: course,
        });
    } else if (req.method === 'PATCH') {
        // Update course (admin only)
        const title = sanitize(req.body.title);
        const credits = sanitize(req.body.credits);

        if (!title && !credits) {
            res.status(400).json({
                status: 'Invalid request. Send POST with {title:courseTitle, credits:credits}',
            });
            return;
        }

        const result = await courses.updateOne({
            _id: {
                $eq: ObjectId(course_id)
            }
        }, {
            $set: {
                title: title || course.title,
                credits: credits || course.credits,
            },
        });

        res.status(result.modifiedCount === 1 ? 200 : 500).json({
            status: result.modifiedCount === 1
                ? 'Successfully updated course'
                : 'Could not update course',
        });
    } else if (req.method === 'DELETE') {
        // Delete course (admin only)
        const result = await accounts.deleteOne({
            _id: {
                $eq: ObjectId(course_id)
            }
        });

        res.status(result.deletedCount === 1 ? 200 : 500).json({
            status: result.modifiedCount === 1
                ? 'Successfully deleted course'
                : 'Could not delete course',
        });
    } else {
        res.status(405).json({
            status: 'Method not allowed. Allowed methods: [GET, PATCH, DELETE]',
        });
    }
});