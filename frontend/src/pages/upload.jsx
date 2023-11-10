import { React, useState, useEffect } from "react";
import { upload } from "../api/api.js";

export const Upload = () => {
  const [file, setFile] = useState(undefined);

  useEffect(() => {
    console.log(file);
    console.log(file == undefined);
  }, [file]);
  function print() {
    console.log(file);
  }
  return (
    <>
      <label className="btn btn-default">
        <input
          type="file"
          onChange={(x) => {
            setFile(x.target.files);
          }}
        />
      </label>

      <button
        className="btn btn-success"
        disabled={file == undefined}
        onClick={() => {
          upload(file[0]);
        }}
      >
        Upload
      </button>
      <button
        className="btn btn-success"
        disabled={file == undefined}
        onClick={print}
      >
        Log File
      </button>
    </>
  );
};
