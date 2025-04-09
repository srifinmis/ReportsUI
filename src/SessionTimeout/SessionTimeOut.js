import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
// console.log("session: ", SESSION_TIMEOUT)

const SessionTimeout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hasNavigated, setHasNavigated] = useState(false);

    useEffect(() => {
        // Skip session check on login or expired pages
        if (location.pathname === "/" || location.pathname === "/session-expired") return;

        const checkSession = () => {
            const storedTime = parseInt(localStorage.getItem("loginTime"), 10);
            if (storedTime && Date.now() - storedTime > SESSION_TIMEOUT) {
                localStorage.clear();
                if (!hasNavigated) {
                    setHasNavigated(true);
                    navigate("/session-expired", { replace: true });
                }
            }
        };

        const interval = setInterval(checkSession, 5000); // every 5 sec

        return () => clearInterval(interval);
    }, [location.pathname, navigate, hasNavigated]);

    return null;
};

export default SessionTimeout;
