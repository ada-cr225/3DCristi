import { useState, useEffect, useRef } from 'react'
import { db } from './db'
import './App.css'

// 1. IMPORT THE OFFICIAL ENGINE AND CSS
import 'pannellum' 
import 'pannellum/src/css/pannellum.css'

const ICONS = {
  import: '/import.svg',
  sort: '/threeLines.svg',
  cloud: '/cloud.svg',
  close: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'/%3E%3C/svg%3E"
}

// --- SPECIAL DEMO CARD DATA ---
const DEMO_TOUR = {
  id: 'demo-external',
  name: 'IMKAN Dashboard',
  previewUrl: 'https://placehold.co/400x400/222222/FFFFFF/png?text=IMKAN+Demo', 
  isExternal: true, 
  externalLink: 'http://dashboard.imkan.ae:8081/webroot/tours/sha/test2/'
}

function App() {
  const [tours, setTours] = useState([])
  const [activeTour, setActiveTour] = useState(null)
  const fileInputRef = useRef(null)
  const viewerRef = useRef(null)

  // --- DATABASE LOGIC ---
  const loadTours = async () => {
    const allTours = await db.tours.orderBy('id').reverse().toArray()
    const toursWithUrls = allTours.map(tour => ({
      ...tour,
      previewUrl: URL.createObjectURL(tour.fileData),
      isExternal: false
    }))
    
    // Combine them: Put the Demo Tour FIRST
    setTours([DEMO_TOUR, ...toursWithUrls])
  }

  useEffect(() => {
    loadTours()
  }, [])

  const handleGridClick = () => fileInputRef.current.click()

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    await db.tours.add({
      name: file.name,
      date: new Date(),
      fileData: file 
    })
    loadTours()
  }

  // --- VIEWER LOGIC (Only for internal 360 images now) ---
  useEffect(() => {
    if (activeTour) {
      viewerRef.current = window.pannellum.viewer('panorama', {
        type: 'equirectangular',
        panorama: activeTour.previewUrl,
        autoLoad: true,
        autoRotate: -2,
        compass: false,
        showZoomCtrl: false,
        showFullscreenCtrl: false,
        pitch: 10,
        yaw: 180,
        hfov: 110
      });
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    }
  }, [activeTour])

  // --- RENDER ---
  
  // VIEW MODE: 360 PLAYER (Internal only)
  if (activeTour) {
    return (
      <div className="viewer-container">
        <div className="viewer-header">
           <button className="close-btn" onClick={() => setActiveTour(null)}>
             <img src={ICONS.close} alt="Close" />
           </button>
        </div>
        <div id="panorama" style={{ width: '100%', height: '100vh' }}></div>
      </div>
    )
  }

  // VIEW MODE: GRID
  return (
    <>
      <header className="header">
        <div className="logo-area">
          <span className="logo-text">
            3DCristi <span style={{ color: 'rgb(73, 161, 220)' }}>APP</span>
          </span>
        </div>
        <div className="icons">
          <img className="icon" src={ICONS.import} alt="Import" />
          <img className="icon" src={ICONS.sort} alt="Sort" />
          <img className="icon" src={ICONS.cloud} alt="Cloud" />
        </div>
      </header>

      <div className="container">
        <div className="grid-layout">
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

          {tours.map((tour) => (
            <div 
              key={tour.id} 
              className="card tour-card"
              onClick={() => {
                // THE NEW LOGIC:
                if (tour.isExternal) {
                  // If it's the dashboard, go there directly
                  window.location.href = tour.externalLink;
                } else {
                  // If it's a 360 image, open the internal viewer
                  setActiveTour(tour);
                }
              }}
            >
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