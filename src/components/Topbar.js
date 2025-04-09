// import React from "react";

// const Topbar = () => {
//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "50px",
//         backgroundColor: "#000957",
//         display: "flex",
//         alignItems: "center",
//         zIndex: 1000,
//         paddingLeft: "16px",
//       }}
//     >
//       {/* Logo with white background */}
//       <div
//         style={{
//           width: "160px",
//           height: "40px",
//           backgroundColor: "#ffffff", // White background for the logo
//           borderRadius: "8px", // Optional: rounded corners
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           marginRight: "40px", // Space between the logo and the text
//         }}
//       >
//         <img
//           src="./SriFin_Logo.png" // Replace with your actual logo path
//           alt="Logo"
//           style={{
//             width: "100px", // Adjust the size inside the white box
//             height: "30px",
//           }}
//         />
//       </div>

//       {/* Static page title */}
//       <h2
//         style={{
//           color: "#FFFFFF",
//           margin: 10,
//           fontWeight: "normal",
//           fontSize: "22px",
//         }}
//       >
//         Reports
//       </h2>
//     </div>
//   );
// };

// export default Topbar;
import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assests/SriFin_Logo.png"

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "50px",
        backgroundColor: "#000957",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 1000,
        padding: "0 16px",
      }}
    >
      {/* Left section: Logo and Title */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: "160px",
            height: "40px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "40px",
          }}
        >
          <img
            src={Logo}
            alt="Logo"
            style={{ width: "100px", height: "30px" }}
          />
        </div>
        <h2
          style={{
            color: "#FFFFFF",
            margin: 0,
            fontWeight: "normal",
            fontSize: "22px",
          }}
        >
          Reports
        </h2>
      </div>

      {/* Right section: Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: "#f87171",
          color: "#ffffff",
          padding: "10px 16px",
          borderRadius: "10px",
          marginRight: "50px",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Topbar;
