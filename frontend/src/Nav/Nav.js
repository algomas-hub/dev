import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';


function Nav(){
return(
    <nav id="nv" className="navbar navbar-expand-md navbar-dark bg-dark">
        <div className="container-fluid">
            <Link className="navbar-brand" to="/">Navbar</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                        <Link className="nav-link active" aria-current="page" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/link">Link</Link>
                    </li>
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#noop" onClick={(e) => e.preventDefault()} role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Dropdown
                        </a>
                        <ul className="dropdown-menu">
                            <li><button className="dropdown-item" type="button" style={{background: 'none', border: 'none', width: '100%', textAlign: 'left'}}>Action</button></li>
                            <li><button className="dropdown-item" type="button" style={{background: 'none', border: 'none', width: '100%', textAlign: 'left'}}>Another action</button></li>
                           
                            <li><button className="dropdown-item" type="button" style={{background: 'none', border: 'none', width: '100%', textAlign: 'left'}}>Something else here</button></li>
                        </ul>
                    </li>
                    <li className="nav-item">
                        <span className="nav-link disabled" aria-disabled="true">Disabled</span>
                    </li>
                </ul>
                <form className="d-flex" role="search">
                    <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                    <button className="btn btn-outline-success" type="submit">Search</button>
                </form>
            </div>
        </div>
    </nav>


   );
}

export default Nav;