/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-no-target-blank */
import React, { useEffect, useState } from "react";
import "./App.css";
import { Auth } from "./Components/auth";
import { auth, db, storage } from "./config/firebase";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

function App() {
  const [movieList, setMovieList] = useState([]);
  const movieCollref = collection(db, "movies");

  //new Movie States
  const [movieName, setMovieName] = useState("");
  const [year, setYear] = useState("");
  const [oscar, setOscar] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  //file Upload state
  const [uploadFile, setUploadFile] = useState([]);

  const getMovieList = async () => {
    try {
      const data = await getDocs(movieCollref);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setMovieList(filteredData);
      console.log(movieList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getMovieList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitMovieData = async () => {
    try {
      await addDoc(movieCollref, {
        title: movieName,
        releaseDate: year,
        recievedOscar: oscar,
        userId: auth?.currentUser?.uid,
      });
      getMovieList();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMovie = async (id) => {
    const movieDoc = doc(db, "movies", id);
    await deleteDoc(movieDoc);
    console.log(movieList);
  };

  const updateMovieTitle = async (id) => {
    const movieDoc = doc(db, "movies", id);
    await updateDoc(movieDoc, { title: newTitle });
    console.log(movieList);
  };

  const fileUpload = async () => {
    if (!uploadFile) return null;
    else {
      const fileFolderRef = ref(storage, `projectFiles/${uploadFile.name}`);
      try {
        await uploadBytes(fileFolderRef, uploadFile);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="App">
      <Auth />
      <div>
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            placeholder="MovieName..."
            type="text"
            value={movieName}
            onChange={(e) => setMovieName(e.target.value)}
          />
          <input
            placeholder="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />

          <label htmlFor="recievedOscar">
            Recieved Oscar
            <input
              id="recievedOScar"
              type="checkbox"
              checked={oscar}
              onChange={(e) => setOscar(e.target.checked)}
            />
          </label>
          <button onClick={submitMovieData}>Submit</button>
        </form>
      </div>
      <div>
        {movieList.map((movie) => (
          <div key={movie.id}>
            <h1>{movie.title}</h1>
            <h2>{`Release Year : ${movie.releaseDate}`}</h2>
            <h2>{`Recieved oscar : ${movie.recievedOscar}`}</h2>
            <button onClick={() => deleteMovie(movie.id)}>Delete Movie</button>
            <input
              placeholder="new Title..."
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button onClick={() => updateMovieTitle(movie.id)}>
              Update Title
            </button>
          </div>
        ))}
      </div>
      <div>
        <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} />
        <button onClick={fileUpload}>Upload File</button>
      </div>
    </div>
  );
}

export default App;
