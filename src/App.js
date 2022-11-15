import './App.css';
import React from 'react';
import './style.css';
import logo from "./images/logo.png";
import signup from './signup';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <Router>
  <img src={logo} alt="logo" className="logo" />
  <br />
  <div className="text">
    Where MUSIC <br />
    comes
    <br />
    to life
    <br />
  </div>
  <div className="buttons">
    <Link to="/login">
      <button className="button btn btn-light">
        LOGIN
      </button>
    </Link>
    <br />
      <Link to="/signup">
        <button className="button signupbtn btn btn-light" src="./signup.html">
          SIGNUP
        </button>
      </Link>
  </div>

  <Routes>
    <Route path="/signup">
      
    </Route>
  </Routes>
</Router>
  );
}

export default App;
