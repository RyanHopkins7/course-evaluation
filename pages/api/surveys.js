import withSession from '../../lib/session';

export default withSession(async (req, res) => {
    res.status(200).json({
        status: "boink",
    });
    return;

    if (req.method === 'GET') {
        // Get survey responses
    } else {
        // 400 Error
    }
});