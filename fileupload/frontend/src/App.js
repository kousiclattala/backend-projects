import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [file, setFile] = useState({});

  const [alldata, setAlldata] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("file | ", file);

    const formData = new FormData();
    formData.append("firstname", firstname);
    formData.append("lastname", lastname);
    formData.append("samplefile", file);

    console.log("formdata", formData);

    // await axios
    //   .post("http://localhost:4000/uploadpicture", formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   })
    //   .then((res) => console.log(res.data))
    //   .catch((err) => console.log("posting picture", err.response.data));

    // await axios
    //   .post("http://localhost:4000/cloudinaryupload", formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   })
    //   .then((res) => console.log(res.data))
    //   .catch((err) => console.log("posting picture", err.response.data));

    await axios
      .post("http://localhost:4000/awsupload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => console.log(res.data))
      .catch((err) => console.log("posting picture", err.response.data));
  };

  const getAllPictures = async () => {
    await axios
      .get("http://localhost:4000/allusers")
      .then((res) => {
        console.log(res.data);
        setAlldata(res.data);
      })
      .catch((err) => console.log("all data | ", err.response.data));
  };

  useEffect(() => {
    getAllPictures();
  }, []);

  return (
    <div className="App">
      <div>
        <form>
          <div className="mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              name="firstname"
              onChange={(e) => setFirstname(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              name="lastname"
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Select Picture</label>
            <input
              className="form-control"
              name="samplefile"
              type="file"
              onChange={(e) => {
                console.log(e.target.files[0]);
                setFile(e.target.files[0]);
              }}
            />
          </div>
          <button
            type="submit"
            onClick={(e) => handleSubmit(e)}
            className="btn btn-primary"
          >
            Submit
          </button>
        </form>

        {alldata.map((item, index) => (
          <img
            src={item.profilePic}
            width={200}
            height={200}
            key={index}
            alt="pictures"
          />
        ))}
      </div>
    </div>
  );
}

export default App;
