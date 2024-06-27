import './Loading.css'
import { Result } from "./Result";
import { TableBody, TableHead, TableRow, TableCell, Button, Box, Table } from '@mui/material';
import Typography from '@mui/material/Typography';

export const DatasetTable = ({ loadingResults, searchResults, setDataset, header, totalNumOfPages, page, GetNewPage, editable }) => {
    const renderPageNumbers = () => {
        const pageNumbers = [];
        let startPage, endPage;

        if (totalNumOfPages <= 10) {
            startPage = 1;
            endPage = totalNumOfPages;
        } else {
            if (page <= 6) {
                startPage = 1;
                endPage = 10;
            } else if (page + 4 >= totalNumOfPages) {
                startPage = totalNumOfPages - 9;
                endPage = totalNumOfPages;
            } else {
                startPage = page - 5;
                endPage = page + 4;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers.map(num => (
            <Button
                key={num}
                variant={page === num ? "contained" : "outlined"}
                onClick={() => GetNewPage(num)}
                disabled={page === num}
            >
                {num}
            </Button>
        ));
    };

    return <>
        <Table
            sx={{
                color: 'rgb(0, 0, 0)',
                marginTop: '2rem',
                width: .8,
            }}
        >
            { header &&
                <TableHead
                    sx={{
                        background: 'rgb(255, 255, 255)', opacity: 0.8
                    }}>
                    <TableRow>
                        <TableCell align='center'>
                            <Typography component="h1" variant="h6">Results
                            </Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
            }
            
            {/*Animated Class while people wait for database response*/}
            {loadingResults && <TableBody sx={{ background: '#fff' }}>
                <TableRow className='loadingData1'>
                    <TableCell>&nbsp;</TableCell>
                </TableRow>
                <TableRow className='loadingData2'>
                    <TableCell>&nbsp;</TableCell>
                </TableRow>
                <TableRow className='loadingData3'>
                    <TableCell>&nbsp;</TableCell>
                </TableRow>
                <TableRow className='loadingData4'>
                    <TableCell>&nbsp;</TableCell>
                </TableRow>
                <TableRow className='loadingData5'>
                    <TableCell>&nbsp;</TableCell>
                </TableRow>
                <TableRow className='loadingData6'>
                    <TableCell>&nbsp;</TableCell>
                </TableRow>
                <TableRow className='loadingData7'>
                    <TableCell>&nbsp;</TableCell>
                </TableRow>
                <TableRow className='loadingData8'>
                    <TableCell>&nbsp;</TableCell>
                </TableRow>
            </TableBody>}
            {!loadingResults && <TableBody
                sx={{
                    background: 'rgb(200, 200, 200)'
                }}>
                {searchResults.map((result) => {
                    return <TableRow id={result.table_name} key={result.table_name}>
                        <TableCell>
                            <Result result={result} setDataset={(x) => setDataset(x)} editable={editable} />
                        </TableCell>
                    </TableRow>
                })}
            </TableBody>}
        </Table>

        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            {renderPageNumbers()}
        </Box>
    </>
} 