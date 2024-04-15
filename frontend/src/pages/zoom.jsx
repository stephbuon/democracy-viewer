import { useState, useEffect } from "react";
import { getRecordsByIds } from '../api/api.js';
import Parser from 'html-react-parser';

export const Zoom = () => {
    // UseState definitions
    const [searchResults, setSearchResults] = useState([]);
    const [loadedData, setLoadedData] = useState([])

    let graphData = JSON.parse(localStorage.getItem('selected'));
    const [data, setData] = useState(graphData.selected);

    // Variable definitions
    var innerHTML;
    var scrollSpot = 0;
    var valueTrack = 0;

    // Gets record for data.ids and populates searchResults
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
            }
        })
    }, []);

    // Funcion definitions
    const highlight = (result) => {
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

      const handleScroll = (event) => {
        // if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isLoading) {
        //   return;
        // }
        // fetchData();
      };

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
                <div id="scroll-box" style={{overflow:"scroll"}}>
                    {searchResults.length > 0 && loadedData.map(function(result, i)
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
        </div>
    );
}