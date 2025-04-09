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
import { APIURL ,DROPDOWN_REFRESH_INTERVAL} from "../configuration";

const EmployeeMasterReport = () => {
  const [cluster, setCluster] = useState(null);
  const [region, setRegion] = useState(null);
  const [area, setArea] = useState(null);
  const [branch, setBranch] = useState(null);
  const [status, setStatus] = useState(null);
  const [dropdownData, setDropdownData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // useEffect(() => {
  //   fetch(`${APIURL}/api/reports/dropdownemployee`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setDropdownData(data);
  //     })
  //     .catch((err) => console.error("Dropdown fetch error:", err))
  //     .finally(() => setLoadingDropdowns(false));
  // }, []);

  useEffect(() => {
    const fetchDropdownData = () => {
      fetch(`${APIURL}/api/reports/dropdownemployee`)
        .then((res) => res.json())
        .then((response) => {
          const { metadata, ...data } = response;
          const cacheDuration = metadata?.cacheDuration || DROPDOWN_REFRESH_INTERVAL;

          const fullMetadata = {
            timestamp: Date.now(),
            cacheDuration,
            data,
          };

          localStorage.setItem("employeeDropdownMetadata", JSON.stringify(fullMetadata));
          setDropdownData(data);
        })
        .catch((err) => console.error("Dropdown fetch error:", err))
        .finally(() => setLoadingDropdowns(false));
    };

    const storedMetadata = localStorage.getItem("employeeDropdownMetadata");
    if (storedMetadata) {
      try {
        const parsed = JSON.parse(storedMetadata);
        const { timestamp, cacheDuration, data } = parsed;
        const isValid = timestamp && (Date.now() - timestamp < cacheDuration);

        if (isValid) {
          setDropdownData(data);
          setLoadingDropdowns(false);
          return;
        }
      } catch (e) {
        console.warn("Failed to parse cached dropdown metadata:", e);
      }
    }

    fetchDropdownData();
  }, []);


  const getClusters = () =>
    dropdownData?.clusters?.map((label) => ({ label })) || [];

  const getRegions = () => {
    if (!dropdownData) return [];
    if (!cluster) return dropdownData.regions.map((label) => ({ label }));
    return dropdownData.clusterRegionMap[cluster.label]?.map((r) => ({ label: r })) || [];
  };

  const getAreas = () => {
    if (!dropdownData) return [];
    if (!region) return dropdownData.areas.map((label) => ({ label }));
    return Object.entries(dropdownData.areaRegionMap)
      .filter(([_, reg]) => reg === region.label)
      .map(([area]) => ({ label: area }));
  };

  const getBranches = () => {
    if (!dropdownData) return [];
    if (!area) return dropdownData.branches.map((label) => ({ label }));
    return Object.entries(dropdownData.branchAreaMap)
      .filter(([_, a]) => a === area.label)
      .map(([b]) => ({ label: b }));
  };

  const getStatuses = () =>
    dropdownData?.statuses?.map((label) => ({ label })) || [];

  const handleBranchChange = (newBranch) => {
    setBranch(newBranch);
    if (newBranch) {
      const areaLabel = dropdownData.branchAreaMap[newBranch.label];
      const regionLabel = dropdownData.areaRegionMap[areaLabel];
      const clusterLabel = dropdownData.regionClusterMap[regionLabel];
      setArea({ label: areaLabel });
      setRegion({ label: regionLabel });
      setCluster({ label: clusterLabel });
    }
  };

  const handleAreaChange = (newArea) => {
    setArea(newArea);
    setBranch(null);
    if (newArea) {
      const regionLabel = dropdownData.areaRegionMap[newArea.label];
      const clusterLabel = dropdownData.regionClusterMap[regionLabel];
      setRegion({ label: regionLabel });
      setCluster({ label: clusterLabel });
    }
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    setArea(null);
    setBranch(null);
    if (newRegion) {
      const clusterLabel = dropdownData.regionClusterMap[newRegion.label];
      setCluster({ label: clusterLabel });
    }
  };

  const generateExcelReport = async () => {
    setLoading(true);
    setDownloadLink("");

    const reportRequest = {
      cluster: cluster?.label,
      region: region?.label,
      area: area?.label,
      branch: branch?.label,
      status: status?.label,
    };

    try {
      const response = await fetch(`${APIURL}/api/reports/generate-employee-master-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportRequest),
      });

      const jsonData = await response.json();
      if (!response.ok) throw new Error(jsonData.message || "Failed to generate report");
      if (!Array.isArray(jsonData)) throw new Error("Unexpected response format");

      const worksheet = XLSX.utils.json_to_sheet(jsonData);
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      sheetData.shift();
      const newWorksheet = XLSX.utils.aoa_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, newWorksheet, "EmployeeMaster");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileURL = URL.createObjectURL(blob);
      setDownloadLink(fileURL);
    } catch (error) {
      console.error("Error generating report:", error);
      alert(error.message || "Failed to generate Excel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 700, margin: "20px auto", padding: 3, border: "1px solid #ccc", borderRadius: 2, boxShadow: 3 }}>
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
        Employee Master Report
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={getClusters()}
            value={cluster}
            loading={loadingDropdowns}
            onChange={(e, val) => {
              setCluster(val);
              setRegion(null);
              setArea(null);
              setBranch(null);
            }}
            renderInput={(params) => <TextField {...params} label="Cluster" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={getRegions()}
            value={region}
            loading={loadingDropdowns}
            onChange={(e, val) => handleRegionChange(val)}
            renderInput={(params) => <TextField {...params} label="Region" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={getAreas()}
            value={area}
            loading={loadingDropdowns}
            onChange={(e, val) => handleAreaChange(val)}
            renderInput={(params) => <TextField {...params} label="Area" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={getBranches()}
            value={branch}
            loading={loadingDropdowns}
            onChange={(e, val) => handleBranchChange(val)}
            renderInput={(params) => <TextField {...params} label="Branch" fullWidth />}
          />
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            options={getStatuses()}
            value={status}
            onChange={(e, val) => setStatus(val)}
            renderInput={(params) => <TextField {...params} label="Status" fullWidth />}
          />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        sx={{ marginTop: 3, display: "block", marginX: "auto" }}
        onClick={generateExcelReport}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Generate Report"}
      </Button>

      {downloadLink && (
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          <a href={downloadLink} download="EmployeeMasterReport.xlsx">Download Excel Report</a>
        </Typography>
      )}
    </Box>
  );
};

export default EmployeeMasterReport;
