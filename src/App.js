// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Topbar from './components/Topbar';
// import Reports from './components/Reports';
// import Reupload from './components/Reupload'; 
// import LoanDetailsReport from './components/LoanDetailsReport';
// import Lucreport from './components/LUCReport';
// import BorrowerMasterReport from './components/BorrowMasterReport';
// import CreditReport from './components/CreditReport';
// import DeathReport from './components/DeathReport';
// import EmployeeMasterReport from './components/EmployeeMasterReport';
// import ForeClosureReport from './components/ForeClouserReport';
// import LoanApplicationReport from './components/LoanApplicationReport';
// import ReportsLogin from './components/Login'
// const App = () => {
//   return (
//     <Router>
//       <div style={{ display: 'flex', minHeight: '100vh' }}>

//         {/* Fixed Sidebar */}
//         <div style={{
//           position: 'fixed', 
//           top: 0, 
//           left: 0, 
//           bottom: 0, 
//           width: '160px', 
//           backgroundColor: '#fff', 
//           zIndex: 100
//         }}>
//           <Navbar />
//         </div>

//         {/* Main Content Section */}
//         <div style={{
//           marginLeft: '240px', 
//           paddingTop: '60px', 
//           flexGrow: 1
//         }}>

//           {/* Fixed Topbar */}
//           <div style={{
//             position: 'fixed',
//             top: 0,
//             left: '240px',
//             right: 0,
//             backgroundColor: '#fff',
//             zIndex: 101,
//             width: 'calc(100% - 260px)', 
//             height: '60px'
//           }}>
//             <Topbar />
//           </div>

//           {/* Page Content */}
//           <div style={{ marginTop: '-40px', padding: '20px' }}>
//             <Routes>
//               <Route path="/" element={<ReportsLogin />} />
//               <Route path="/components/Reports" element={<Reports />} />
//               <Route path="/components/Reupload" element={<Reupload />} />
//               <Route path="/components/LoanDetailsReport" element={<LoanDetailsReport />} />
//               <Route path="/components/LUCReport" element={<Lucreport />} /> 
//               <Route path="/components/BorrowMasterReport" element={<BorrowerMasterReport />} />
//               <Route path="/components/CreditReport" element={<CreditReport />} />
//               <Route path="/components/DeathReport" element={<DeathReport />} />
//               <Route path="/components/EmployeeMasterReport" element={<EmployeeMasterReport />} />
//               <Route path="/components/LoanApplicationReport" element={<LoanApplicationReport />} />
//               <Route path="/components/ForeClouserReport" element={<ForeClosureReport />} />
//             </Routes>
//           </div>
//         </div>
//       </div>
//     </Router>
//   );
// };

// export default App;


import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Topbar from "./components/Topbar";
import Reports from './components/Reports';
import Reupload from './components/Reupload';
import LoanDetailsReport from './components/LoanDetailsReport';
import Lucreport from './components/LUCReport';
import BorrowerMasterReport from './components/BorrowMasterReport';
import CreditReport from './components/CreditReport';
import DeathReport from './components/DeathReport';
import EmployeeMasterReport from './components/EmployeeMasterReport';
import ForeClosureReport from './components/ForeClouserReport';
import LoanApplicationReport from './components/LoanApplicationReport';
import Login from './components/Login';
import SessionExpired from "./SessionTimeout/SessionExpired";
import SessionTimeout from "./SessionTimeout/SessionTimeOut";
import Dashboard from "./components/Dashboard";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/dashborad" />;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const showLayout = location.pathname !== "/"; // Don't show Navbar/Topbar on login

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      {showLayout && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: "160px",
            backgroundColor: "#fff",
            zIndex: 100,
          }}
        >
          <Navbar />
        </div>
      )}

      {/* Main Content */}
      <main
        style={{
          flexGrow: 1,
          padding: "20px",
          marginLeft: showLayout ? "240px" : "0",
        }}
      >
        <SessionTimeout />

        {/* Topbar */}
        {showLayout && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: "240px",
              right: 0,
              backgroundColor: "#fff",
              zIndex: 101,
              width: "calc(100% - 260px)",
              height: "60px",
            }}
          >
            <Topbar />
          </div>
        )}

        <div style={{ marginTop: showLayout ? "70px" : "0" }}>
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/components/Reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/components/Reupload" element={<ProtectedRoute><Reupload /></ProtectedRoute>} />
          <Route path="/components/LoanDetailsReport" element={<ProtectedRoute><LoanDetailsReport /></ProtectedRoute>} />
          <Route path="/components/LUCReport" element={<ProtectedRoute><Lucreport /></ProtectedRoute>} />
          <Route path="/components/BorrowMasterReport" element={<ProtectedRoute><BorrowerMasterReport /></ProtectedRoute>} />
          <Route path="/components/CreditReport" element={<ProtectedRoute><CreditReport /></ProtectedRoute>} />
          <Route path="/components/DeathReport" element={<ProtectedRoute><DeathReport /></ProtectedRoute>} />
          <Route path="/components/EmployeeMasterReport" element={<ProtectedRoute><EmployeeMasterReport /></ProtectedRoute>} />
          <Route path="/components/LoanApplicationReport" element={<ProtectedRoute><LoanApplicationReport /></ProtectedRoute>} />
          <Route path="/components/ForeClouserReport" element={<ProtectedRoute><ForeClosureReport /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
