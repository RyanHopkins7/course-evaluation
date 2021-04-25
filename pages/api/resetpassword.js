import withSession from '../../lib/session';
import { connectToDatabase } from '../../util/mongodb';
import { ObjectId } from 'mongodb';
import sanitize from 'mongo-sanitize';
import bcrypt from 'bcrypt';

// VULNERABILITY: lack of rate limiting, CAPTCHA, and CSRF validation

export default withSession(async (req, res) => {
    if (req.method === 'POST') {
        // Reset a user password

        const _id = new ObjectId(sanitize(req.body._id));
        const oldPassword = sanitize(req.body.oldPassword);
        const newPassword = sanitize(req.body.newPassword);
        const saltRounds = 10;

        if (!(_id && oldPassword && newPassword)) {
            res.status(400).json({
                status: 'Request invalid. Send a POST with {_id:_id, oldPassword:oldPassword, newPassword:newPassword}.',
            });
            return;
        }

        const { client } = await connectToDatabase();
        const appAccounts = client.db('courseEvaluation').collection('applicationAccounts');

        const account = await appAccounts.findOne({
            _id: {
                $eq: _id
            }
        });

        if (!account) {
            res.status(404).json({
                status: "User not found.",
            });
            return;
        }

        if (await bcrypt.compare(oldPassword, account.password)) {
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            await appAccounts.updateOne({
                _id: {
                    $eq: _id
                }
            }, {
                $set: {
                    password: newPasswordHash,
                },
            });

            res.status(200).json({
                status: "Successfully reset password.",
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
            status: 'Method invalid. Send a POST with {_id:_id, oldPassword:oldPassword, newPassword:newPassword}.',
        });
        return;
    }
});
