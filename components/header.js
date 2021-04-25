import Link from 'next/link';
import Image from 'next/image';
import { AiFillCaretDown } from 'react-icons/ai';
import { useState } from 'react';

export default function Header(props) {
    const [profileHovered, setProfileHovered] = useState(false);

    const mouseHover = event => {
        setProfileHovered(event.type === 'mouseenter');
    };

    return (
        <div className="header">
            <Link href="/">
                <a>
                    <Image src="/mtu_logo.png" alt="me" width="300" height="55" />
                </a>
            </Link>

            {/* {profileHovered && 
                <span className="navItem">
                    <Link href="/profile">
                        <a>Profile</a>
                    </Link>

                    <Link href="/logout">
                        <a>Log out</a>
                    </Link>
                </span>
            } */}

            {props.user
                ?
                <div className="navItem navProfile" onMouseEnter={mouseHover} onMouseLeave={mouseHover}>
                    <p>
                        {props.user.username} <AiFillCaretDown />
                    </p>
                    {profileHovered &&
                        <div className="dropdown">
                            <Link href="/profile">
                                <a>
                                    <div className="dropdownItem">Profile</div>
                                </a>
                            </Link>

                            <Link href="/logout">
                                <a>
                                    <div className="dropdownItem">Log out</div>
                                </a>
                            </Link>
                        </div>}
                </div>
                :
                <div className="navItem">
                    <Link href="/login">
                        <a className="navItem">Log In</a>
                    </Link>

                    <Link href="/createaccount">
                        <a className="navItem">Create Account</a>
                    </Link>
                </div>
            }
        </div>
    );
}
