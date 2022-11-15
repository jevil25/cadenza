import './App.css';
import React from 'react';
import './signup.css';
import logo from "./images/logo.png";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";

function signup(){
    return (
        <Router>
            <div className="main">
                <div className="left">
                    <div className="logo">
                    <img src="./cadenza logo.png" className="logo" />
                    </div>
                    <div className="symbols"></div>
                </div>
                <form action="/signup" method="post">
                    <div className="login_form right">
                    <input type="text" placeholder="Full Name" name="fullName" />
                    <input type="text" placeholder="Email" name="email" />
                    <input type="number" placeholder="Ph Number" name="phNumber" />
                    <input type="text" placeholder="Password" name="password" />
                    <input
                        type="text"
                        placeholder="Confirm Password"
                        name="confirmPassword"
                    />
                    <button className="submit_btn">Submit</button>
                    </div>
                </form>
            </div>
        </Router>
    )
}

export default signup;