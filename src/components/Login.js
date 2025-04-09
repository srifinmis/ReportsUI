import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { Link, useNavigate } from "react-router-dom";
import Logo from "../assests/SriFin_Logo.png"
import "./Login.css";
import { APIURL } from '../configuration';
const Login = () => {
    const [emp_id, setEmpId] = useState("");
    const [passwd, setPassword] = useState("");
    const [message, setMessage] = useState("");
    // const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // const API_URL =request.login_user;
    const API_URL = process.env.REACT_APP_API_URL;
    console.log('app_url: ', API_URL)

    const handleLogin = async (e) => {
        e.preventDefault();
        // setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`${APIURL}/api/reports/Login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ emp_id, passwd }),
            });
            const data = await response.json();
            console.log('data is: ', data)
            if (response.ok) {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("loginSuccess", "true");
                localStorage.setItem("loginTime", Date.now().toString());
                localStorage.setItem("token", data.token)
                // setMessage("Login successful ✅");
                // console.log('success logged response ok')
                navigate("/dashboard");
            } else {
                toast.error("Login failed! Please check your credentials.");
                // setMessage(data.message || "Login failed ❌");
            }
        } catch (error) {
            toast.error("Error connecting to the server");
            // setMessage("Error connecting to the server ⚠️");
        }
    };

    return (
        <div className="main-div">
            <div className="login-container">
                {/* Left Section */}
                <div className="login-left">
                <img src={Logo} alt="SriFin Logo" width="140" height="60" />
                    <h2> SUMMARY REPORTS</h2>
                    <p>Effortlessly download your Reports with ease!</p>
                    <h3>Log in to access your account</h3>
                </div>

                {/* Right Section */}
                <div className="login-right">
                    <form onSubmit={handleLogin}>
                        <h2>LOGIN</h2>
                        <input
                            type="text"
                            placeholder="User Name"
                            required
                            value={emp_id}
                            onChange={(e) => setEmpId(e.target.value)}
                        />
                        <input
                            type="Password"
                            placeholder="Password"
                            required
                            value={passwd}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="submit" className="login-btn">LOGIN</button>
                    </form>
                    {message && <p className="message">{message}</p>}

                    {/* <Link to="/ForgotPassword" className="forgot-password">
                        Forgot Password?
                    </Link> */}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Login;