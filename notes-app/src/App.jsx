import { useState, useEffect } from 'react'
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { nanoid } from "nanoid"
import { onSnapshot, addDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import {notesCollection, db }from '../firebase.js';
function App() {
  // lazy state initialization by fetching state from local storage inside the function and passing that function as a useState value
  // It prevents fetching data from local storage on every component render
  // Rather, function will only be called when the state (notes) changes. 
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem("notes"))|| []);
  const [currentNoteId, setCurrentNoteId] = useState("");
  const currentNote = notes.find(note => note.id === currentNoteId) || notes[0];
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt );
  useEffect(()=> {
     // onSnapshot is an event listener provided by firebase that listens for any changes in the data in our database collection.
    const unsubscribe = onSnapshot(notesCollection, (snapshot)=> {
        // Sync up pur local notes array with the snapshot data
        // by setting up this onSnapshot listener we are creating a web socket connection with our database
        // so must give react  a way to unsubscribe from this listener whenever the component unmounts to avoid memory leak
        const notesArr = snapshot.docs.map(doc =>({
          ...doc.data(),
          id: doc.id,
         }))
        setNotes(notesArr);
     })
     return unsubscribe;
  },[])
  
  useEffect(() => {
    if (!currentNoteId) {
        setCurrentNoteId(notes[0]?.id)
    }
}, [notes])
  async function createNewNote() {
    const newNote = {
      body: "# Type your markdown note's title here",
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    const newNoteRef = await addDoc(notesCollection, newNote)
    setCurrentNoteId(newNoteRef.id)
  }

  
  // Put the most recently-modified note at the top
  async function updateNote(text) {
    const docRef = doc(db, "notes", currentNoteId)
    await setDoc(docRef, {body: text, updatedAt: Date.now()}, {merge: true} )
  }

  async function deleteNote(noteId){
    const docRef = doc(db, "notes", noteId);
    await deleteDoc(docRef);
  }

  return (
    <main>
      {
        notes.length > 0
          ?
          <Split
            sizes={[30, 70]}
            direction="horizontal"
            className="split"
          >
            <Sidebar
              notes={sortedNotes}
              currentNote={currentNote}
              setCurrentNoteId={setCurrentNoteId}
              newNote={createNewNote}
              deleteNote={deleteNote}
            />
              <Editor
                currentNote={currentNote}
                updateNote={updateNote}
              />
            
          </Split>
          :
          <div className="no-notes">
            <h1>You have no notes</h1>
            <button
              className="first-note"
              onClick={createNewNote}
            >
              Create one now
            </button>
          </div>

      }
    </main>
  )
}
export default App
