import { useState, useEffect, useRef } from 'react'
import { db } from './db'
import './App.css'

function App() {
  const [tours, setTours] = useState([])
  // A "Ref" allows us to click the hidden HTML input via code
  const fileInputRef = useRef(null)

  // 1. Load tours from DB on startup
  const loadTours = async () => {
    // Fetch all items, reverse to show newest first
    const allTours = await db.tours.orderBy('id').reverse().toArray()
    
    // Create temporary URLs for previewing images
    // (Browsers can't display raw 'Blob' data directly in <img> tags)
    const toursWithUrls = allTours.map(tour => ({
      ...tour,
      previewUrl: URL.createObjectURL(tour.fileData)
    }))
    
    setTours(toursWithUrls)
  }

  // src/App.jsx (Add this near the top)

  const ICONS = {
    import: '/import.svg',      // Replaces the old 'install' icon
    sort: '/threeLines.svg',    // Replaces the old 'sort' icon
    cloud: '/cloud.svg'
  }

  useEffect(() => {
    loadTours()
  }, [])

  // 2. Handle the "Add New" click
  const handleGridClick = () => {
    // Trigger the hidden file picker
    fileInputRef.current.click()
  }

  // 3. Handle the File Selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Save to Database
    await db.tours.add({
      name: file.name,
      date: new Date(),
      fileData: file // Saving the raw binary file
    })

    // Reload the grid
    loadTours()
  }

// inside App() function...

  return (
    <>
      {/* 1. THE NEW HEADER */}
      <header className="header">
        <div className="logo-area">
          <span className="logo-text">
            3DCristi <span style={{ color: 'rgb(73, 161, 220)' }}>APP</span>
          </span>
        </div>
        
        <div className="icons">
          <img className="icon" src={ICONS.import} alt="Install" title="Install App" />
          <img className="icon" src={ICONS.sort} alt="Sort" title="Sort Tours" />
          <img className="icon" src={ICONS.cloud} alt="Cloud" title="Connect" />
        </div>
      </header>

      {/* 2. THE MAIN CONTAINER */}
      <div className="container">
        {/* Removed the old <header> block inside here to save space */}
        
        <div className="grid-layout">
          {/* ... Add New Card ... */}
          <div className="card add-card" onClick={handleGridClick}>
            <div className="plus-icon">+</div>
            <p>Create New Tour</p>
          </div>

          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />

          {/* ... Existing Tours ... */}
          {tours.map((tour) => (
            <div key={tour.id} className="card tour-card">
              <div className="image-wrapper">
                <img src={tour.previewUrl} alt={tour.name} />
              </div>
              <div className="card-footer">
                <span className="tour-name">{tour.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default App