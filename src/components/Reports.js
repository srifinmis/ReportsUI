import React, { useState } from 'react';
import { APIURL } from '../configuration';
import {
  Box, Button, Grid, TextField, MenuItem, Select, InputLabel, FormControl,
  Typography, List, ListItem, ListItemText, CircularProgress
} from '@mui/material';
import dayjs from 'dayjs';

const Reports = () => {
  const [fromDate, setFromDate] = useState('2023-01-01');
  const [toDate, setToDate] = useState('');
  const [reportType, setReportType] = useState('');
  const [cutoff_date, setCutoffDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const [reports, setReports] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  const fetchHeaderAndTrailer = async (reportType) => {
    try {
      const response = await fetch(`${APIURL}/api/reports/get-report-header-trailer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType }),
      });

      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const data = await response.json();
      return { header: data?.header || '', trail: data?.trail || '' };
    } catch (error) {
      console.error("Error fetching header and trailer:", error);
      alert("Error retrieving report header and trailer.");
      return { header: '', trail: '' };
    }
  };

  const generateReport = async () => {
    if (!toDate || !reportType || !cutoff_date) {
      alert('Please fill required fields');
      return;
    }

    setLoading(true);
    setDownloadLink('');

    const formattedFromDate = dayjs(fromDate).format('YYYY-MM-DD');
    const formattedToDate = dayjs(toDate).format('YYYY-MM-DD');
    const report = {
      reportType,
      fromDate: formattedFromDate,
      toDate: formattedToDate,
      cutoff_date
    };

    try {
      // Step 1: First call generate-report
      const response = await fetch(`${APIURL}/api/reports/generate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const jsonData = await response.json();

      if (!Array.isArray(jsonData)) {
        throw new Error("Unexpected JSON format: Expected an array.");
      }

      const rows = jsonData.map(obj =>
        Object.values(obj)
          .map(val => String(val).trim())
          .join("~")
      );
      const cleanedData = rows.slice(1).join("\n");

      // Step 2: Fetch header and trailer AFTER successful report generation
      const { header, trail } = await fetchHeaderAndTrailer(reportType);

      // Step 3: Combine header, body, and trailer
      const finalReport = `${header}\n${cleanedData}\n${trail}`;
      const blob = new Blob([finalReport], { type: 'text/plain' });
      const fileURL = URL.createObjectURL(blob);

      setDownloadLink(fileURL);
      setReports((prevReports) => [...prevReports, report]);

    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while generating the report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 800, margin: '20px auto', padding: 2, border: '1px solid #ccc', borderRadius: 2, boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)' }}>
      <Typography variant="h6" sx={{ color: '#0056b3', fontWeight: '600', fontSize: '20px', marginBottom: '20px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #0056b3', paddingBottom: '10px' }}>
        Generate Report
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <TextField label="Disbursed From Date (Optional)" type="date" variant="outlined" value={fromDate} onChange={(e) => setFromDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} inputProps={{ max: today }} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Disbursed To Date (Required)" type="date" variant="outlined" value={toDate} onChange={(e) => setToDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} inputProps={{ max: today }} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <TextField label="Cutoff Date" type="date" variant="outlined" value={cutoff_date} onChange={(e) => setCutoffDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} inputProps={{ max: today }} />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>CIC Name</InputLabel>
            <Select value={reportType} onChange={(e) => setReportType(e.target.value)} label="CIC Name">
              <MenuItem value="Equifax">Equifax</MenuItem>
              <MenuItem value="CRIF">CRIF</MenuItem>
              <MenuItem value="Experian">Experian</MenuItem>
              <MenuItem value="CIBIL">CIBIL</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Button variant="contained" onClick={generateReport} disabled={loading}>
          {loading ? <CircularProgress size={24} sx={{ color: 'blue' }} /> : "Generate"}
        </Button>
      </div>

      {loading && <Typography variant="body2" sx={{ marginTop: '20px', textAlign: 'center', color: '#3674B5' }}>Generating report, please wait...</Typography>}

      {downloadLink && (
        <Typography variant="body2" sx={{ marginTop: '20px', textAlign: 'center' }}>
          Your report is ready! <a href={downloadLink} download={`report_${reportType}_${toDate}.cdf`}>Click here to download</a>
        </Typography>
      )}

      {reports.length > 0 && (
        <List sx={{ marginTop: 2 }}>
          {reports.map((report, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`Report Type: ${report.reportType}`}
                secondary={`From: ${report.fromDate} To: ${report.toDate}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Reports;
