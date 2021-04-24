import withSession from '../../lib/session';
import { connectToDatabase } from '../../util/mongodb';

export default withSession(async (req, res) => {
    if (req.method === 'POST') {
        const { client } = await connectToDatabase();

        // TODO: create user in database

        // TODO: create user session
        // req.session.set('user', {
        //     id: 230,
        //     admin: true,
        // });

        // await req.session.save();

        res.status(200).json({
            status: "Successfully logged in.",
        });
    } else {
        res.status(405).json({
            status: "Method invalid. Send a POST with {user:username, password:password}.",
        });
    }
});
