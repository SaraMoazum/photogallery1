import { useEffect, useRef, useState } from "react";
import {
  signInWithRedirect,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import "./App.css";

const API_URL = "https://l2qcc1mmlg.execute-api.ap-south-1.amazonaws.com";

function App() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInput = useRef(null);

  const getToken = async () => {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  };

  const loadPhotos = async () => {
    try {
      const token = await getToken();

      if (!token) return;

      const result = await fetch(`${API_URL}/photos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!result.ok) {
        throw new Error("Could not load photos.");
      }

      const data = await result.json();
      setPhotos(data);
    } catch (error) {
      console.error("Gallery error:", error);
      setMessage(error.message);
    }
  };

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      const claims = session.tokens?.idToken?.payload;

      const name =
        claims?.name ||
        [claims?.given_name, claims?.family_name].filter(Boolean).join(" ") ||
        claims?.email ||
        "Signed In";

      const groups = claims?.["cognito:groups"] || [];

      setUser(currentUser);
      setDisplayName(name);
      setIsAdmin(Array.isArray(groups) && groups.includes("Admins"));

      await loadPhotos();
    } catch {
      setUser(null);
      setDisplayName("");
      setIsAdmin(false);
      setPhotos([]);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkUser();

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") {
        checkUser();
      }

      if (payload.event === "signedOut") {
        setUser(null);
        setDisplayName("");
        setIsAdmin(false);
        setPhotos([]);
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithRedirect({ provider: "Google" });
    } catch (error) {
      console.error("Sign-in error:", error);
      setMessage("Sign-in failed. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      event.target.value = "";
      return;
    }

    try {
      setLoading(true);
      setMessage("Uploading photo...");

      const token = await getToken();

      const urlResponse = await fetch(`${API_URL}/photos/upload-url`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });

      if (!urlResponse.ok) {
        throw new Error("Could not prepare photo upload.");
      }

      const { uploadUrl } = await urlResponse.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Photo could not be uploaded to storage.");
      }

      setMessage("Photo uploaded successfully!");
      await loadPhotos();
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(error.message);
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (key) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      const token = await getToken();

      const result = await fetch(
        `${API_URL}/photos/${encodeURIComponent(key)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!result.ok) {
        const errorData = await result.json().catch(() => ({}));
        throw new Error(errorData.message || "Photo could not be deleted.");
      }

      setMessage("Photo deleted successfully!");
      await loadPhotos();
    } catch (error) {
      console.error("Delete error:", error);
      setMessage(error.message);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <h2>PhotoGallery.</h2>

        <nav>
          <a href="#home">Home</a>
          <a href="#gallery">Gallery</a>
        </nav>

        {user ? (
          <div>
            <span>{displayName}</span>
            <button className="login-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={handleSignIn}>
            Sign In
          </button>
        )}
      </header>

      <main>
        <section className="hero" id="home">
          <p className="subtitle">YOUR PERSONAL PHOTO SPACE</p>
          <h1>Every picture tells a story.</h1>
          <p>
            Save your favorite memories and keep them all in one beautiful
            place.
          </p>

          {user && (
            <>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                hidden
              />
              <button
                className="upload-btn"
                onClick={() => fileInput.current?.click()}
                disabled={loading}
              >
                {loading ? "Uploading..." : "+ Upload a Photo"}
              </button>
            </>
          )}

          {!user && <p>Sign in to upload and view gallery photos.</p>}
          {message && <p role="status">{message}</p>}
        </section>

        <section className="gallery-section" id="gallery">
          <h2>Explore the Gallery</h2>
          <p>Your favorite moments, all together.</p>

          <div className="photo-grid">
            {photos.map((photo) => (
              <div className="photo-card" key={photo.key}>
                <img src={photo.url} alt={photo.key} />
                <div className="photo-info">
                  <span>Shared Gallery</span>
                  <h3>{photo.key.split("-").slice(1).join("-")}</h3>

                  {isAdmin && (
                    <button onClick={() => handleDelete(photo.key)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {user && photos.length === 0 && (
            <p>No photos uploaded yet. Upload your first photo!</p>
          )}
        </section>
      </main>

      <footer>
        <p>PhotoGallery. — Keep your memories close.</p>
      </footer>
    </div>
  );
}

export default App;
