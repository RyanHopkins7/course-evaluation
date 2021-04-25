import withSession from '../../lib/session';

export default withSession(async (req, res) => {
    res.status(200).json({
        status: "boink",
    });
    return;

    if (req.method === 'GET') {
        // Get all courses
    } else {
        // 400 Error
    }
});