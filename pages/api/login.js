import withSession from '../../lib/session';

export default withSession(async (req, res) => {
    if (req.method === 'POST') {
        // Create a session

        // TODO: get user from database 
        req.session.set('user', {
            id: 230,
            admin: true,
        });

        await req.session.save();

        res.status(200).json({
            status: "Successfully logged in.",
        });
    } else {
        res.status(405).json({
            status: "Method invalid. Send a POST with {user:username, password:password}.",
        });
    }
});
