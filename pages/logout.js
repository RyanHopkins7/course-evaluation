import withSession from '../lib/session';

export default function LogOut() {
    return <h2>Logging out...</h2>;
}

export const getServerSideProps = withSession(async function ({ req, res }) {
    // Clear session and redirect to login
    await req.session.destroy();

    return {
        redirect: {
            destination: '/login',
            permanent: false,
        },
    };
});
