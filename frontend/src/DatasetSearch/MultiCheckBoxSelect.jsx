import React, { Component } from "react";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
// import { colourOptions } from "./data.js";
import { default as ReactSelect } from "react-select";
// import "./styles.css";
import { components } from "react-select";
import { GetAllTags } from '../apiFolder/DatasetSearchAPI';



export const MultiCheckBoxSelect = (props) => {

    const [allTagOptions, setAllTagOptions] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    useEffect(() => {
        GetAllTags().then(async res => {
            let tags = allTagOptions; //needs to be a ref to current list. Javascript is dumb
            while (tags.length > 0) {
                tags.pop(); //clear that thing (should be empty but just in case)
            }
            for (let i in res) {
                tags.push({ tag: res[i], checked: false })
                // tags.push(res[i])
            }
            console.log("Tags", tags)
            setAllTagOptions([...tags]);
            console.log("TagOptions", allTagOptions)
        })
    }, []);

    const handleChange = (index) => {
        let _selectedTags = selectedTags
        _selectedTags.push(allTagOptions[index])
        setSelectedTags(_selectedTags)
    }

    return <ReactSelect
        options={allTagOptions}
        isMulti
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        onChange={(index) => handleChange(index)}
        allowSelectAll={true}
        value={selectedTags}
    >
        
        {allTagOptions.map((tag) => {
            console.log("Adding Option", tag);

            // return <components.Option {tag}>{tag.tag}</components.Option>
            return <option {...tag}>
                <input
                    type="checkbox"
                    checked={tag.selected}
                // onChange={() => null}
                />{" "}
                <label>{tag.tag}</label>
            </option>
        })}
    </ReactSelect>
}


//Got this online, and am trying to customize it for now

// const Option = (props) => {
//     return (
//         <div>
//             {console.log(props.data) && <components.Option {...props}>
//                 <input
//                     type="checkbox"
//                     checked={props.data.selected}
//                     onChange={() => null}
//                 />{" "}
//                 <label>{props.data.tag}</label>
//             </components.Option>}
//         </div>
//     );
// };

// export default class MultiCheckBoxSelect extends Component {
//     constructor(props) {
//         console.log("props for select", props)
//         super(props);
//         this.state = {
//             optionSelected: null
//         };
//     }

//     handleChange = (selected) => {
//         this.setState({
//             optionSelected: selected
//         });
//     };

//     render() {
//         return (
//             <span
//                 class="d-inline-block"
//                 data-toggle="popover"
//                 data-trigger="focus"
//                 data-content="Please selecet account(s)"
//             >
//                 <ReactSelect
//                     options={this.props.tags}
//                     isMulti
//                     closeMenuOnSelect={false}
//                     hideSelectedOptions={false}
//                     components={{
//                         Option
//                     }}
//                     onChange={this.handleChange}
//                     allowSelectAll={true}
//                     value={this.state.optionSelected}
//                 />
//             </span>
//         );
//     }
// }

// const rootElement = document.getElementById("root");
// ReactDOM.render(<MultiCheckBoxSelect />, rootElement);