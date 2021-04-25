import withSession from '../../lib/session';
import bcrypt from 'bcrypt';
import { connectToDatabase } from '../../util/mongodb';

// VULNERABILITY: lack of password entropy validation

export default withSession(async (req, res) => {
    if (req.method === 'POST') {
        // Create a user account and session

        const username = req.body.username;
        const password = req.body.password;
        const accountType = req.body.type; // Account type: either student or instructor
        const saltRounds = 10;

        if (!(username && password && accountType)) {
            res.status(400).json({
                status: 'Request invalid. Send a POST with {user:username, password:password, type:type}.',
            });
            return;
        }

        if (!['student', 'instructor'].includes(accountType)) {
            res.status(400).json({
                status: 'Request invalid. Type must be in [student, instructor].',
            });
            return;
        }

        const passwordHash = await bcrypt.hash(password, saltRounds);

        const { client } = await connectToDatabase();
        const appAccounts = client.db('courseEvaluation').collection('applicationAccounts');

        const existingAccount = await appAccounts.findOne({
            username: {
                $eq: username
            }
        });
        
        if (existingAccount) {
            res.status(409).json({
                status: `Username ${username} already taken.`,
            });
            return;
        }

        await appAccounts.createIndex({ username: 1 }, { unique: true });
        await appAccounts.insertOne({
            username: username,
            password: passwordHash,
            type: accountType
        });

        req.session.set('user', {
            username: username,
            type: accountType,
        });

        await req.session.save();

        res.status(200).json({
            status: 'Successfully created account.',
        });
        return;
    } else {
        res.status(405).json({
            status: 'Method invalid. Send a POST with {user:username, password:password, type:type}.',
        });
        return;
    }
});
