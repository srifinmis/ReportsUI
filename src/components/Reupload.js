import React, { useState } from 'react';
import { APIURL } from '../configuration';
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import dayjs from 'dayjs';

const Reupload = () => {
  const [cutoffDate, setCutoffDate] = useState('');
  const [reportType, setReportType] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const [reports, setReports] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  const handleFileChange = (e) => setCsvFile(e.target.files[0]);
  const handleReportTypeChange = (e) => setReportType(e.target.value);

  const parseCSV = (csvString) => {
    return csvString.split("\n").map(row => row.split(",")[0].trim()); 
  };

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

  const handleGenerateReport = async () => {
    if (!csvFile || !reportType || !cutoffDate) {
      alert('Please select a CSV file, Report Type, and Cutoff Date');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.readAsText(csvFile);
    reader.onload = async (event) => {
      const csvData = parseCSV(event.target.result);
      const formattedCutoffDate = dayjs(cutoffDate).format('YYYY-MM-DD');

      try {
        const response = await fetch(`${APIURL}/api/reports/generate-reupload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvData, reportType, cutoff_date: formattedCutoffDate }),
        });

        if (!response.ok) throw new Error('Failed to generate report');

        const jsonData = await response.json();
        if (!Array.isArray(jsonData)) {
          throw new Error("Unexpected JSON format: Expected an array.");
        }

        const rows = jsonData.map(obj => 
          Object.values(obj).map(val => String(val).trim()).join("~")
        );

        const cleanedData = rows.slice(1).join("\n");
        const { header, trail } = await fetchHeaderAndTrailer(reportType);
        const finalReport = `${header}\n${cleanedData}\n${trail}`;

        const blob = new Blob([finalReport], { type: 'text/plain' });
        const fileURL = URL.createObjectURL(blob);
        setDownloadLink(fileURL);
        setReports([...reports, { reportType, cutoff_date: formattedCutoffDate }]);

      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while generating the report.');
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      maxWidth: 800,
      margin: '20px auto',
      padding: 2,
      border: '1px solid #ccc',
      borderRadius: 2,
      boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.3)'
    }}>
      <Typography variant="h6" sx={{
        color: '#0056b3',
        fontWeight: 600,
        fontSize: '20px',
        marginBottom: '20px',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        borderBottom: '2px solid #0056b3',
        paddingBottom: '10px'
      }}>
        Report Regeneration
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <TextField
            label="Cutoff Date"
            type="date"
            variant="outlined"
            value={cutoffDate}
            onChange={(e) => setCutoffDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: today }}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Report Type</InputLabel>
            <Select value={reportType} onChange={handleReportTypeChange} label="Report Type">
              <MenuItem value="Equifax">Equifax</MenuItem>
              <MenuItem value="CRIF">CRIF</MenuItem>
              <MenuItem value="CIBIL">CIBIL</MenuItem>
              <MenuItem value="Experian">Experian</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={6}>
          <input type="file" accept=".csv" onChange={handleFileChange} />
        </Grid>
      </Grid>

      <div style={{ marginTop: 20 }}>
        <Button variant="contained" onClick={handleGenerateReport} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Report'}
        </Button>
      </div>

      {downloadLink && (
        <Typography variant="body2" style={{ marginTop: '20px', textAlign: 'center' }}>
          Your report is ready! <a href={downloadLink} download={`report_${reportType}.cdf`}>Click here to download the file</a>
        </Typography>
      )}

      <List style={{ marginTop: 20 }}>
        {reports.map((report, index) => (
          <ListItem key={index}>
            <ListItemText primary={`Report Type: ${report.reportType}`} secondary={`Cutoff Date: ${report.cutoff_date}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Reupload;
