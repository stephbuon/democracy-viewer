import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import { getSuggestionsFor, getSuggestionsFrom, confirmSuggestion, deleteSuggestion } from "../../../api";
import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { ResultLink } from './ResultLink';

export const SuggestChangesTable = ({ type, pageLength, refresh, setRefresh, setDataset }) => {
    const navigate = useNavigate();

    const [first, setFirst] = useState(0);
    const [data, setData] = useState([...Array(pageLength).keys()]);
    const [totalNumResults, setTotalNumResults] = useState(0);

    const updateData = (x) => {
        const searchResults_ = [ ...x.data ];
        for (let i = x.data.length; i < pageLength; i++) {
            searchResults_.push({
                post_date: <>&nbsp;</>
            });
        }
        setData(searchResults_);
        setTotalNumResults(x.total);
    }

    const removeRow = (id) => {
        const searchResults_ = [ ...data.filter(x => x.id !== id) ];
        for (let i = searchResults_.length; i < pageLength; i++) {
            searchResults_.push({
                post_date: <>&nbsp;</>
            });
        }
        setData(searchResults_);
        setTotalNumResults(totalNumResults - 1);
    }

    const getNewSuggestions = (page) => {
        setFirst(pageLength * (page - 1));
        if (type === "for") {
            getSuggestionsFor({
                page,
                pageLength
            }).then(x => updateData(x));
        } else if (type === "from") {
            getSuggestionsFrom({
                page,
                pageLength
            }).then(x => updateData(x));
        }
    }

    const onConfirm = (id) => {
        removeRow(id);
        confirmSuggestion(id).then(x => {
            getNewSuggestions(1);
        });
    }

    const onDelete = (id) => {
        removeRow(id);
        deleteSuggestion(id).then(x => {
            getNewSuggestions(1);
        });
    }

    useEffect(() => {
        getNewSuggestions(1);
    }, [refresh]);

    if (type !== "for" && type !== "from") {
        return <>Invalid table type</>
    }

    return <>
        <DataTable
            value={data}
            scrollable 
            showGridlines 
            stripedRows 
            style={{
                width: "100%"
            }}
            lazy
            paginator
            rows={pageLength}
            totalRecords={totalNumResults}
            onPage={event => getNewSuggestions(event.page + 1)}
            first={first}
            emptyMessage="No Suggestions Found"
            // columnResizeMode="expand"
            // resizableColumns
        >
            <Column
                header="Date"
                field="post_date"
                style={{ minWidth: `${4 * 20}px` }}
            />

            <Column
                header="User"
                style={{ minWidth: `${4 * 20}px` }}
                body={x => (
                    <Link to={`/profile/${ type === "for" ? x.email : x.owner_email }`}>{ x.name }</Link>
                )}
            />

            <Column
                header="Dataset"
                style={{ minWidth: `${7 * 20}px` }}
                body={x => (
                    <>
                        {
                            x.table_name !== undefined &&
                            <ResultLink
                                table_name={x.table_name}
                                setDataset={setDataset}
                            />
                        }
                    </>
                )}
            />

            <Column
                header="Record Number"
                style={{ minWidth: `${4 * 20}px` }}
                body={x => (
                    <>{ x.record_id !== undefined && x.record_id + 1 }</>
                )}
            />

            <Column
                header="Old Text"
                field={x => (
                    <div style={{ 
                        height: '75px', 
                        overflowY: 'auto',
                        alignContent: "center"
                    }}>
                        {
                            x.old_text != undefined && <>"{x.old_text}"</>
                        }
                    </div>
                )}
                style={{ minWidth: `${8 * 20}px` }}
            />

            <Column
                header="New Text"
                field={x => (
                    <div style={{ 
                        height: '75px', 
                        overflowY: 'auto',
                        alignContent: "center"
                    }}>
                        {
                            x.new_text != undefined && <>"{x.new_text}"</>
                        }
                    </div>
                )}
                style={{ minWidth: `${8 * 20}px` }}
            />

            <Column
                header="View Record"
                field={x => {
                    if (typeof x.post_date === "string") {
                        return <Button
                            variant="contained"
                            color="primary"
                            sx={{
                                color: 'white',
                                background: 'black'
                            }}
                            onClick={() => navigate(`/datasets/subsets/suggestion/${ x.id }`)}
                        >
                            View
                        </Button>
                    } else {
                        return <></>
                    }
                }}
            />

            {
                type === "for" && 
                <Column
                    header="Confirm Suggestion"
                    field={x => {
                        if (typeof x.post_date === "string") {
                            return <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                    color: 'white',
                                    background: 'black'
                                }}
                                onClick={() => onConfirm(x.id)}
                            >
                                Confirm
                            </Button>
                        } else {
                            return <></>
                        }
                    }}
                />
            }

            {
                type === "for" && 
                <Column
                    header="Reject Suggestion"
                    field={x => {
                        if (typeof x.post_date === "string") {
                            return <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                    color: 'white',
                                    background: 'black'
                                }}
                                onClick={() => onDelete(x.id)}
                            >
                                Reject
                            </Button>
                        } else {
                            return <></>
                        }
                    }}
                />
            }

            {
                type === "from" && 
                <Column
                    header="Cancel Suggestion"
                    field={x => {
                        if (typeof x.post_date === "string") {
                            return <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                    color: 'white',
                                    background: 'black'
                                }}
                                onClick={() => onDelete(x.id)}
                            >
                                Cancel
                            </Button>
                        } else {
                            return <></>
                        }
                    }}
                />
            }
        </DataTable>
    </>
}