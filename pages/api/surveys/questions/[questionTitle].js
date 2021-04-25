import withSession from '../../../../lib/session';

export default withSession(async (req, res) => {
    const { questionTitle } = req.query;

    console.log(questionTitle);

    res.status(200).json({
        status: "boink",
    });
    return;

    if (req.method === 'GET') {
        // Get question
    } else if (req.method === 'POST') {
        // Create new question (admin only)
    } else if (req.method === 'PATCH') {
        // Update question (admin only)
    } else if (req.method === 'DELETE') {
        // Delete question (admin only)
    } else {
        // 400 Error
    }
});