import withSession from '../../../lib/session';
import { connectToDatabase } from '../../../util/mongodb';
import sanitize from 'mongo-sanitize';
import bcrypt from 'bcrypt';

// VULNERABILITIES: lack of rate limiting, CAPTCHA, CSRF validation

export default withSession(async (req, res) => {
    if (req.method === 'POST') {
        // Authenticate account and create session
        const username = sanitize(req.body.username);
        const password = sanitize(req.body.password);

        if (!(username && password)) {
            res.status(400).json({
                status: 'Invalid request. Send a POST with {username:username, password:password}',
            });
            return;
        }

        const { client } = await connectToDatabase();
        const accounts = client.db('courseEvaluation').collection('accounts');

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

        if (await bcrypt.compare(password, account.password)) {
            await req.session.destroy();
            
            req.session.set('user', {
                _id: account._id,
                username: account.username,
                type: account.type,
            });
    
            await req.session.save();

            res.status(200).json({
                status: 'Successfully logged in',
            });
        } else {
            res.status(403).json({
                status: 'Invalid password',
            });
        }
    } else if (req.method === 'DELETE') {
        // Destroy session
        await req.session.destroy();

        res.status(200).json({
            status: 'Destroyed session',
        });
    } else {
        res.status(405).json({
            status: 'Method not allowed. Allowed methods: [POST, DELETE]',
        });
    }
});