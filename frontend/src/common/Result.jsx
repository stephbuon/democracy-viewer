
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import { TableBody, TableHead, TableRow, TableCell } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { Popularize } from '../apiFolder/DatasetSearchAPI';
import AlertDialog from './AlertDialog';
import { deleteDataset } from '../api/api';
import { DatasetInformation } from './DatasetInformation';
import { DatasetTags } from './DatasetTags';

export const Result = (props) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const navigate = useNavigate();

    const chooseDataset = () => {
        Popularize(props.result)
        props.setDataset(props.result);
    }

    const [title, setTitle] = useState(props.result.title);
    const [publicPrivate, setPublicPrivate] = useState(props.result.is_public);
    const [description, setDescription] = useState(props.result.description);
    const [author, setAuthor] = useState(props.result.author);
    const [date, setDate] = useState(props.result.date);
    const [tags, setTags] = useState(props.result.tags);

    const [infoDisabled, setInfoDisabled] = useState(true);
    const [tagsDisabled, setTagsDisabled] = useState(true);

    useEffect(() => {
        if (infoDisabled && (title !== props.result.title || publicPrivate !== props.result.is_public || description !== props.result.description || author !== props.result.author || date !== props.result.date)) {
            setInfoDisabled(false);
        } else if (!infoDisabled && (title === props.result.title || publicPrivate === props.result.is_public || description === props.result.description || author === props.result.author || date === props.result.date))
    }, [title, publicPrivate, description, author, date])

    return <div>
        <Box onClick={() => handleOpen()}>
            {props.result.title}
        </Box>
        <Modal
            open={open}
            onClose={() => handleClose()}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '15%',
                    left: '15%',
                    height: "70%",
                    overflow: "scroll",
                    width: "70%",
                    bgcolor: 'background.paper',
                    border: '1px solid #000',
                    borderRadius: ".5em .5em"
                }}
            >
                {
                    props.editable && <>
                        <AlertDialog
                            buttonText={"Edit"}
                            titleText={`Edit dataset "${ props.result.title }"`}
                            bodyText={
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
                                />
                            }
                            action={() => {}}
                        />
                        <AlertDialog
                            buttonText={"Edit Tags"}
                            titleText={`Edit dataset "${ props.result.title }"`}
                            bodyText={
                                <DatasetTags
                                    tags={tags}
                                    setTags={setTags}
                                />
                            }
                            action={() => {}}
                        />
                        <AlertDialog
                            buttonText={"Delete"}
                            titleText={`Are you sure you want to delete the dataset "${ props.result.title }"?`}
                            bodyText={"This action cannot be undone."}
                            action={() => deleteDataset(props.result.table_name).then(x => window.location.reload())}
                        />
                    </>
                }
                
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{

                                }}>
                                {props.result.title}
                            </TableCell>
                            <TableCell>
                                &nbsp;
                            </TableCell>
                            <TableCell>
                                {props.result.is_public && "Public"}
                                {!props.result.is_public && "Private"}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                Owner:
                            </TableCell>
                            <TableCell>
                                {props.result.username}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                Description:
                            </TableCell>
                            <TableCell>
                                {props.result.description}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                Tags:
                            </TableCell>
                            {props.result.tags.map((tag, index) => {
                                if (index < 5) {
                                    return <TableCell key={index}>
                                        {tag}
                                    </TableCell>
                                }
                            })}
                            {props.result.tags.length < 1 && <TableCell key={1} />}
                            {props.result.tags.length < 2 && <TableCell key={2} />}
                            {props.result.tags.length < 3 && <TableCell key={3} />}
                            {props.result.tags.length < 4 && <TableCell key={4} />}
                            {props.result.tags.length < 5 && <TableCell key={5} />}
                            {props.result.tags.length < 6 && <TableCell key={6} />}
                            {props.result.tags.length > 5 && <TableCell key={'...'}>
                                ...
                            </TableCell>}

                        </TableRow>
                    </TableBody>
                </Table>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '2em'
                    }}>
                    <p>Use This Dataset!</p>
                </Box>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '.5em'
                    }}>
                    <Button
                        variant="contained"
                        primary
                        sx={{
                            marginX: '1em'
                        }}
                        onClick={() => {
                            chooseDataset()
                            navigate('/subsetSearch');
                        }}
                    >
                        Search Data
                    </Button>
                    <Button
                        variant="contained"
                        primary
                        sx={{
                            marginX: '1em'
                        }}
                        onClick={() => {
                            chooseDataset()
                            navigate('/graph');
                        }}
                    >
                        Graph Data
                    </Button>
                </Box>
            </Box>
        </Modal>

    </div>
}