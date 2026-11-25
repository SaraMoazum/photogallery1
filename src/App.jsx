import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'


const photos = [
  {
    id: 1,
    title: "Mountain Escape",
    category: "Nature",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600",
  },
  {
    id: 2,
    title: "Ocean Views",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
  },
  {
    id: 3,
    title: "City Lights",
    category: "City",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600",
  },
];

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <h2>PhotoGallery.</h2>
        <nav>
          <a href="#home">Home</a>
          <a href="#gallery">Gallery</a>
        </nav>
        <button className="login-btn">Sign In</button>
      </header>

      <main>
        <section className="hero" id="home">
          <p className="subtitle">YOUR PERSONAL PHOTO SPACE</p>
          <h1>Every picture tells a story.</h1>
          <p>
            Save your favorite memories and keep them
            all in one beautiful place.
          </p>
          <button className="upload-btn">
            + Upload a Photo
          </button>
        </section>

        <section className="gallery-section" id="gallery">
          <h2>Explore the Gallery</h2>
          <p>Your favorite moments, all together.</p>

          <div className="photo-grid">
            {photos.map((photo) => (
              <div className="photo-card" key={photo.id}>
                <img src={photo.image} alt={photo.title} />
                <div className="photo-info">
                  <span>{photo.category}</span>
                  <h3>{photo.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>PhotoGallery. — Keep your memories close.</p>
      </footer>
    </div>
  );
}

export default App;
