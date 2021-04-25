import withSession from '../../../lib/session';

export default withSession(async (req, res) => {
    const { courseName } = req.query;

    console.log(courseName);

    res.status(200).json({
        status: "boink",
    });
    return;

    if (req.method === 'GET') {
        // Get course info
    } else if (req.method === 'POST') {
        // Create new course (admin only)
    } else if (req.method === 'PATCH') {
        // Update course (admin only)
    } else if (req.method === 'DELETE') {
        // Delete course (admin only)
    } else {
        // 400 Error
    }
});