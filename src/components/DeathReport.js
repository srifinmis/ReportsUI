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
import { APIURL,DROPDOWN_REFRESH_INTERVAL } from "../configuration";
import $ from "jquery";

const DeathReport = () => {
  const [cluster, setCluster] = useState(null);
  const [region, setRegion] = useState(null);
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [dropdownData, setDropdownData] = useState(null);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // useEffect(() => {
  //   fetchDropdownData();
  // }, []);
  
  // const fetchDropdownData = () => {
  //   $.ajax({
  //     url: `${APIURL}/api/reports/death-report-dropdowns`,
  //     method: "GET",
  //     dataType: "json",
  //     success: (data) => setDropdownData(data),
  //     error: (xhr, status, error) => {
  //       console.error("Error fetching dropdown data:", status, error);
  //     },
  //     complete: () => setLoadingDropdowns(false),
  //   });
  // };
  useEffect(() => {
    const fetchDropdownData = () => {
      fetch(`${APIURL}/api/reports/death-report-dropdowns`)
        .then((res) => res.json())
        .then((data) => {
          if (typeof data === "object" && data !== null) {
            // Optional: Add caching if needed
            const metadata = {
              timestamp: Date.now(),
              cacheDuration: DROPDOWN_REFRESH_INTERVAL,
              data,
            };
            localStorage.setItem("deathReportDropdownMetadata", JSON.stringify(metadata));
            setDropdownData(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching dropdown data:", error);
        })
        .finally(() => {
          setLoadingDropdowns(false);
        });
    };
  
    const cached = localStorage.getItem("deathReportDropdownMetadata");
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
        console.warn("Failed to parse death report cache:", err);
      }
    }
  
    fetchDropdownData();
  }, []);
  
  
  const getClusters = () => {
    if (!dropdownData) return [];
    return Object.keys(dropdownData.clusterRegionMap).map((c) => ({ label: c }));
  };
  
  const getRegions = () => {
    if (!dropdownData) return [];
  
    if (!cluster) {
      // Show all regions
      const allRegions = Object.values(dropdownData.clusterRegionMap).flat();
      return [...new Set(allRegions)].map((r) => ({ label: r }));
    }
  
    // Show regions in selected cluster
    const regions = dropdownData.clusterRegionMap[cluster.label] || [];
    return regions.map((r) => ({ label: r }));
  };
  
  const getBranches = () => {
    if (!dropdownData) return [];
  
    if (!region) {
      // Show all branches
      const allBranches = Object.values(dropdownData.regionBranchMap).flat();
      return [...new Set(allBranches)].map((b) => ({ label: b }));
    }
  
    // Show branches in selected region
    const branches = dropdownData.regionBranchMap[region.label] || [];
    return branches.map((b) => ({ label: b }));
  };
  
  const handleClusterChange = (newCluster) => {
    setCluster(newCluster);
    setRegion(null);
    setBranch(null);
  };
  
  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    setBranch(null);
  
    if (newRegion) {
      const selectedCluster = dropdownData.regionClusterMap[newRegion.label];
      setCluster({ label: selectedCluster });
    }
  };
  
  const handleBranchChange = (newBranch) => {
    setBranch(newBranch);
  
    if (newBranch) {
      const selectedRegion = dropdownData.branchRegionMap[newBranch.label];
      setRegion({ label: selectedRegion });
  
      const selectedCluster = dropdownData.regionClusterMap[selectedRegion];
      setCluster({ label: selectedCluster });
    }
  };
  
  
  const generateExcelReport = async () => {
    setLoading(true);
    setDownloadLink("");

    const reportRequest = {
      cluster: cluster?.label,
      region: region?.label,
      branch: branch?.label,
    };

    try {
      const response = await fetch(`${APIURL}/api/reports/death-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportRequest),
      });

      const jsonData = await response.json();
      if (!response.ok) throw new Error(jsonData.message || "Failed to generate report");
      if (!Array.isArray(jsonData)) throw new Error("Unexpected response format: Expected an array");

      const worksheet = XLSX.utils.json_to_sheet(jsonData);
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      sheetData.shift();
      const newWorksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, newWorksheet, "DeathReport");

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
        Death Report
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={getClusters()}
            loading={loadingDropdowns}
            value={cluster}
            onChange={(event, newValue) => handleClusterChange(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Cluster" variant="outlined" fullWidth />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={getRegions()}
            loading={loadingDropdowns}
            value={region}
            onChange={(event, newValue) => handleRegionChange(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Region" variant="outlined" fullWidth />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={getBranches()}
            loading={loadingDropdowns}
            value={branch}
            onChange={(event, newValue) => handleBranchChange(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Branch" variant="outlined" fullWidth />
            )}
          />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        onClick={generateExcelReport}
        disabled={loading}
        sx={{ marginTop: 3, display: "block", marginX: "auto", backgroundColor: "# #0056b3" }}
      >
        {loading ? <CircularProgress size={24} /> : "Generate Report"}
      </Button>

      {downloadLink && (
        <Typography variant="body2" sx={{ marginTop: "20px", textAlign: "center" }}>
          Your Excel report is ready!{" "}
          <a href={downloadLink} download="DeathReport.xlsx">
            Click here to download
          </a>
        </Typography>
      )}
    </Box>
  );
};

export default DeathReport;
