// Imports
import { useState, useEffect } from "react";
import { getRecordsByIds } from '../api/api.js';
import Parser from 'html-react-parser';

export const Zoom = () => {
    // UseState definitions
    const [searchResults, setSearchResults] = useState([]);
    const [loadedData, setLoadedData] = useState([]);
    const [keys, setKeys] = useState([]);

    let graphData = JSON.parse(localStorage.getItem('selected'));
    const [data, setData] = useState(graphData);

    // Variable definitions
    var innerHTML;
    var scrollSpot = 0;
    var valueTrack = 0;
    var show = false;

    // UseEffect: Gets record for all data.ids and populates searchResults
    useEffect(() => {
        const scrollBox = document.querySelector("div#scroll-box");
        scrollBox.addEventListener('scroll', (event) => {
            handleScroll(event)
        });

        getRecordsByIds(data.dataset, data.ids).then(async (res) => {
            if (!res) {
                console.log("Zoom error, no results found");
            }
            else {
                setSearchResults(res)
                setLoadedData(res.slice(0, Math.min(10, res.length)))
                setKeys(Object.keys(res))
            }
        })
    }, []);

    // UseEffect: Prints data on change, updates graph on data change
    useEffect(() => {
        console.log("Zoom test", data)
    }, [data]);

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
        return output + text;
      }


    return (<>
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

                    {/* Subset search data display */}
                    {searchResults.length > 0 && loadedData.map(function(result, i)
                        {
                            highlight(result)

                            // let debate = result.debate.replaceAll("\"", '')
                            // let speaker = result.speaker.replaceAll("\"", '')

                            let values = Object.values(result);
                            return  <div key={"result" + i} className="row border">
                                <div className="col" xs={5}>
                                    {i}
                                </div>
                                {values.map(function(item, j)
                                {
                                    return <div key={"result" + i + "value" + j} className="col" xs={5}>
                                        {String(item)}
                                    </div>
                                }
                                )}
                                </div>
                        })
                    }
                </div>
            </div>
        </div>
        </>
    );
}