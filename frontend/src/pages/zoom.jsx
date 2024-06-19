// Imports
import { useState, useEffect } from "react";
import { getRecordsByIds } from '../api/api.js';

export const Zoom = ({ data }) => {

    // TESTING TEMP
    var innerHTML;
    data.group = "MR. GLADSTONE"
    data.count = 31
    data.word = "industry"
    data.ids = [1081131, 1113745, 124187, 309018, 333962, 333977, 368875, 395545, 461368, 461370, 461371, 461372, 5945, 6001, 6006, 6016, 6112, 6198, 6404, 6429, 6442, 651830, 69130, 71485, 743941, 77529, 77554, 77582]
    //


    const [searchResults, setSearchResults] = useState([]);

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

    const highlight = (result, index) => {
        console.log("Highlighting")
        var textLabel = document.getElementById("text" + index);
        innerHTML = "";

    // Funcion definitions
    const highlight = (result) => { // Cleans result and highlights all instances of data.word
        let output = "";
        let text = result.text.replaceAll("\"", '')
        let lowerText = text.toLowerCase()
        let i = lowerText.indexOf(data.word)

        while(i != -1){
            output += text.substring(0, i)
            output += "<mark>" + data.word + "</mark>";
            
            text = text.substring(i + data.word.length)
            lowerText = lowerText.substring(i + data.word.length)
            i = lowerText.indexOf(data.word)
        }
        innerHTML += tempText;
        console.log("HTML TEST", innerHTML)
        console.log(result, index)
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
                {/* Top labels */}
                <div className="row pb-2">
                    <div className="col"></div>
                    <div className="col">
                        <b>x</b>
                    </div>
                    <div className="col">
                        <b>y</b>
                    </div>
                </div>

                {/* Word data */}
                <div className="row">
                    <div className="col">
                        <b>Selected datapoint</b>
                    </div>
                    <div className="col">
                        {data.x}
                    </div>
                    <div className="col">
                        {data.y}
                    </div>
                </div>

                <div id="scroll-box" className="pt-4 bp-2" style={{overflow:"scroll", overflowX: "scroll"}}>
                    {/* Subset search title */}
                    <div className="row" style={{overflowX:"auto", whiteSpace:"nowrap"}}>
                        <div className="col border" xs={5}>
                            <b>{"Index"}</b>
                        </div>
                        {searchResults.length > 0 && Object.keys(loadedData[0]).map(function(result, i)
                            {
                                return  <div key={"label" + i} className="col border" xs={5} style={{display:"inline-block", float:"none"}}>
                                    <b>{result}</b>
                                </div>
                            })
                        }
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
                        highlight(result, i)

                        let debate = result.debate.replaceAll("\"", '')
                        let speaker = result.speaker.replaceAll("\"", '')

                        return <div className="row border">
                                <div className="col my-auto">
                                    {debate}
                                </div>
                                <div className="col my-auto">
                                    {speaker}
                                </div>
                                <div className="col my-auto">{innerHTML}</div>
                            </div>
                    }
                )}

            </div>
        </div>
        </>
    );
}