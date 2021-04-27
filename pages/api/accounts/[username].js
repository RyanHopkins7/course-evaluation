import withSession from '../../../lib/session';
import sanitize from 'mongo-sanitize';
import { connectToDatabase } from '../../../util/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

// VULNERABILITIES: lack of rate limiting, CAPTCHA, CSRF validation, password entropy validation

export default withSession(async (req, res) => {
    const { username } = sanitize(req.query);
    const user = req.session.get('user');
    const saltRounds = 10;
    const { client } = await connectToDatabase();
    const accounts = client.db('courseEvaluation').collection('accounts');

    if (['GET', 'PATCH', 'DELETE'].includes(req.method)) {
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

        // User must either share the name of account being requested or be an admin
        if (sessionAccount.username !== username && sessionAccount.type !== 'admin') {
            res.status(401).json({
                status: 'Unauthorized',
            });
            return;
        }

        const account = await accounts.findOne({
            username: {
                $eq: username
            }
        });

        if (!account) {
            res.status(404).json({
                status: 'Username not found',
            });
            return;
        }
    }

    if (req.method === 'GET') {
        // Get account info
        const account = await accounts.findOne({
            username: {
                $eq: username
            }
        });

        if (user.type === 'admin') {
            res.status(200).json({
                account: account,
            });
        } else {
            res.status(200).json({
                account: {
                    _id: account._id,
                    username: account.username,
                    type: account.type,
                },
            });
        }
    } else if (req.method === 'POST') {
        // Create new account
        const password = sanitize(req.body.password);
        // Students or instructors (admin off limits)
        const accountType = sanitize(req.body.type);

        if (!(password && accountType)) {
            res.status(400).json({
                status: 'Invalid request. Send a POST with {password:password, type:type}',
            });
            return;
        }

        if (!['students', 'instructors'].includes(accountType)) {
            res.status(400).json({
                status: 'Invalid request. Allowed account types: [students, instructors]',
            });
            return;
        }

        const existingAccount = await accounts.findOne({
            username: {
                $eq: username
            }
        });

        if (existingAccount) {
            res.status(409).json({
                status: `Username ${username} already taken`,
            });
            return;
        }

        const passwordHash = await bcrypt.hash(password, saltRounds);

        await accounts.createIndex({ username: 1 }, { unique: true });
        const newAccount = await accounts.insertOne({
            username: username,
            password: passwordHash,
            type: accountType
        });

        if (!newAccount.insertedId) {
            res.status(500).json({
                status: 'Coult not create account',
            });
            return;
        }

        await req.session.destroy();

        req.session.set('user', {
            _id: newAccount.insertedId,
            username: username,
            type: accountType,
        });

        await req.session.save();

        res.status(201).json({
            status: 'Successfully created account',
        });
    } else if (req.method === 'PATCH') {
        // Reset password
        const oldPassword = sanitize(req.body.oldPassword);
        const newPassword = sanitize(req.body.newPassword);

        const sessionAccount = await accounts.findOne({
            _id: {
                $eq: ObjectId(user._id)
            }
        });

        if (!newPassword && (!oldPassword || sessionAccount.type !== 'admin')) {
            res.status(400).json({
                status: 'Invalid request. Send a PATCH with {oldPassword:oldPassword, newPassword:newPassword}',
            });
            return;
        }

        const account = await accounts.findOne({
            username: {
                $eq: username
            }
        });

        // Admin can reset passwords for non-admin accounts
        if ((sessionAccount.type === 'admin' && account.type !== 'admin')
            || await bcrypt.compare(oldPassword, account.password)) {

            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            const result = await accounts.updateOne({
                username: {
                    $eq: username
                }
            }, {
                $set: {
                    password: newPasswordHash,
                },
            });

            res.status(result.modifiedCount === 1 ? 200 : 500).json({
                status: result.modifiedCount === 1
                    ? 'Successfully reset password'
                    : 'Could not reset password',
            });

        } else {
            res.status(401).json({
                status: 'Invalid old password',
            });
        }
    } else if (req.method === 'DELETE') {
        // Delete account
        const result = await accounts.deleteOne({
            username: {
                $eq: username
            }
        });

        res.status(result.deletedCount === 1 ? 200 : 500).json({
            status: result.deletedCount === 1
                ? 'Successfully deleted account'
                : 'Could not delete account',
        });
    } else {
        res.status(405).json({
            status: 'Method not allowed. Allowed methods: [GET, POST, PATCH, DELETE]',
        });
    }
});