import React, {useEffect, useState} from 'react';
import axios from 'axios';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import SendIcon from '@mui/icons-material/Send';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';

import './App.css';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Stack from '@mui/material/Stack';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Paper from '@material-ui/core/Paper';
import Typography from "@material-ui/core/Typography";

function App() {
    const request = axios.create({
        baseURL: 'http://localhost:8001',
        timeout: 1000,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        }
    });

    const [selectedSim, setSelectedSim] = React.useState('');
    const [selectedOrg, setSelectedOrg] = React.useState('');
    const [selectedType, setSelectedType] = React.useState('byOrg');
    const [selectedGranularity, setSelectedGranularity] = React.useState('day');
    const [startTime, setStartTime] = React.useState(new Date('2020-02-01T00:00:00'));
    const [endTime, setEndTime] = React.useState(new Date('2020-02-11T00:00:00'));

    const [requestResponse, setRequestResponse] = React.useState('No Information to Show');


    const handleTypeChange = (event) => {
        setSelectedType(event.target.value);
    };

    const handleStartTimeChange = (newValue) => {
        setStartTime(newValue);
    };

    const handleEndTimeChange = (newValue) => {
        setEndTime(newValue);
    };

    const handleSimChange = (event) => {
        setSelectedSim(event.target.value);
    };

    const handleOrgChange = (event) => {
        setSelectedOrg(event.target.value);
    };

    const handleGranularityChange = (event) => {
        setSelectedGranularity(event.target.value);
    };

    const [sims, setSims] = useState([]);
    const [organisations, setOrganisations] = useState([]);

    useEffect(() => {
        async function fetchSIMData() {
            try {
                const res = await request.get('/all-sim');
                const data = res.data.data.map(({sim_card_id}) => sim_card_id)
                setSims(data);
                //Sets initial State
                setSelectedSim(data[0])
            } catch (err) {
            }
        }

        fetchSIMData();
    }, []);

    useEffect(() => {
        async function fetchOrgData() {
            try {
                const res = await request.get('/all-org');
                const data = res.data.data.map(({org_id}) => org_id)
                setOrganisations(data);
                //Sets initial State
                setSelectedOrg(data[0])
            } catch (err) {
            }
        }

        fetchOrgData();
    }, []);

    const handleQuery = () => {
        if (selectedType === 'byOrg') {
            request.post('/organisation-usage', {
                granularity: selectedGranularity,
                org_id: selectedOrg,
                start_date: startTime,
                end_date: endTime
            })
                .then((resp) => {
                    setRequestResponse(
                        <TableContainer component={Paper} className={'table'}>
                            <Table sx={{minWidth: 650}} aria-label='simple table'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Bytes Used Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        resp.data.data.map(({reference_date, bytes_used_total}) =>
                                            <TableRow
                                                key={reference_date}
                                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                            >
                                                <TableCell component='th' scope='row'>
                                                    {`${reference_date.split('T')[0]} ${
                                                        selectedGranularity === 'day' ? '' : reference_date.split('T')[1]}`}
                                                </TableCell>
                                                <TableCell component='th' scope='row'>
                                                    {bytes_used_total}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        if (selectedType === 'bySIM') {
            request.post('/sim-usage', {
                granularity: selectedGranularity,
                sim_card_id: selectedSim,
                start_date: startTime,
                end_date: endTime
            })
                .then((resp) => {
                    setRequestResponse(
                        <TableContainer component={Paper} className={'table'}>
                            <Table sx={{minWidth: 650}} aria-label='simple table'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Bytes Used Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        resp.data.data.map(({reference_date, bytes_used_total}) =>
                                            <TableRow
                                                key={reference_date}
                                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                            >
                                                <TableCell component='th' scope='row'>
                                                    {`${reference_date.split('T')[0]} ${
                                                        selectedGranularity === 'day' ? '' : reference_date.split('T')[1]}`}
                                                </TableCell>
                                                <TableCell component='th' scope='row'>
                                                    {bytes_used_total}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
                })
                .catch((error) => {
                    console.log(error);
                });
        }

    }

    return (
        <Grid
            container
            direction="column"
            alignItems="center"
            justifyContent="center"
        >
            <Grid item>
                <Typography variant="h4" className={'hero'}>
                    Truphone Challenge Playground
                </Typography>
            </Grid>
            <Stack direction='row' spacing={2} className={'spacer header'}>
                <Box sx={{minWidth: 120}}>
                    <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={selectedType}
                            label='Type'
                            onChange={handleTypeChange}
                        >
                            <MenuItem key={'byOrg'} value={'byOrg'}>By Org</MenuItem>
                            <MenuItem key={'bySIM'} value={'bySIM'}>By SIM</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                {
                    selectedType === 'bySIM' &&
                    <Box sx={{minWidth: 120}}>
                        <FormControl fullWidth>
                            <InputLabel>SIM</InputLabel>
                            <Select
                                value={selectedSim}
                                label='SIM'
                                onChange={handleSimChange}
                            >
                                {
                                    sims.map((sim) => (
                                        <MenuItem key={sim} value={sim}>{sim}</MenuItem>
                                    ))}
                                }
                            </Select>
                        </FormControl>
                    </Box>
                }
                {
                    selectedType === 'byOrg' &&
                    <Box sx={{minWidth: 120}}>
                        <FormControl fullWidth>
                            <InputLabel>Organisation</InputLabel>
                            <Select
                                value={selectedOrg}
                                label='Organisation'
                                onChange={handleOrgChange}
                            >
                                {
                                    organisations.map((org) => (
                                        <MenuItem key={org} value={org}>{org}</MenuItem>
                                    ))}
                                }
                            </Select>
                        </FormControl>
                    </Box>
                }
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                        label='Start Date and Time'
                        value={startTime}
                        onChange={handleStartTimeChange}
                        renderInput={(params) => <TextField {...params} />}
                    />
                    <DateTimePicker
                        label='End Date and Time'
                        value={endTime}
                        onChange={handleEndTimeChange}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
                <Box sx={{minWidth: 120}}>
                    <FormControl fullWidth>
                        <InputLabel>Granularity</InputLabel>
                        <Select
                            value={selectedGranularity}
                            label='Granularity'
                            onChange={handleGranularityChange}
                        >
                            <MenuItem key={'day'} value={'day'}>DAILY</MenuItem>
                            <MenuItem key={'hour'} value={'hour'}>HOURLY</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Button variant='contained' onClick={handleQuery} endIcon={<SendIcon/>}>
                    Query
                </Button>
            </Stack>
            <Grid className={'spacer'}>
                {requestResponse}
            </Grid>
        </Grid>
    );
}

export default App;
