import Link from 'next/link';

export default function Header(props) {
    return (
        <div className="header">
            <p>{props.user.username}</p>

            <Link href="/profile">
                <a>Profile</a>
            </Link>

            <br />

            <Link href="/logout">
                <a>Log out</a>
            </Link>
        </div>
    );
}
