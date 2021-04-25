import withSession from '../../lib/session';
import { connectToDatabase } from '../../util/mongodb';
import bcrypt from 'bcrypt';
import sanitize from 'mongo-sanitize';

// VULNERABILITY: lack of rate limiting, CAPTCHA, and CSRF validation

export default withSession(async (req, res) => {
    if (req.method === 'POST') {
        // Create a user session

        const username = sanitize(req.body.username);
        const password = sanitize(req.body.password);

        if (!(username && password)) {
            res.status(400).json({
                status: 'Request invalid. Send a POST with {user:username, password:password}.',
            });
            return;
        }

        const { client } = await connectToDatabase();
        const appAccounts = client.db('courseEvaluation').collection('applicationAccounts');

        const account = await appAccounts.findOne({
            username: {
                $eq: username
            }
        });

        if (!account) {
            res.status(404).json({
                status: "Username not found.",
            });
            return;
        }

        if (await bcrypt.compare(password, account.password)) {
            req.session.set('user', {
                _id: account._id,
                username: account.username,
                type: account.type,
            });
    
            await req.session.save();

            res.status(200).json({
                status: "Successfully logged in.",
            });
            return;
        } else {
            res.status(403).json({
                status: "Invalid password.",
            });
            return;
        }

    } else {
        res.status(405).json({
            status: "Method invalid. Send a POST with {user:username, password:password}.",
        });
        return;
    }
});
