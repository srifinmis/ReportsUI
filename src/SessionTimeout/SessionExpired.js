import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

const SessionExpired = () => {
    const navigate = useNavigate();

    const handleGoToLogin = () => {
        localStorage.clear(); // Clean up just in case
        navigate("/", { replace: true });
    };

    return (
        <div style={{  textAlign: "center", padding: "50px" }}>
            <h2>Session Expired</h2>
            <p>Your session has expired. Please log in again.</p>
            <Button
                variant="contained"
                color="error"
                onClick={handleGoToLogin}
            >
                Go to Login
            </Button>
        </div>
    );
};

export default SessionExpired;
