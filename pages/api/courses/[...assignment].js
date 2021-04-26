import withSession from '../../../lib/session';
import sanitize from 'mongo-sanitize';
import { connectToDatabase } from '../../../util/mongodb';
import { ObjectId } from 'mongodb';

export default withSession(async (req, res) => {
    // Student and instructor course assignment/registration

    const { assignment } = sanitize(req.query);
    const [courseId, assignmentType, username] = assignment;
    const { client } = await connectToDatabase();
    const accounts = client.db('courseEvaluation').collection('accounts');
    const courses = client.db('courseEvaluation').collection('courses');
    const user = req.session.get('user');

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

    const account = await accounts.findOne({
        username: {
            $eq: username
        }
    });

    try {
        ObjectId(courseId);
    } catch (err) {
        res.status(400).json({
            status: 'Invalid course id. Must be 12 bytes',
        });
        return;
    }

    const course = await courses.findOne({
        _id: {
            $eq: ObjectId(courseId)
        }
    });

    if (assignment.length != 3
        || !['students', 'instructors'].includes(assignmentType)
        || account.type !== assignmentType) {
        res.status(404).json({
            status: 'Not found. Send [GET, POST, DELETE] to /api/courses/{course_id}/{students|instructors}/{studentName}',
        });
        return;
    }

    if (!sessionAccount || !account) {
        res.status(404).json({
            status: 'User not found',
        });
        return;
    }

    if (!course) {
        res.status(404).json({
            status: 'Course not found',
        });
        return;
    }

    if (sessionAccount.username !== username && sessionAccount.type !== 'admin') {
        res.status(401).json({
            status: 'Unauthorized',
        });
        return;
    }

    if (req.method === 'GET') {
        // Check if user is assigned to course
        res.status(200).json({
            assigned: !!(account.courses && account.courses.includes(courseId)),
        });
        return;
    } else if (req.method === 'POST') {
        // Assign user to course
        if (account.courses && account.courses.includes(courseId)) {
            res.status(409).json({
                status: 'User already assigned to course',
            });
            return;
        }

        const result = accounts.updateOne({
            _id: {
                $eq: account._id
            }
        }, {
            $addToSet: {
                courses: [courseId]
            }
        });

        if (result.modifiedCount === 1) {
            res.status(200).json({
                status: 'Successfully assigned course to user'
            });
        } else {
            res.status(500).json({
                status: 'Could not assign course to user'
            });
        }
        return;
    } else if (req.method === 'DELETE') {
        // Unassign user from course
        if (!(account.courses && account.courses.includes(courseId))) {
            res.status(404).json({
                status: 'User is not assigned this course',
            });
            return;
        }

        const result = accounts.updateOne({
            _id: {
                $eq: account._id
            }
        }, {
            $pull: {
                courses: {
                    $eq: courseId
                }
            }
        });

        if (result.modifiedCount === 1) {
            res.status(200).json({
                status: 'Successfully unassigned course from user'
            });
        } else {
            res.status(500).json({
                status: 'Could not unassign course from user'
            });
        }
        return;
    } else {
        res.status(405).json({
            status: 'Method not allowed. Allowed methods: [GET, POST, DELETE]',
        });
        return;
    }
});
