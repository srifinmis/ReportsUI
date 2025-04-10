import React, { useState } from "react";
import { Drawer, Button, Box, Divider } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import ReportIcon from "@mui/icons-material/Assessment";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [showCICMenu, setShowCICMenu] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState("");

  const handleNavigate = (path) => {
    navigate(path);
    setActiveLink(path);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 280, // Slightly increased width for better spacing
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
            backgroundColor: "#000957",
            color: theme.palette.common.white,
            overflowY: "auto",
          },
        }}
      >
        <Divider sx={{ backgroundColor: theme.palette.divider }} />
        <Box sx={{ marginTop: "70px" }} />

        {/* Reports Section */}
        <Box sx={{ paddingX: 2, marginY: 1 }}>
          <Button
            color="inherit"
            fullWidth
            startIcon={<ReportIcon />}
            onClick={() => setShowReportsMenu(!showReportsMenu)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              "&:hover": { color: "#79D7BE" },
              whiteSpace: "nowrap",
            }}
          >
            Reports
          </Button>
        </Box>

        {showReportsMenu && (
          <Box sx={{ paddingLeft: 3 }}>
            <Button
              color="inherit"
              fullWidth
              onClick={() => handleNavigate("/components/BorrowMasterReport")}
              sx={{
                justifyContent: "flex-start",
                color: activeLink === "/components/BorrowMasterReport" ? "#79D7BE" : "white",
                "&:hover": { color: "#79D7BE" },
                whiteSpace: "nowrap",
                paddingX: 1,
              }}
            >
              BorrowerMasterReport
            </Button>
            <Button
              color="inherit"
              fullWidth
              onClick={() => handleNavigate("/components/CreditReport")}
              sx={{
                justifyContent: "flex-start",
                color: activeLink === "/components/CreditReport" ? "#79D7BE" : "white",
                "&:hover": { color: "#79D7BE" },
                whiteSpace: "nowrap",
                paddingX: 1,
              }}
            >
              CreditReport
            </Button>
            <Button
              color="inherit"
              fullWidth
              onClick={() => handleNavigate("/components/DeathReport")}
              sx={{
                justifyContent: "flex-start",
                color: activeLink === "/components/DeathReport" ? "#79D7BE" : "white",
                "&:hover": { color: "#79D7BE" },
                whiteSpace: "nowrap",
                paddingX: 1,
              }}
            >
              DeathReport
            </Button>
            <Button
              color="inherit"
              fullWidth
              onClick={() => handleNavigate("/components/EmployeeMasterReport")}
              sx={{
                justifyContent: "flex-start",
                color: activeLink === "/components/EmployeeMasterReport" ? "#79D7BE" : "white",
                "&:hover": { color: "#79D7BE" },
                whiteSpace: "nowrap",
                paddingX: 1,
              }}
            >
              EmployeeMasterReport
            </Button>
            <Button
              color="inherit"
              fullWidth
              onClick={() => handleNavigate("/components/LoanApplicationReport")}
              sx={{
                justifyContent: "flex-start",
                color: activeLink === "/components/LoanApplicationReport" ? "#79D7BE" : "white",
                "&:hover": { color: "#79D7BE" },
                whiteSpace: "nowrap",
                paddingX: 1,
              }}
            >
              LoanApplicationReport
            </Button>
            <Button
              color="inherit"
              fullWidth
              onClick={() => handleNavigate("/components/ForeClouserReport")}
              sx={{
                justifyContent: "flex-start",
                color: activeLink === "/components/ForeClouserReport" ? "#79D7BE" : "white",
                "&:hover": { color: "#79D7BE" },
                whiteSpace: "nowrap",
                paddingX: 1,
              }}
            >
              ForeClouserReport
            </Button>
            <Button
              color="inherit"
              fullWidth
              onClick={() => handleNavigate("/components/LoanDetailsReport")}
              sx={{
                justifyContent: "flex-start",
                color: activeLink === "/components/LoanDetailsReport" ? "#79D7BE" : "white",
                "&:hover": { color: "#79D7BE" },
                whiteSpace: "nowrap",
                paddingX: 1,
              }}
            >
              Loan Details Report
            </Button>
            <Button
              color="inherit"
              fullWidth
              onClick={() => handleNavigate("/components/LUCReport")}
              sx={{
                justifyContent: "flex-start",
                color: activeLink === "/components/LUCReport" ? "#79D7BE" : "white",
                "&:hover": { color: "#79D7BE" },
                whiteSpace: "nowrap",
                paddingX: 1,
              }}
            >
              LUC Report
            </Button>
          </Box>
        )}

        <Divider sx={{ backgroundColor: theme.palette.divider, marginY: 1 }} />

        {/* CIC Section */}
        <Box sx={{ paddingX: 2, marginY: 1 }}>
          <Button
            color="inherit"
            fullWidth
            startIcon={<BusinessIcon />}
            onClick={() => setShowCICMenu(!showCICMenu)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              "&:hover": { color: "#79D7BE" },
              whiteSpace: "nowrap",
            }}
          >
            CIC
          </Button>
        </Box>

        {showCICMenu && (
          <Box sx={{ paddingLeft: 3 }}>
            <Button
              color="inherit"
              fullWidth
              onClick={() => handleNavigate("/components/Reports")}
              sx={{
                justifyContent: "flex-start",
                color: activeLink === "/components/Reports" ? "#79D7BE" : "white",
                "&:hover": { color: "#79D7BE" },
                whiteSpace: "nowrap",
                paddingX: 1,
              }}
            >
              Reports
            </Button>
            <Button
              color="inherit"
              fullWidth
              onClick={() => handleNavigate("/components/Reupload")}
              sx={{
                justifyContent: "flex-start",
                color: activeLink === "/components/Reupload" ? "#79D7BE" : "white",
                "&:hover": { color: "#79D7BE" },
                whiteSpace: "nowrap",
                paddingX: 1,
              }}
            >
              Reupload
            </Button>
          </Box>
        )}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: "background.default", p: 2 }}></Box>
    </Box>
  );
};

export default Navbar;
