import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import * as XLSX from "xlsx";
import { APIURL,DROPDOWN_REFRESH_INTERVAL} from "../configuration";
import $ from "jquery";

const LoanApplicationReport = () => {
  const [branches, setBranches] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [branch, setBranch] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [appDateFrom, setAppDateFrom] = useState(null);
  const [appDateTo, setAppDateTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  // useEffect(() => {
  //   $.ajax({
  //     url: `${APIURL}/api/reports/dropdown-loan-application-report`,
  //     method: "GET",
  //     dataType: "json",
  //     success: (data) => {
  //       if (data?.branches) {
  //         setBranches(data.branches.map((b) => ({ label: b })));
  //       }
  //       if (data?.statuses) {
  //         setStatuses(data.statuses.map((s) => ({ label: s })));
  //       }
  //     },
  //     error: (xhr, status, error) => {
  //       console.error("Error fetching dropdowns:", status, error);
  //     },
  //   });
  // }, []);
  useEffect(() => {
    const fetchDropdownData = () => {
      fetch(`${APIURL}/api/reports/dropdown-loan-application-report`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.branches) {
            setBranches(data.branches.map((b) => ({ label: b })));
          }
          if (data?.statuses) {
            setStatuses(data.statuses.map((s) => ({ label: s })));
          }
  
          // Optional: caching if needed
          const metadata = {
            timestamp: Date.now(),
            cacheDuration: DROPDOWN_REFRESH_INTERVAL,
            data,
          };
          localStorage.setItem("loanAppDropdownMetadata", JSON.stringify(metadata));
        })
        .catch((error) => {
          console.error("Error fetching dropdowns:", error);
        });
    };
  
    const cached = localStorage.getItem("loanAppDropdownMetadata");
    if (cached) {
      try {
        const { timestamp, cacheDuration, data } = JSON.parse(cached);
        const isValid = timestamp && (Date.now() - timestamp < cacheDuration);
        if (isValid && typeof data === "object" && data !== null) {
          if (data?.branches) {
            setBranches(data.branches.map((b) => ({ label: b })));
          }
          if (data?.statuses) {
            setStatuses(data.statuses.map((s) => ({ label: s })));
          }
          return;
        }
      } catch (err) {
        console.warn("Failed to parse loan application dropdown cache:", err);
      }
    }
  
    fetchDropdownData();
  }, []);
  
  const generateExcelReport = async () => {
    if (!branch || !appDateFrom || !appDateTo) {
      alert("Please select branch and date range.");
      return;
    }

    if (appDateTo.isBefore(appDateFrom, 'day')) {
      alert("To Date cannot be before From Date.");
      return;
    }

    setLoading(true);
    setDownloadLink("");

    const payload = {
      branch: branch.label,
      app_status: selectedStatuses.map((s) => s.label),
      app_date_from: appDateFrom.format("YYYY-MM-DD"),
      app_date_to: appDateTo.format("YYYY-MM-DD"),
    };

    try {
      const response = await fetch(`${APIURL}/api/reports/generate-loan-application-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const jsonData = await response.json();
      if (!response.ok) throw new Error(jsonData.message || "Failed to generate report");
      if (!Array.isArray(jsonData)) throw new Error("Unexpected response format");

      const worksheet = XLSX.utils.json_to_sheet(jsonData);
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            sheetData.shift(); // Remove headers if needed
            const newWorksheet = XLSX.utils.aoa_to_sheet(sheetData);
            const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, newWorksheet, "LoanApplicationReport");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileURL = URL.createObjectURL(blob);
      setDownloadLink(fileURL);
    } catch (error) {
      console.error("Error generating report:", error);
      alert(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "20px auto",
        padding: 3,
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: "#0056b3",
          fontWeight: 600,
          fontSize: "20px",
          marginBottom: "20px",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "1px",
          borderBottom: "2px solid #0056b3",
          paddingBottom: "10px",
        }}
      >
        Loan Application Report
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Autocomplete
            options={branches}
            value={branch}
            onChange={(event, newValue) => setBranch(newValue)}
            renderInput={(params) => <TextField {...params} label="Branch" fullWidth />}
          />
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            multiple
            options={statuses}
            value={selectedStatuses}
            onChange={(event, newValue) => setSelectedStatuses(newValue)}
            renderInput={(params) => <TextField {...params} label="Application Status" fullWidth />}
          />
        </Grid>
        <Grid item xs={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Application From"
              value={appDateFrom}
              onChange={(newValue) => setAppDateFrom(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={6}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Application To"
              value={appDateTo}
              onChange={(newValue) => setAppDateTo(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        onClick={generateExcelReport}
        disabled={loading}
        sx={{ marginTop: 3, display: "block", marginX: "auto" }}
      >
        {loading ? <CircularProgress size={24} /> : "Generate Report"}
      </Button>

      {downloadLink && (
        <Typography variant="body2" sx={{ marginTop: 2, textAlign: "center" }}>
          Your Excel report is ready!{" "}
          <a href={downloadLink} download="LoanApplicationReport.xlsx">
            Click here to download
          </a>
        </Typography>
      )}
    </Box>
  );
};

export default LoanApplicationReport;
