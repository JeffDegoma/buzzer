import Link from 'next/link';

const Navbar = () => (
<nav className="navbar navbar-expand navbar-dark bg-dark mb-4">
  <div className="collapse navbar-collapse">
    <ul className="navbar-nav m1-auto">
      <li className="nav-item">
       <Link href="/"><a>Home</a></Link>
      </li>
      <li className="nav-item">
       <Link href="/about"><a>About</a></Link>
      </li>
    </ul>
    </div>
</nav>
)

export default Navbar;