
export const Zoom = ({ data }) => {
    console.log("Zoom page opened with data: ", data)
    // TODO Show all values from group containing selected word
    return (
        <div>
            <div className="navbar-brand fs-3 text-center">{data.group} has {data.count} results for the word '{data.word}'</div>
            <p className="text-justify text-center">{data.description}</p>
        </div>
    );
}