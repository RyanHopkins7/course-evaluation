import withSession from '../../../lib/session';
import sanitize from 'mongo-sanitize';
import { connectToDatabase } from '../../../util/mongodb';
import { ObjectId } from 'mongodb';

export default withSession(async (req, res) => {
    // Student and instructor course assignment/registration

    const { assignment } = sanitize(req.query);
    const [course_id, assignmentType, username] = assignment;
    const { client } = await connectToDatabase();
    const accounts = client.db('courseEvaluation').collection('accounts');
    const courses = client.db('courseEvaluation').collection('courses');
    const user = req.session.get('user');

    if (assignment.length > 3
        || assignment.length < 2
        || !['students', 'instructors'].includes(assignmentType)
        || (req.method !== 'GET' && assignment.length === 2)) {

        res.status(404).json({
            status: 'Not found. ' +
                'Send [GET, POST, DELETE] to /api/courses/{course_id}/{students|instructors}/{username} ' +
                'or [GET] to /api/courses/{course_id}/{students|instructors}',
        });
        return;

    }

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
        ObjectId(course_id);
    } catch (err) {
        res.status(400).json({
            status: 'Invalid course id. Must be 12 bytes',
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

    const account = await accounts.findOne({
        username: {
            $eq: username
        }
    });

    if (!account && assignment.length == 3) {
        res.status(404).json({
            status: 'User not found',
        });
        return;
    }

    // Only allow admins or account owners to assign or unassign
    if (req.method !== 'GET'
        && sessionAccount.username !== username
        && sessionAccount.type !== 'admin') {

        res.status(401).json({
            status: 'Unauthorized',
        });
        return;

    }

    if (req.method === 'GET') {
        if (assignment.length === 3) {
            // Check if user is assigned to course
            res.status(200).json({
                assigned: !!(account.courses && account.courses.includes(course_id)),
            });
        } else {
            // Get all students and instructors assigned to a course
            const assignedAccounts = accounts.find({
                type: {
                    $eq: assignmentType
                },
                courses: ObjectId(course_id)
            }, {
                _id: 1,
                username: 1
            });

            res.status(200).json({
                [assignmentType]: await assignedAccounts.toArray(),
            });
        }
    } else if (req.method === 'POST') {
        // Assign user to course
        if (account.courses && account.courses.some(course => course.toString() === course_id)) {
            res.status(409).json({
                status: 'User already assigned to course',
            });
            return;
        }

        const result = await accounts.updateOne({
            _id: {
                $eq: account._id
            }
        }, {
            $addToSet: {
                courses: ObjectId(course_id)
            }
        }, {
            upsert: true
        });

        res.status(result.modifiedCount === 1 ? 201 : 500).json({
            status: result.modifiedCount === 1
                ? 'Successfully assigned course to user'
                : 'Could not assign course to user',
        });
    } else if (req.method === 'DELETE') {
        // Unassign user from course
        if (!(account.courses && account.courses.includes(course_id))) {
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
                    $eq: ObjectId(course_id)
                }
            }
        });

        res.status(result.modifiedCount === 1 ? 200 : 500).json({
            status: result.modifiedCount === 1
                ? 'Successfully unassigned course from user'
                : 'Could not unassign course from user',
        });
    } else {
        res.status(405).json({
            status: 'Method not allowed. Allowed methods: [GET, POST, DELETE]',
        });
    }
});
