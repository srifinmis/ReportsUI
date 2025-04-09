import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Box, Button, TextField, Grid, Typography, CircularProgress, Autocomplete } from "@mui/material";
import { APIURL ,DROPDOWN_REFRESH_INTERVAL} from "../configuration";

const BorrowerMasterReport = () => {
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [branches, setBranches] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // useEffect(() => {
  //   $.ajax({
  //     url: `${APIURL}/api/reports/dropdown-borrower-branches`, // Your backend endpoint for branch list
  //     method: "GET",
  //     dataType: "json",
  //     success: (data) => {
  //       if (Array.isArray(data)) {
  //         setBranches(data.map((b) => ({ label: b })));
  //       }
  //     },
  //     error: (xhr, status, error) => {
  //       console.error("Error fetching branches:", status, error);
  //     },
  //     complete: () => {
  //       setLoadingDropdowns(false);
  //     },
  //   });
  // }, []);
  useEffect(() => {
    const fetchBranches = () => {
      fetch(`${APIURL}/api/reports/dropdown-borrower-branches`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const metadata = {
              timestamp: Date.now(),
              cacheDuration: DROPDOWN_REFRESH_INTERVAL,
              data,
            };
            localStorage.setItem("borrowerBranchesMetadata", JSON.stringify(metadata));
            setBranches(data.map((b) => ({ label: b })));
          }
        })
        .catch((error) => console.error("Error fetching branches:", error))
        .finally(() => setLoadingDropdowns(false));
    };
  
    const cached = localStorage.getItem("borrowerBranchesMetadata");
    if (cached) {
      try {
        const { timestamp, cacheDuration, data } = JSON.parse(cached);
        const isValid = timestamp && (Date.now() - timestamp < cacheDuration);
        if (isValid && Array.isArray(data)) {
          setBranches(data.map((b) => ({ label: b })));
          setLoadingDropdowns(false);
          return;
        }
      } catch (err) {
        console.warn("Failed to parse branch cache:", err);
      }
    }
  
    fetchBranches();
  }, []);
  

  const generateExcelReport = async () => {
    if (!branch) {
      alert("Please select a branch to generate the report.");
      return;
    }

    setLoading(true);
    setDownloadLink("");

    try {
      const response = await fetch(`${APIURL}/api/reports/generate-borrower-master-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch: branch.label }),
      });

      const jsonData = await response.json();
      if (!response.ok) throw new Error(jsonData.message || "Failed to generate report");
      if (!Array.isArray(jsonData)) throw new Error("Unexpected response format: Expected an array");

      const worksheet = XLSX.utils.json_to_sheet(jsonData);
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      sheetData.shift(); // Remove headers if needed
      const newWorksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, newWorksheet, "BorrowerMasterReport");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileURL = URL.createObjectURL(blob);
      setDownloadLink(fileURL);
    } catch (error) {
      console.error("Error generating report:", error);
      alert(error.message || "An error occurred while generating the Excel report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, margin: "20px auto", padding: 3, border: "1px solid #ccc", borderRadius: 2, boxShadow: 3 }}>
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
        Borrower Master Report
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Autocomplete
            options={branches}
            loading={loadingDropdowns}
            value={branch}
            onChange={(event, newValue) => setBranch(newValue)}
            renderInput={(params) => <TextField {...params} label="Branch" variant="outlined" fullWidth />}
          />
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
        <Typography variant="body2" sx={{ marginTop: "20px", textAlign: "center" }}>
          Your Excel report is ready! <a href={downloadLink} download="BorrowerMasterReport.xlsx">Click here to download</a>
        </Typography>
      )}
    </Box>
  );
};

export default BorrowerMasterReport;
