import { useState, useEffect } from "react";
import Flag from "react-flagkit";

// MUI Imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FormControl, FormControlLabel, FormGroup, MenuItem, Select, InputLabel } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';

import { UploadDataset } from '../apiFolder/DatasetUploadAPI';
import { DatasetInformation } from '../common/DatasetInformation';
import { DatasetTags } from "../common/DatasetTags";

// Languages that allow stemming
const stemLanguages = [
    "Arabic", "Danish", "Dutch", "English",
    "Finnish", "French", "German", "Hungarian",
    "Italian", "Norwegian", "Portuguese", "Romanian",
    "Russian", "Spanish", "Swedish"
];

export const UploadModal = (props) => {
    const [title, setTitle] = useState('');
    const [publicPrivate, setPublicPrivate] = useState(false);
    const [description, setDescription] = useState('');
    const [columnTypes, setColumnTypes] = useState({});
    const [headers, setHeaders] = useState([]);
    const [tags, setTags] = useState([]);
    const [tag, setTag] = useState('');
    const [loadedPage, setLoadedPage] = useState(1);
    const [datasetName, setDatasetName] = useState("");
    const [author, setAuthor] = useState('');
    const [date, setDate] = useState('');
    const [language, setLanguage] = useState("English");
    const [tokenization, setTokenization] = useState("none");
    const [embeddings, setEmbeddings] = useState(false);
    const [embedCol, setEmbedCol] = useState(null);
    const [pos, setPos] = useState(false);

    const FilledOut = () => {
        if (loadedPage === 1) {
            return title && description;
        } else if (loadedPage === 2) {
            return tags.length >= 1;
        }
        return true;
    };

    const SendDataset = () => {
        let _texts = headers.filter(header => columnTypes[header] === "TEXT");

        const metadata = {
            title, description, is_public: publicPrivate,
            preprocessing_type: tokenization, embeddings,
            pos, embed_col: embedCol, language,
            date_collected: date, author
        };

        let demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        demoV.uploadData = datasetName;
        localStorage.setItem('democracy-viewer', JSON.stringify(demoV));
        UploadDataset(datasetName, metadata, _texts, tags);

        props.CancelUpload();
    };

    useEffect(() => {
        setDatasetName(props.name);
        setHeaders(props.headers);
    }, [props]);

    useEffect(() => {
        if (stemLanguages.indexOf(language) === -1 && tokenization === "stem") {
            setTokenization("none");
        }
    }, [language]);

    useEffect(() => {
        if (!embeddings) {
            setEmbedCol(null);
        }
    }, [embeddings]);

    useEffect(() => {
        if (tokenization !== "lemma") {
            setPos(false);
        }
    }, [tokenization]);

    const addTag = () => {
        if (tag.trim() !== "") {
            setTags([...tags, tag]);
            setTag('');
        }
    };

    const deleteTag = (tagToDelete) => {
        setTags(tags.filter(tag => tag !== tagToDelete));
    };

    return (
        <Box
            sx={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                height: "80%",
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
                <LinearProgress variant="determinate" value={(loadedPage / 4) * 100} />
            </Box>

            {loadedPage === 1 && (
                <Box sx={{ padding: 2 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Dataset Information
                        <Tooltip title="Provide general information about the dataset. Noticed that the information will be shared to public if you select 'public' for privacy. All required fields need to be filled before moving to the next step.">
                            <IconButton size="small">
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            id="Title"
                            label="Dataset title"
                            variant="filled"
                            fullWidth
                            sx={{ background: 'rgb(255, 255, 255)' }}
                            value={title}
                            onChange={event => setTitle(event.target.value)}
                        />
                        <TextField
                            id="Author"
                            label="Author/Source"
                            variant="filled"
                            fullWidth
                            sx={{ background: 'rgb(255, 255, 255)' }}
                            value={author}
                            onChange={event => setAuthor(event.target.value)}
                        />
                        <TextField
                            id="Date"
                            label="Date"
                            type="date"
                            variant="filled"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            sx={{ background: 'rgb(255, 255, 255)' }}
                            value={date}
                            onChange={(event) => {
                                const value = event.target.value;
                                const year = parseInt(value.split('-')[0], 10);
                                if (year > 999 && year < 10000) {
                                    setDate(value);
                                }
                            }}
                        />
                        <TextField
                            id="Description"
                            label="Description"
                            variant="filled"
                            fullWidth
                            sx={{ background: 'rgb(255, 255, 255)' }}
                            value={description}
                            onChange={event => setDescription(event.target.value)}
                        />
                        <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                            <InputLabel>Privacy</InputLabel>
                            <Select
                                value={publicPrivate}
                                onChange={event => setPublicPrivate(event.target.value)}
                            >
                                <MenuItem value={true}>Public</MenuItem>
                                <MenuItem value={false}>Private</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            )}

            {loadedPage === 2 && (
                <Box sx={{ padding: 2 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Tags
                        <Tooltip title="Tags are used to describe datasets for future search and discovery.">
                            <IconButton size="small">
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                id="Tag"
                                label="Tag"
                                variant="filled"
                                fullWidth
                                sx={{ background: 'rgb(255, 255, 255)' }}
                                value={tag}
                                onChange={event => setTag(event.target.value)}
                            />
                            <IconButton onClick={addTag}>
                                <AddIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {tags.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    onDelete={() => deleteTag(tag)}
                                    sx={{ margin: 0.5 }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
            )}

            {loadedPage === 3 && (
                <Box sx={{ padding: 2 }}>
                    <Typography variant="h5" align="center" gutterBottom>
                        Column Information
                        <Tooltip title="Our system will auto detect data types if you leave the column as AUTO. However if you would like individual words to be parsed and preprocessed please signify that as a TEXT column. At least one TEXT column must be selected.">
                            <IconButton size="small">
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {headers.map((header, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                                <Typography sx={{ flex: 1 }}>{header}</Typography>
                                <FormControl fullWidth variant="filled" sx={{ flex: 2, background: 'rgb(255, 255, 255)' }}>
                                    <Select
                                        value={columnTypes[header] || 'AUTO'}
                                        onChange={event => setColumnTypes({ ...columnTypes, [header]: event.target.value })}
                                    >
                                        <MenuItem value="AUTO">AUTO</MenuItem>
                                        <MenuItem value="TEXT">TEXT</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        ))}
                    </Box>
                </Box>
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
                        <Tooltip arrow title="The language the text column(s) are written in. If we do not currently offer the language you are looking for, reach out to us to see if we can offer it in the future.">
                            <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                                <InputLabel>Language</InputLabel>
                                <Select
                                    value={language}
                                    onChange={event => setLanguage(event.target.value)}
                                >
                                    <MenuItem value="Chinese"><Flag country="CN" />&nbsp;Chinese</MenuItem>
                                    <MenuItem value="English"><Flag country="GB" />&nbsp;English</MenuItem>
                                    <MenuItem value="French"><Flag country="FR" />&nbsp;French</MenuItem>
                                    <MenuItem value="German"><Flag country="DE" />&nbsp;German</MenuItem>
                                    <MenuItem value="Greek"><Flag country="GR" />&nbsp;Greek</MenuItem>
                                    <MenuItem value="Italian"><Flag country="IT" />&nbsp;Italian</MenuItem>
                                    <MenuItem value="Latin"><Flag country="VA" />&nbsp;Latin</MenuItem>
                                    <MenuItem value="Portuguese"><Flag country="PT" />&nbsp;Portuguese</MenuItem>
                                    <MenuItem value="Russian"><Flag country="RU" />&nbsp;Russian</MenuItem>
                                    <MenuItem value="Spanish"><Flag country="ES" />&nbsp;Spanish</MenuItem>
                                </Select>
                            </FormControl>
                        </Tooltip>

                        <Tooltip arrow title={(
                            <div>
                                How to handle word morphology in the text. The options are in order of shortest to longest preprocessing time.
                                <ul>
                                    <li>No Processing: Words will be stored as they are found in the text. E.g. achieve and achieving will be stored as achieve and achieving, meaning they will not be viewed as equivalent.</li>
                                    <li>*Stemming: An algorithm that will attempt to reduce a word to its base form based on general patterns. This base form may or may not be a real word. E.g. achieve and achieving will both be stored as achiev.</li>
                                    <li>**Lemmatization: A more complex algorithm that will consider a word's context and possible forms to determine the best root. E.g. achieve and achieving will both be stored as achieve.</li>
                                </ul>
                                * Not available in all languages
                                <br />
                                ** Part of speech tagging is only available with lemmatization
                            </div>
                        )}>
                            <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                                <InputLabel>Tokenization</InputLabel>
                                <Select
                                    value={tokenization}
                                    onChange={event => setTokenization(event.target.value)}
                                >
                                    <MenuItem value="none">No Processing</MenuItem>
                                    {(stemLanguages.includes(language)) &&
                                        <MenuItem value="stem">Stemming</MenuItem>
                                    }
                                    <MenuItem value="lemma">Lemmatization</MenuItem>
                                </Select>
                            </FormControl>
                        </Tooltip>

                        <FormGroup>
                            <Tooltip arrow title={(
                                <p>Word embeddings are a machine learning algorithm that can be used to find similar/different words in the text. This requires a long computation time for large datasets, so it is disabled by default. <Link color="inherit" href="https://en.wikipedia.org/wiki/Word_embedding">Learn more about word embeddings here.</Link></p>
                            )}>
                                <FormControlLabel control={<Checkbox checked={embeddings} />} label="Compute Word Embeddings" onChange={() => setEmbeddings(!embeddings)} />
                            </Tooltip>

                            {embeddings && (
                                <Tooltip arrow title="Column to group the data by before computing word embeddings. Leave blank to not group the data. E.g. selecting a column that contains the year of each record will compute the word embeddings separately for each year.">
                                    <FormControl fullWidth variant="filled" sx={{ background: 'rgb(255, 255, 255)' }}>
                                        <InputLabel>Word Embedding Grouping Column</InputLabel>
                                        <Select
                                            value={embedCol}
                                            onChange={event => setEmbedCol(event.target.value)}
                                        >
                                            <MenuItem value={null}>&nbsp;</MenuItem>
                                            {headers.map((header, index) => (
                                                <MenuItem value={header} key={index}>{header}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Tooltip>
                            )}

                            {tokenization === "lemma" && (
                                <Tooltip arrow title="Store the part of speech and other related information of each word in the text. This requires a long computation time for large datasets, so it is disabled by default.">
                                    <FormControlLabel control={<Checkbox checked={pos} />} label="Tag Parts of Speech" onChange={() => setPos(!pos)} />
                                </Tooltip>
                            )}
                        </FormGroup>
                    </Box>
                </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2 }}>
                {loadedPage > 1 && (
                    <Button
                        variant="contained"
                        onClick={() => setLoadedPage(loadedPage - 1)}
                    >
                        Back
                    </Button>
                )}
                {loadedPage < 4 && (
                    <Button
                        variant="contained"
                        disabled={!FilledOut()}
                        onClick={() => setLoadedPage(loadedPage + 1)}
                    >
                        Next
                    </Button>
                )}
                {loadedPage === 4 && (
                    <Button
                        variant="contained"
                        disabled={!FilledOut()}
                        onClick={SendDataset}
                    >
                        Submit Dataset
                    </Button>
                )}
                {loadedPage === 1 && (
                    <Button
                        variant="contained"
                        onClick={props.CancelUpload}
                    >
                        Cancel
                    </Button>
                )}
            </Box>
        </Box>
    );
};
