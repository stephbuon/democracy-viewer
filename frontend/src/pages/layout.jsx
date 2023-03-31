import {Link} from 'react-router-dom';
import {useNavigate, useLocation} from 'react-router-dom';
export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return <>
    <nav className="navbar text-white bg-dark">
      <div className="container-fluid row">
        <div className="col">
          <nav className="navbar justify-content-left">
            {location.pathname !== "/login" && <Link className="btn btn-primary" to="/login" >Login or register</Link>}
            {location.pathname === "/login" && <Link className="btn btn-primary" to="/" >Back</Link>}
          </nav>
        </div>
        <div className="col">
          <nav className="navbar navbar-dark bg-dark justify-content-center">
            <Link className="navbar-brand fs-3" href='#' to={'/'}>Graphs4Dayz</Link>
          </nav>
        </div>
        <div className="col">
          <nav className="navbar justify-content-end">
            <div>
              {location.pathname !== "/graph" && <Link className="btn btn-primary me-4" to="/graph" >View Graph</Link>}
              {location.pathname === "/graph" && <Link className="btn btn-primary me-4" to="/" >Close Graph</Link>}
            </div>
          </nav>
        </div>
      </div>
    </nav>
  </>;
}
