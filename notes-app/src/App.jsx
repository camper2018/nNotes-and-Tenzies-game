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
  const [tempNoteText, setTempNoteText] = useState('');
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
   
  useEffect(()=> {
    if(currentNote){
      setTempNoteText(currentNote.body);
    }
  }, [currentNote]);

    /**
     * Challenge:
     * 1. Set up a new state variable called `tempNoteText`. Initialize 
     *    it as an empty string
     * 2. Change the Editor so that it uses `tempNoteText` and 
     *    `setTempNoteText` for displaying and changing the text instead
     *    of dealing directly with the `currentNote` data.
     * 3. Create a useEffect that, if there's a `currentNote`, sets
     *    the `tempNoteText` to `currentNote.body`. (This copies the
     *    current note's text into the `tempNoteText` field so whenever 
     *    the user changes the currentNote, the editor can display the 
     *    correct text.
     * 4. Implement debouncing logic
   */
   /*
    *
    *  Implement debouncing logic
     * Create an effect that runs any time the tempNoteText changes
     * Delay the sending of the request to Firebase
     *  uses setTimeout
     * use clearTimeout to cancel the timeout
     */

    useEffect(()=> {
       const timeoutId = setTimeout(()=> {
        if (tempNoteText !== currentNote.body) {
            updateNote(tempNoteText);
        }
       }, 500)
       return () => clearTimeout(timeoutId);
    },[tempNoteText])
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
                tempNoteText={tempNoteText}
                setTempNoteText={setTempNoteText}
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
