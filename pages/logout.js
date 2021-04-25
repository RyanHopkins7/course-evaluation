import withSession from '../lib/session';

export default function LogOut() {
    return <h1>Logging out...</h1>;
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
