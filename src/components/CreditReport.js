import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { APIURL,DROPDOWN_REFRESH_INTERVAL } from "../configuration";
import $ from "jquery";
import dayjs from "dayjs";

const CreditReport = () => {
  const [branch, setBranch] = useState(null);
  const [creditStatus, setCreditStatus] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [dropdownData, setDropdownData] = useState(null);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  // useEffect(() => {
  //   fetchDropdownData();
  // }, []);

  // const fetchDropdownData = () => {
  //   $.ajax({
  //     url: `${APIURL}/api/reports/dropdowndataCredit`,
  //     method: "GET",
  //     dataType: "json",
  //     success: (data) => {
  //       if (typeof data !== "object" || data === null) return;
  //       setDropdownData(data);
  //     },
  //     error: (xhr, status, error) => {
  //       console.error("Error fetching dropdown data:", status, error);
  //     },
  //     complete: () => {
  //       setLoadingDropdowns(false);
  //     },
  //   });
  // };
  useEffect(() => {
    const fetchDropdownData = () => {
      fetch(`${APIURL}/api/reports/dropdowndataCredit`)
        .then((res) => res.json())
        .then((data) => {
          if (typeof data === "object" && data !== null) {
            const metadata = {
              timestamp: Date.now(),
              cacheDuration: DROPDOWN_REFRESH_INTERVAL,
              data,
            };
            localStorage.setItem("creditDropdownMetadata", JSON.stringify(metadata));
            setDropdownData(data);
          }
        })
        .catch((error) => console.error("Error fetching dropdown data:", error))
        .finally(() => setLoadingDropdowns(false));
    };
  
    const cached = localStorage.getItem("creditDropdownMetadata");
    if (cached) {
      try {
        const { timestamp, cacheDuration, data } = JSON.parse(cached);
        const isValid = timestamp && (Date.now() - timestamp < cacheDuration);
        if (isValid && typeof data === "object" && data !== null) {
          setDropdownData(data);
          setLoadingDropdowns(false);
          return;
        }
      } catch (err) {
        console.warn("Failed to parse dropdown cache:", err);
      }
    }
  
    fetchDropdownData();
  }, []);
  

  const getBranches = () =>
    dropdownData?.branches?.map((b) => ({ label: b })) || [];

  const getCreditStatusOptions = () =>
    dropdownData?.statuses?.map((s) => ({ label: s })) || [];

  const generateReport = async () => {
    if (!branch || !fromDate || !toDate) {
      alert("Please select Branch and Date Range.");
      return;
    }

    setLoading(true);
    setDownloadLink("");

    const payload = {
      branch: branch.label,
      creditStatus: creditStatus?.label || "",
      fromDate: dayjs(fromDate).format("YYYY-MM-DD"),
      toDate: dayjs(toDate).format("YYYY-MM-DD"),
    };

    try {
      const response = await fetch(`${APIURL}/api/reports/generate-credit-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const jsonData = await response.json();
      if (!response.ok) throw new Error(jsonData.message || "Failed to generate report");
      if (!Array.isArray(jsonData)) throw new Error("Unexpected response format");

      const worksheet = XLSX.utils.json_to_sheet(jsonData);
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      sheetData.shift();
      const newWorksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, newWorksheet, "CreditReport");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileURL = URL.createObjectURL(blob);
      setDownloadLink(fileURL);
    } catch (error) {
      console.error("Error generating report:", error);
      alert(error.message || "Error occurred while generating report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          maxWidth: 700,
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
            fontWeight: "600",
            fontSize: "20px",
            marginBottom: "20px",
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "1px",
            borderBottom: "2px solid #0056b3",
            paddingBottom: "10px",
          }}
        >
          Credit Report
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={getBranches()}
              loading={loadingDropdowns}
              value={branch}
              onChange={(e, newValue) => setBranch(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Branch" variant="outlined" fullWidth />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Autocomplete
              options={getCreditStatusOptions()}
              value={creditStatus}
              onChange={(e, newValue) => setCreditStatus(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Credit App Status" variant="outlined" fullWidth />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={(newValue) => {
                setFromDate(newValue);
                // Reset toDate if it's earlier than new fromDate
                if (toDate && dayjs(newValue).isAfter(dayjs(toDate))) {
                  setToDate(null);
                }
              }}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="To Date"
              value={toDate}
              minDate={fromDate}
              onChange={(newValue) => setToDate(newValue)}
              renderInput={(params) => <TextField fullWidth {...params} />}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={generateReport}
          disabled={loading}
          sx={{ marginTop: 3, display: "block", marginX: "auto" }}
        >
          {loading ? <CircularProgress size={24} /> : "Generate Report"}
        </Button>

        {downloadLink && (
          <Typography variant="body2" sx={{ marginTop: "20px", textAlign: "center" }}>
            Your Excel report is ready!{" "}
            <a href={downloadLink} download="CreditReport.xlsx">
              Click here to download
            </a>
          </Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
};


export default CreditReport;

