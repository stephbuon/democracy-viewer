import { Link } from "react-router-dom";
import { ResultModal } from "./DatasetResultModal";
import { useEffect, useState } from "react";
import { getMetadata } from "../../../../api";

export const ResultLink = ({ table_name, setDataset}) => {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState(undefined);
    const [loggedIn, setLoggedIn] = useState(false);

    const updateDataset = (ds) => {
        setData(ds);
        setDataset(ds);
    }

    useEffect(() => {
        if (table_name) {
            getMetadata(table_name).then(x => setData(x));
        }

        const demoV = JSON.parse(localStorage.getItem('democracy-viewer'));
        if (demoV && demoV.user) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, [table_name]);

    if (!data) {
        return <></>
    }

    return <>
        <Link onClick={() => setOpen(true)}>{ data.title }</Link>

        <ResultModal
            dataset={data}
            setDataset={updateDataset}
            open={open}
            setOpen={setOpen}
            loggedIn={loggedIn}
        />
    </>
}