import withSession from '../../../../lib/session';
import sanitize from 'mongo-sanitize';
import { connectToDatabase } from '../../../../util/mongodb';
import { ObjectId } from 'mongodb';
import { Map, Set } from 'immutable';

export default withSession(async (req, res) => {
    // Relating to surveys connected to courses related to user
    const { course_id } = sanitize(req.query);
    const user = req.session.get('user');
    const { client } = await connectToDatabase();
    const accounts = client.db('courseEvaluation').collection('accounts');
    const surveyResponses = client.db('courseEvaluation').collection('surveyResponses');
    const surveyQuestions = client.db('courseEvaluation').collection('surveyQuestions');
    const courses = client.db('courseEvaluation').collection('courses');

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

    if (req.method === 'GET') {
        // Get survey responses
        if (sessionAccount.type !== 'admin' || !sessionAccount.courses.includes(course_id)) {
            res.status(401).json({
                status: 'Unauthorized',
            });
            return;
        }

        if (sessionAccount.type === 'instructor') {
            res.status(200).json({
                responses: await surveyResponses.find({
                    course: {
                        $eq: ObjectId(course_id)
                    }
                }).toArray(),
            });
        } else {
            res.status(200).json({
                response: await surveyResponses.findOne({
                    course: {
                        $eq: ObjectId(course_id)
                    },
                    completedBy: {
                        $eq: ObjectId(sessionAccount._id)
                    }
                }),
            });
        }
    } else if (req.method === 'POST') {
        // Submit new survey response (student only)
        const responses = Map(sanitize(req.body.responses));

        if (sessionAccount.type !== 'student' || !sessionAccount.courses.includes(course_id)) {
            res.status(401).json({
                status: 'Unauthorized',
            });
            return;
        }

        if (!responses) {
            res.status(400).json({
                status: 'Invalid request. Send POST with {responses: {q1:r1, q2:r2}}',
            });
            return;
        }

        if (!Set.fromKeys(responses).equals(Set(await surveyQuestions.findOne({}, {
            questions: 1
        })))) {
            res.status(400).json({
                status: 'Invalid request. Answer all questions from /api/surveys/questions',
            });
            return;
        }

        if (await surveyResponses.findOne({
            completedBy: {
                $eq: ObjectId(studentId)
            },
            course: {
                $eq: ObjectId(course_id)
            }
        })) {
            res.status(409).json({
                status: 'Survey response already submitted',
            });
            return;
        }

        const result = await surveyResponses.insertOne({
            completedBy: sessionAccount._id,
            course: ObjectId(course_id),
            responses: responses,
            timeCompleted: new Date()
        });

        res.status(!!result.insertedId ? 200 : 500).json({
            status: !!result.insertedId
                ? 'Successfully submitted survey response' 
                : 'Could not submit survey response',
        });
    } else if (req.method === 'DELETE') {
        // Delete survey response (admin only)
        const studentId = sanitize(req.body.studentId);

        if (sessionAccount.type !== 'admin') {
            res.status(401).json({
                status: 'Unauthorized',
            });
            return;
        }

        if (!studentId) {
            res.status(400).json({
                status: 'Invalid request. Send DELETE with {studentId:student_id}',
            });
            return;
        }

        try {
            ObjectId(studentId);
        } catch (err) {
            res.status(400).json({
                status: 'Invalid student id. Must be 12 bytes',
            });
            return;
        }

        if (!await surveyResponses.findOne({
            completedBy: {
                $eq: ObjectId(studentId)
            },
            course: {
                $eq: ObjectId(course_id)
            }
        })) {
            res.status(404).json({
                status: 'Survey response not found',
            });
            return;
        }

        const result = await surveyResponses.deleteOne({
            completedBy: {
                $eq: ObjectId(studentId)
            },
            course: {
                $eq: ObjectId(course_id)
            }
        });

        res.status(result.deletedCount === 1 ? 200 : 500).json({
            status: result.deletedCount === 1
                ? 'Successfully deleted account' 
                : 'Could not delete account',
        });
    } else {
        res.status(405).json({
            status: 'Method not allowed. Allowed methods: [GET, POST, DELETE]',
        });
        return;
    }
});