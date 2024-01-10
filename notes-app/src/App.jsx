import { useState, useEffect } from 'react'
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { nanoid } from "nanoid"


function App() {
  // lazy state initialization by fetching state from local storage inside the function and passing that function as a useState value
  // It prevents fetching data from local storage on every component render
  // Rather, function will only be called when the state (notes) changes. 
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem("notes"))|| []);
  const [currentNoteId, setCurrentNoteId] = useState(
    notes[0]?.id || ""
  )
  const currentNote = notes.find(note => note.id === currentNoteId) || notes[0];
  useEffect(()=> {
     localStorage.setItem("notes", JSON.stringify(notes))
  },[notes])

  function createNewNote() {
    const newNote = {
      id: nanoid(),
      body: "# Type your markdown note's title here"
    }
    
    setNotes(prevNotes => [newNote, ...prevNotes])
    setCurrentNoteId(newNote.id)
  }

  
  // Put the most recently-modified note at the top
  function updateNote(text) {
    const updatedArray = [];
    notes.forEach(note => {
      if (note.id === currentNoteId ){
        updatedArray.unshift({...note, body: text})
      } else {
        updatedArray.push(note);
      }
    });
    setNotes(updatedArray);
  }

  function deleteNote(event, noteId){
    event.stopPropagation();
    setNotes(oldNotes => oldNotes.filter(note => note.id !== noteId))
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
              notes={notes}
              currentNote={currentNote}
              setCurrentNoteId={setCurrentNoteId}
              newNote={createNewNote}
              deleteNote={deleteNote}
            />
            {
              currentNoteId &&
              notes.length > 0 &&
              <Editor
                currentNote={currentNote}
                updateNote={updateNote}
              />
            }
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
