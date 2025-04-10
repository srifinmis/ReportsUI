import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";

const Dashboard = ({ isDropped }) => {
  const navigate = useNavigate();

  const reports = [
    { title: "Loan Details Report", route: "/components/LoanDetailsReport", color: "#34495E" },
    { title: "Death Report", route: "/components/DeathReport", color: "#34495E" },
    { title: "Employee Master", route: "/components/EmployeeMasterReport", color: "#34495E" },
    { title: "Foreclosure Report", route: "/components/ForeClouserReport", color: "#34495E" },
    { title: "CreditReport", route: "/components/CreditReport", color: "#34495E" },
    { title: "BorrowerMaster Report", route: "/components/BorrowMasterReport", color: "#34495E" },
    { title: "LUC Report", route: "/components/LUCReport", color: "#34495E" },
    { title: "Loan Application Report", route: "/components/LoanApplicationReport", color: "#34495E" },
    { title: "CIC Report", route: "/components/Reports", color: "#34495E" },
    { title: "CIC Reupload", route: "/components/Reupload", color: "#34495E" },
  ];

  return (
    <Box
      sx={{
        marginTop: "70px",
        // marginLeft: isDropped ? "100px" : "280px",
        // transition: "margin-left 0.3s ease",
        // width: isDropped ? "calc(100% - 180px)" : "calc(100% - 350px)",
        // padding: 3,
        // border: "1px solid #ccc",
        // borderRadius: 2,
        // boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      <Grid container spacing={3} justifyContent="center">
        {reports.map((report, index) => (
          <Grid item xs={12} sm={6} md={5} lg={3} key={index}>
            <Card
              sx={{
                ...cardStyle,
                height: "80px", 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                "&:hover": {
                  ...cardStyle["&:hover"],
                  backgroundColor: "#D5DBDB",
                  boxShadow: "0px 6px 12px rgba(0,0,0,0.2)",
                },
              }}
              onClick={() => navigate(report.route)}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", textAlign: "center", color: report.color }}
                >
                  {report.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const cardStyle = {
  backgroundColor: "#ECF0F1",
  borderRadius: 3,
  p: 2,
  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
  cursor: "pointer",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.05)",
  },
};

export default Dashboard;
