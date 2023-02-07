import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import { DisplayResults } from './DisplayResults/DisplayResults';


const hardcodedResults = ["hello", "helloj", ";lo", "asdkfjh", "k"]

export const SubsetResultsPage = (props) => {
    const navigate = useNavigate();
    const params = useParams()

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const searchFunction = () => {
        console.log("navigating")
        navigate(`/subsetsearch/${searchTerm}`)
        console.log("did not navigate from results page")

    }

    //code to see if enter key is pressed (search when that happens)
    useEffect(() => {
        setSearchTerm(params.searchterm)
        const keyDownHandler = event => {
            // console.log('User pressed: ', event.key);

            if (event.key === 'Enter') {
                console.log('User pressed: Enter');
                searchFunction();
            }
        };

        document.addEventListener('keydown', keyDownHandler);

        return () => {
            document.removeEventListener('keydown', keyDownHandler);
        };
    }, []);


    return (<div className='darkblue'>
        <row>
            <input type="text" id='searchTerm' value={searchTerm} onChange={event => { setSearchTerm(event.target.value) }} />
            <button type='button' onClick={() => searchFunction()}>Search</button>
        </row>

        <div className='mt-5'></div>

        <DisplayResults
        results={hardcodedResults}/>
        
        
    </div >)

}