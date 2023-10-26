
export const Zoom = ({ data }) => {
    return (
        <div>
            <div className="navbar-brand fs-3 text-center">{data.group_name} has {data.count} results for the word '{data.word}'</div>
            <p class="text-justify text-center">{data.description}</p>
        </div>
    );
}