import { useState, useEffect } from "react";
import { getRecordsByIds } from '../api/api.js';

export const Zoom = ({ data }) => {

    const [searchResults, setSearchResults] = useState([]);

    let _query = {
        table_name: "hansard_1870_1682572305673",
        search: `?col_search=${data.word}`
    }

    useEffect(() => {
        getRecordsByIds(data.dataset.table_name, data.ids).then(async (res) => {
            if (!res) {
                console.log("Odd zoom page error, no results of selected result?");
            }
            else {
                setSearchResults(res)
                console.log("Zoom test", searchResults, res);
            }
        })
      }, []);

    console.log("Zoom page opened with data: ", data)
    // TODO Show all values from group containing selected word
    /*
    return (
        <div>
            <div className="navbar-brand fs-3 text-center">{data.group} has {data.count} results for the word '{data.word}'</div>
            <p className="text-justify text-center">{data.description}</p>
        </div>
    );
    */
    return (
        <div>
            <div className="container text-center p-5">
                    {/* labels */}
                    <div className="row pb-2">
                        <div className="col"></div>
                        <div className="col">
                            <b>Group</b>
                        </div>
                        <div className="col">
                            <b>Count</b>
                        </div>
                        <div className="col">
                            <b>Word</b>
                        </div>
                    </div>

                    {/* data */}
                    <div className="row">
                        <div className="col">
                            <b>Selected datapoint</b>
                        </div>
                        <div className="col">
                            {data.group}
                        </div>
                        <div className="col">
                            {data.count}
                        </div>
                        <div className="col">
                            {data.word}
                        </div>
                    </div>

                    {/* related data */}
                    <div className="row pb-2">
                        <div className="col">
                            <b>Most common data in goup</b>
                        </div>
                        <div className="col">
                            {"MR. GLADSTONE"}
                        </div>
                        <div className="col">
                            {700 + "?"}
                        </div>
                        <div className="col">
                            {"[common word]"}
                        </div>

                    </div>

                {/* subset search title */}
                <div className="row pt-4 bp-2">
                    <div className="col border">
                        <b>Debate</b>
                    </div>
                    <div className="col border">
                        <b>Speaker</b>
                    </div>
                    <div className="col border">
                        <b>Text</b>
                    </div>
                </div>

                {/* subset result */}
                {searchResults.length > 0 && searchResults.map((result) => (
                    <div className="row border">
                        <div className="col my-auto">
                            {result.debate.replaceAll("\"", '')}
                        </div>
                        <div className="col my-auto">
                            {result.speaker.replaceAll("\"", '')}
                        </div>
                        <div className="col my-auto">
                            {result.text.replaceAll("\"", '')}
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}