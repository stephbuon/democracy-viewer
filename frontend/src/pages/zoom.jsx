import { useState, useEffect } from "react";
import { getRecordsByIds } from '../api/api.js';
import Parser from 'html-react-parser';

export const Zoom = ({ data }) => {

    // TESTING TEMP
    var innerHTML;
    // data.group = "MR. GLADSTONE"
    // data.count = 31
    // data.word = "industry"
    // data.ids = [1081131, 1113745, 124187, 309018, 333962, 333977, 368875, 395545, 461368, 461370, 461371, 461372, 5945, 6001, 6006, 6016, 6112, 6198, 6404, 6429, 6442, 651830, 69130, 71485, 743941, 77529, 77554, 77582]
    //


    const [searchResults, setSearchResults] = useState([]);

    // Gets record for data.ids and populates searchResults
    useEffect(() => {
        console.log("Zoom test", data)
        getRecordsByIds(data.dataset, data.ids).then(async (res) => {
            if (!res) {
                console.log("Odd zoom page error, no results of selected result?");
            }
            else {
                setSearchResults(res)
                console.log("Zoom test", searchResults, res);
            }
        })
    }, []);

    const highlight = (result) => {
        console.log("Highlighting")
        innerHTML = "";

        let tempText = result.text.replaceAll("\"", '')
        let lowerText = tempText.toLowerCase()
        let i = lowerText.indexOf(data.word)

        while(i != -1){
            innerHTML += tempText.substring(0, i)
            innerHTML += "<mark>" + data.word + "</mark>" + innerHTML.substring(i + data.word.length);
            
            tempText = tempText.substring(i + data.word.length)
            lowerText = lowerText.substring(i + data.word.length)
            i = lowerText.indexOf(data.word)
        }
        innerHTML += tempText;
      }

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

                {/* get id results */}
                {searchResults.length > 0 && searchResults.map(function(result, i)
                    {
                        highlight(result)

                        let debate = result.debate.replaceAll("\"", '')
                        let speaker = result.speaker.replaceAll("\"", '')

                        return <div key={i} className="row border">
                                <div className="col my-auto">
                                    {debate}
                                </div>
                                <div className="col my-auto">
                                    {speaker}
                                </div>
                                <div className="col my-auto">{Parser(innerHTML)}</div>
                            </div>
                    }
                )}

            </div>
        </div>
    );
}