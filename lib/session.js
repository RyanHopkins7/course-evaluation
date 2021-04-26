import { withIronSession } from 'next-iron-session';

export default function withSession(handler) {
    // Wrapper for withIronSession
    return withIronSession(handler, {
        password: process.env.IRON_SESSION_PK,
        cookieName: 'course-evaluation-session',
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
        },
    });
}