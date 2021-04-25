import withSession from '../../../lib/session';

export default withSession(async (req, res) => {
    const { courseName } = req.query;

    console.log(courseName);

    res.status(200).json({
        status: "boink",
    });
    return;

    if (req.method === 'GET') {
        // Get survey responses
    } else if (req.method === 'POST') {
        // Create new survey response
    } else if (req.method === 'PATCH') {
        // Update survey response
    } else if (req.method === 'DELETE') {
        // Delete survey response
    } else {
        // 400 Error
    }
});