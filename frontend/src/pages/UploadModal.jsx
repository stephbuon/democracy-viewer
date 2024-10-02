import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Flag from "react-flagkit";

// MUI Imports
import { 
    Box, Button, Checkbox,FormControl, FormControlLabel, FormGroup, IconButton, 
    InputLabel, LinearProgress, MenuItem, Select, Tooltip, Typography,
    Card, CardActions, CardContent, Alert, Snackbar
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { GetCSVFromAPI, CreateDataset, UploadDataset } from "../apiFolder/DatasetUploadAPI.js";
import { DatasetInformation } from '../common/DatasetInformation';
import { DatasetTags } from "../common/DatasetTags";
import { getDistributedConnections } from "../api/api";
import { FormattedMultiSelectField } from "../common/forms";

// Languages that allow stemming
// Some of these languages are not yet available in democracy viewer
const stemLanguages = [
    "Arabic", "Danish", "Dutch", "English", 
    "Finnish", "French", "German", "Hungarian", 
    "Italian", "Norwegian", "Portuguese", "Romanian", 
    "Russian", "Spanish", "Swedish"
]

export const UploadModal = (props) => {
    const [file, setFile] = useState(undefined);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [disableButtons, setDisableButtons] = useState(false);
    const [headers, setHeaders] = useState([]);
    const [tableName, settableName] = useState(undefined);
    const [APIEndpoint, setAPIEndpoint] = useState("");
    const [Token, setToken] = useState("");
    const [alert, setAlert] = useState(0);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [snackBarOpen, setSnackBarOpen] = useState(false);

    const [title, setTitle] = useState('');
    const [publicPrivate, setPublicPrivate] = useState(false);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
   
    const [loadedPage, setLoadedPage] = useState(1);
    const [author, setAuthor] = useState('');
    const [date, setDate] = useState('');
    // Preprocessing
    const [useDistributed, setUseDistributed] = useState(false);
    const [distributed, setDistributed] = useState(null);
    const [distributedOptions, setDistributedOptions] = useState([]);
    const [language, setLanguage] = useState("English");
    const [tokenization, setTokenization] = useState("none");
    const [embeddings, setEmbeddings] = useState(false);
    const [embedCol, setEmbedCol] = useState(null);
    const [textCols, setTextCols] = useState([]);
    const [textColOptions, setTextColOptions] = useState([]);

    const [disabled, setDisabled] = useState(true);

    const navigate = useNavigate();

    const SendDataset = () => {
        const textCols_ = textCols.map(x => x.value);
        const metadata = {
            title, description, is_public: publicPrivate,
            preprocessing_type: tokenization, embeddings,
            embed_col: embedCol, language,
            date_collected: date, author
        };
        if (useDistributed && distributed) {
            metadata.distributed = distributed;
        }
        // Delete undefined values
        Object.keys(metadata).forEach(x => {
            if (!metadata[x]) {
                delete metadata[x];
            }
        });
        
        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        demoV.uploadData = tableName;
        localStorage.setItem('democracy-viewer', JSON.stringify(demoV));
        UploadDataset(tableName, metadata, textCols_, tags);
        
        props.CancelUpload();
        navigate("/upload/complete");
    }

    const uploadCsv = () => {
        setAlert(0);
        setUploadProgress(0);
        setDisableButtons(true);
        CreateDataset(file, setUploadProgress).then(res => {
          settableName(res.table_name)
          setHeaders(res.headers)
          setFileUploaded(true);
          setAlert(3);
        }).catch(res => {
          if (res.response && res.response.data.message === "MulterError: File too large") {
            setAlert(4);
          } else {
            setAlert(2);
          }
          
          setFile(undefined);
          setUploadProgress(0);
        }).finally(() => setDisableButtons(false));
      };

      const APIcsv = () => {
        setAlert(0);
        setDisableButtons(true);
        GetCSVFromAPI(APIEndpoint, Token)
          .then((res) => {
            settableName(res.table_name);
            setHeaders(res.headers);
            setFileUploaded(true);
            setAlert(3);
          })
          .catch(() => {
            setAlert(2);
          }).finally(() => setDisableButtons(false));
      };
    
      const handleSnackBarClose = (event, reason) => {
        if (reason === "clickaway") {
          return;
        }
        setSnackBarOpen(false);
      };

    useEffect(() => {
        setTextColOptions(
            headers.map(x => {return {
                label: x,
                value: x
            }})
        )
    }, [headers]);

    useEffect(() => {
        if (alert !== 0) {
          setSnackBarOpen(true);
        } else {
          setSnackBarOpen(false);
        }
      }, [alert]);

    useEffect(() => {
        if (file && file.name) {
          setAlert(0);
          const validExtensions = [".csv"];
          if (validExtensions.filter((x) => file.name.includes(x)).length === 0) {
            setAlert(1);
          } else {
            uploadCsv();
          }
        }
      }, [file]);

    useEffect(() => {
        if (loadedPage === 1) {
            setDisabled(false);
        } else if (loadedPage === 2) {
            setDisabled(true);
        } else if (loadedPage === 3) {
            setDisabled(false);
        } else if (loadedPage === 4) {
            setDisabled(textCols.length === 0);
        } 
    }, [loadedPage, textCols])

    useEffect(() => {
        if (stemLanguages.filter(x => x === language).length === 0 && tokenization === "stem") {
            setTokenization("none");
        }
    }, [language]);

    useEffect(() => {
        if (!embeddings) {
            setEmbedCol(null);
        }
    }, [embeddings]);

    useEffect(() => {
        if (useDistributed && distributedOptions.length === 0) {
            getDistributedConnections().then(x => setDistributedOptions(x));
        }
    }, [useDistributed]);

    return (
        <Box
            sx={{
                position: 'absolute',
                top: '2.5%',
                left: '10%',
                height: "95%",
                overflowY: "auto",
                width: "80%",
                bgcolor: 'background.paper',
                border: '1px solid #000',
                borderRadius: ".5em .5em",
                boxShadow: 24,
                p: 4,
                outline: 'none'
            }}
        >
            <Box sx={{
                width: '100%',
                mb: 3,
                '& .MuiLinearProgress-root': {
                    height: '10px',
                    borderRadius: '5px'
                }
            }}>
                <LinearProgress variant="determinate" value={(loadedPage / 3) * 100} />
            </Box>
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={snackBarOpen}
                autoHideDuration={6000}
                onClose={() => handleSnackBarClose()}
            >
                <Alert
                onClose={handleSnackBarClose}
                severity={alert === 3 ? "success" : "error"}
                sx={{ width: "100%" }}
                >
                {alert === 1 && <div>Only '.csv', '.xls', and '.xlsx' files can be uploaded</div>}
                {alert === 2 && <div>An error occurred uploading the dataset</div>}
                {alert === 3 && <div>Dataset successfully uploaded</div>}
                {alert === 4 && <div>Maximum upload size is 150 MB. Reach out to us at <Link to="mailto:democracyviewerlab@gmail.com">democracyviewerlab@gmail.com</Link> to upload a larger dataset</div>}
                </Alert>
            </Snackbar>

            {loadedPage === 1 && (
                <>
                    {props.uploadType === "csv" && (
                        <Card sx={{ height: "90%", display: "flex", flexDirection: "column" }}>
                            <CardContent
                                sx={{
                                flexGrow: 1,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                }}
                            >
                                <Typography gutterBottom variant="h5" component="h2" align="center">
                                Upload File
                                </Typography>
                                <Typography align="center">Upload a CSV File</Typography>
                                {uploadProgress > 0 && (
                                <LinearProgress
                                    variant="determinate"
                                    value={uploadProgress}
                                    sx={{ width: "100%", mt: 2 }}
                                />
                                )}
                            </CardContent>
                            <CardActions style={{ justifyContent: "center" }}>
                                <Button
                                variant="contained"
                                component="label"
                                sx={{ mb: 5, bgcolor: "black", color: "white", borderRadius: "50px", px: 4, py: 1 }}
                                disabled={disableButtons}
                                >
                                Select
                                <input
                                    type="file"
                                    
                                    hidden
                                    onChange={(x) => {
                                    setFile(x.target.files[0]);
                                    }}
                                />
                                </Button>
                            </CardActions>
                        </Card>
                    )}

                    {props.uploadType === "api" && (
                        <>
                        </>
                    )}
                </>
            )}

            {loadedPage === 2 && (
                <DatasetInformation
                    title={title}
                    setTitle={setTitle}
                    author={author}
                    setAuthor={setAuthor}
                    date={date}
                    setDate={setDate}
                    description={description}
                    setDescription={setDescription}
                    publicPrivate={publicPrivate}
                    setPublicPrivate={setPublicPrivate}
                    disabled={disabled}
                    setDisabled={setDisabled}
                />
            )}

            {loadedPage === 3 && (
                <DatasetTags
                    tags={tags}
                    setTags={setTags}
                />
            )}

            {loadedPage === 4 && (
                <Box sx={{ padding: 2 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Preprocessing Settings
                        <Tooltip title="Provide details on how you would like your dataset to be preprocessed.">
                            <IconButton size="small">
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <FormGroup>
                            <Tooltip arrow title = {(
                                <p>Store your dataset and preprocessing data in your own AWS S3 bucket.</p>
                            )}>
                                <FormControlLabel control={<Checkbox defaultChecked = {useDistributed}/>} label="Use a distributed connection" onChange={event => setUseDistributed(!useDistributed)}/>
                            </Tooltip>
        
                            {
                                useDistributed &&
                                <Tooltip arrow title = "Choose one of your distributed connections to save your data to.">
                                    <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                                        <InputLabel>Choose Distributed Connection</InputLabel>
                                        <Select
                                            value={distributed}
                                            onChange={event => setDistributed(event.target.value)}
                                        >
                                            <MenuItem value = {null}>&nbsp;</MenuItem>
                                            {distributedOptions.map(x => (
                                                <MenuItem value = {x.id} key = {x.id}>{ x.name }</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Tooltip>
                            }
                        </FormGroup>

                        <Tooltip arrow title = "Select which column(s) contain text that needs to be processed. You must select at least 1 text column.">
                            <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)', zIndex: 50 }}>
                                <Typography>Text Columns</Typography>
                                <FormattedMultiSelectField
                                    selectedOptions={textCols}
                                    setSelectedOptions={setTextCols}
                                    getData={textColOptions}
                                    id="textColSelect"
                                    closeMenuOnSelect={false}
                                />
                            </FormControl>
                        </Tooltip>

                        <Tooltip arrow title = "The language the text column(s) are written in. If we do not currently offer the language you are looking for, reach out to us to see if we can offer it in the future.">
                            <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                                
                                <InputLabel>Language</InputLabel>
                                
                                <Select
                                    value={language}
                                    onChange={event => setLanguage(event.target.value)}
                                >
                                    <MenuItem value = "Chinese"><Flag country = "CN"/>&nbsp;Chinese</MenuItem>
                                    <MenuItem value = "English"><Flag country = "GB"/>&nbsp;English</MenuItem>
                                    <MenuItem value = "French"><Flag country = "FR"/>&nbsp;French</MenuItem>
                                    <MenuItem value = "German"><Flag country = "DE"/>&nbsp;German</MenuItem>
                                    <MenuItem value = "Greek"><Flag country = "GR"/>&nbsp;Greek</MenuItem>
                                    <MenuItem value = "Italian"><Flag country = "IT"/>&nbsp;Italian</MenuItem>
                                    <MenuItem value = "Latin"><Flag country = "VA"/>&nbsp;Latin</MenuItem>
                                    <MenuItem value = "Portuguese"><Flag country = "PT"/>&nbsp;Portuguese</MenuItem>
                                    <MenuItem value = "Russian"><Flag country = "RU"/>&nbsp;Russian</MenuItem>
                                    <MenuItem value = "Spanish"><Flag country = "ES"/>&nbsp;Spanish</MenuItem>
                                </Select>
                            </FormControl>
                        </Tooltip>

                        <Tooltip arrow title = {(
                            <div>
                                How to handle word morphology in the text. The options are in order of shortest to longest preprocessing time.

                                <ul>
                                    <li>No Processing: Words will be stored as they are found in the text. E.g. achieve and achieving will be stored as achieve and achieving, meaning they will not be viewed as equivalent.</li>
                                    <li>*Stemming: An algorithm that will attempt to reduce a word to its base form based on general patterns. This base form may or may not be a real word. E.g. achieve and achieving will both be stored as achiev.</li>
                                    <li>**Lemmatization: A more complex algorithm that will consider a word's context and possible forms to determine the best root. E.g. achieve and achieving will both be stored as achieve.</li>
                                </ul>
                                * Not available in all languages
                                <br/>
                                ** Part of speech tagging is only available with lemmatization
                            </div>
                        )}>
                            <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                                <InputLabel>Tokenization</InputLabel>
                                <Select
                                    value={tokenization}
                                    onChange={event => setTokenization(event.target.value)}
                                >
                                    <MenuItem value = "none">No Processing</MenuItem>
                                    {
                                        (stemLanguages.filter(x => x === language).length > 0) &&
                                        <MenuItem value = "stem">Stemming</MenuItem>
                                    }
                                    <MenuItem value = "lemma">Lemmatization</MenuItem>
                                </Select>
                            </FormControl>
                        </Tooltip>

                        <FormGroup>
                            <Tooltip arrow title = {(
                                <p>Word embeddings are a machine learning algorithm that can be used to find similar/different words in the text. This requires a long computation time for large datasets, so it is disabled by default. <Link color = "inherit" to = "https://en.wikipedia.org/wiki/Word_embedding">Learn more about word embeddings here.</Link></p>
                            )}>
                                <FormControlLabel control={<Checkbox defaultChecked = {embeddings}/>} label="Compute Word Embeddings" onChange={event => setEmbeddings(!embeddings)}/>
                            </Tooltip>
        
                            {
                                embeddings &&
                                <Tooltip arrow title = "Column to group the data by before computing word embeddings. Leave blank to not group the data. E.g. selecting a column that contains the year of each record will compute the word embeddings separately for each year.">
                                    <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                                        <InputLabel>Word Embedding Grouping Column</InputLabel>
                                        <Select
                                            value={embedCol}
                                            onChange={event => setEmbedCol(event.target.value)}
                                        >
                                            <MenuItem value = {null}>&nbsp;</MenuItem>
                                            {textColOptions.filter(x => !textCols.includes(x)).map((header, index) => (
                                                <MenuItem value = {header.value} key = {index}>{ header.label }</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Tooltip>
                            }
                        </FormGroup>
                    </Box>
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2 }}>
                {loadedPage === 1 && (
                    <Button
                        variant="contained"
                        sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}      
                        onClick={() => props.CancelUpload()}
                    >
                        Cancel
                    </Button>
                )}
                {loadedPage > 1 && (
                    <Button
                        variant="contained"
                        sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}      
                        onClick={() => setLoadedPage(loadedPage - 1)}
                    >
                        Back
                    </Button>
                )}
                {loadedPage < 4 && (
                    <Button
                        variant="contained"
                        sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}      
                        disabled={disabled}
                        onClick={() => setLoadedPage(loadedPage + 1)}
                    >
                        Next
                    </Button>
                )}
                {loadedPage === 4 && (
                    <Button
                        variant="contained"
                        sx={{ mb: 2, mt: 3,bgcolor: 'black', color: 'white', borderRadius: '50px', px: 4, py: 1, alignItems: 'center' }}      
                        disabled={disabled}
                        onClick={() => SendDataset()}
                    >
                        Submit Dataset
                    </Button>
                )}
            </Box>
        </Box>
    );
}