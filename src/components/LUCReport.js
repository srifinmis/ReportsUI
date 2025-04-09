import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Box, Button, TextField, Grid, Typography, CircularProgress, Autocomplete } from "@mui/material";
import { APIURL,DROPDOWN_REFRESH_INTERVAL } from "../configuration";
import $ from "jquery";

const Lucreport = () => {
  const [zone, setZone] = useState(null);
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
  //     url: `${APIURL}/api/reports/dropdowndataluc`,
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
      fetch(`${APIURL}/api/reports/dropdowndataluc`)
        .then((res) => res.json())
        .then((data) => {
          if (typeof data === "object" && data !== null) {
            // Optional: caching
            const metadata = {
              timestamp: Date.now(),
              cacheDuration: DROPDOWN_REFRESH_INTERVAL,
              data,
            };
            localStorage.setItem("lucDropdownMetadata", JSON.stringify(metadata));
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
  
    const cached = localStorage.getItem("lucDropdownMetadata");
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
        console.warn("Failed to parse LUC dropdown cache:", err);
      }
    }
  
    fetchDropdownData();
  }, []);
  
  const getZones = () =>
    dropdownData ? Object.keys(dropdownData.zoneClusterMap).map((z) => ({ label: z })) : [];

  const getClusters = () => {
    if (!dropdownData) return [];
    if (!zone) return Object.keys(dropdownData.clusterZoneMap).map((c) => ({ label: c }));
    return Object.entries(dropdownData.clusterZoneMap)
      .filter(([_, z]) => z === zone.label)
      .map(([c]) => ({ label: c }));
  };

  const getRegions = () => {
    if (!dropdownData) return [];
    if (!cluster) return Object.keys(dropdownData.regionClusterMap).map((r) => ({ label: r }));
    return Object.entries(dropdownData.regionClusterMap)
      .filter(([_, c]) => c === cluster.label)
      .map(([r]) => ({ label: r }));
  };

  const getBranches = () => {
    if (!dropdownData) return [];
    return Object.keys(dropdownData.branchRegionMap).map((b) => ({ label: b }));
  };

  const handleBranchChange = (newBranch) => {
    setBranch(newBranch);
    if (newBranch) {
      const selectedRegion = dropdownData.branchRegionMap[newBranch.label];
      setRegion({ label: selectedRegion });
      const selectedCluster = dropdownData.regionClusterMap[selectedRegion];
      setCluster({ label: selectedCluster });
      const selectedZone = dropdownData.clusterZoneMap[selectedCluster];
      setZone({ label: selectedZone });
    }
  };
  const handleRegionChange = (newRegion) => {
        setRegion(newRegion);
        setBranch(null);
        if (newRegion) {
          const selectedCluster = dropdownData.regionClusterMap[newRegion.label];
          setCluster({ label: selectedCluster });
          const selectedZone = dropdownData.clusterZoneMap[selectedCluster];
          setZone({ label: selectedZone });
        }
      };
    
      const handleClusterChange = (newCluster) => {
        setCluster(newCluster);
        setRegion(null);
        setBranch(null);
        if (newCluster) {
          const selectedZone = dropdownData.clusterZoneMap[newCluster.label];
          setZone({ label: selectedZone });
        }
      };
    

  const generateExcelReport = async () => {
    setLoading(true);
    setDownloadLink("");

    const reportRequest = { zone: zone?.label, cluster: cluster?.label, region: region?.label, branch: branch?.label };

    try {
      const response = await fetch(`${APIURL}/api/reports/generate-luc-details-report`, {
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
      
      XLSX.utils.book_append_sheet(workbook, newWorksheet, "Lucreport");

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
    <Box sx={{ maxWidth: 600, margin: "20px auto", padding: 3, border: "1px solid #ccc", borderRadius: 2, boxShadow: 3 }}>
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
        Luc Report
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={getZones()}
            loading={loadingDropdowns}
            value={zone}
            onChange={(event, newValue) => {
              setZone(newValue);
              setCluster(null);
              setRegion(null);
              setBranch(null);
            }}
            renderInput={(params) => <TextField {...params} label="Zone" variant="outlined" fullWidth />}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={getClusters()}
            loading={loadingDropdowns}
            value={cluster}
            onChange={(event, newValue) => {handleClusterChange(newValue)}}
            renderInput={(params) => <TextField {...params} label="Cluster" variant="outlined" fullWidth />}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={getRegions()}
            loading={loadingDropdowns}
            value={region}
            onChange={(event, newValue) => { handleRegionChange(newValue)}}
            renderInput={(params) => <TextField {...params} label="Region" variant="outlined" fullWidth />}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={getBranches()}
            loading={loadingDropdowns}
            value={branch}
            onChange={(event, newValue) => handleBranchChange(newValue)}
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
          Your Excel report is ready! <a href={downloadLink} download="Lucreport.xlsx">Click here to download</a>
        </Typography>
      )}
    </Box>
  );
};

export default Lucreport;
