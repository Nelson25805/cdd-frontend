import { useState, useEffect, useRef } from 'react';
import '../App.css';
import { useUser } from '../Context/useUser';
import TopLinks from '../Context/TopLinks';
import { addGameToDatabase } from '../Api';
import { useNavigate } from 'react-router-dom';
import { CONSOLE_OPTIONS } from '../Context/consoleOptions';

const AddGameToDatabase = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // We only need title in formData now
  const [title, setTitle] = useState('');

  // Cover upload state
  const [coverFile, setCoverFile] = useState(null);
  const [displayedCoverImage, setDisplayedCoverImage] = useState(null);

  // Multi-select console state
  const [searchPlatform, setSearchPlatform] = useState('');
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]); // array of {consoleid, name}
  const platformWrapperRef = useRef(null);

  // Suggestion logic
  const matchingPlatforms =
    searchPlatform.length >= 2
      ? CONSOLE_OPTIONS.filter((p) => {
        const optionName = typeof p === 'string' ? p : p.name;
        return optionName
          .toLowerCase()
          .includes(searchPlatform.toLowerCase());
      })
      : [];

  // Click-outside hides dropdown
  useEffect(() => {
    const onClick = (e) => {
      if (
        platformWrapperRef.current &&
        !platformWrapperRef.current.contains(e.target)
      ) {
        setShowPlatformDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const onPlatformInputChange = (e) => {
    setSearchPlatform(e.target.value);
    setShowPlatformDropdown(e.target.value.length >= 2);
  };

  const onSelectPlatform = (platform) => {
    if (!selectedPlatforms.find((p) => p.consoleid === platform.consoleid)) {
      setSelectedPlatforms((prev) =>
        [...prev, platform].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    }
    setSearchPlatform('');
    setShowPlatformDropdown(false);
  };

  const onRemovePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.filter((p) => p.consoleid !== platform.consoleid)
    );
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setCoverFile(file);
    if (file) {
      setDisplayedCoverImage(URL.createObjectURL(file));
    }
  };

  const [errorMessage, setErrorMessage] = useState(null);

  const handleAddGame = async () => {
    if (!title.trim() || selectedPlatforms.length === 0 || !coverFile) {
      setErrorMessage(
        'Please provide Title, Cover Art, and at least one Platform'
      );
      return;
    }
    setErrorMessage(null);

    // Build form-data
    const fd = new FormData();
    fd.append('Name', title.trim());
    // Pass consoles as JSON string
    fd.append(
      'Consoles',
      JSON.stringify(selectedPlatforms.map((p) => p.consoleid))
    );
    fd.append('CoverArt', coverFile);

    try {
      await addGameToDatabase(fd, user.token);
      alert('Game added successfully!');
      navigate('/search');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add game');
    }
  };

  return (
    <div className="App">
      <TopLinks user={user} />

      <div className="game-information">
        <div className="left-section">
          <p className="game-information-titles">Title</p>
          <input
            type="text"
            placeholder="Enter title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <p className="game-information-titles">Cover Art</p>
          <div className="display-image">
            {displayedCoverImage ? (
              <img src={displayedCoverImage} alt="cover preview" />
            ) : (
              'No image selected'
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleCoverChange} />

          <button onClick={handleAddGame} className="add-game-button">
            Add Game
          </button>
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
        </div>

        <div className="right-section">
          <p className="game-information-titles">Platform(s)</p>
          <div className="platform-selector">
            <div ref={platformWrapperRef} className="platform-input-wrapper">
              <input
                type="text"
                placeholder="Type ≥2 letters..."
                value={searchPlatform}
                onChange={onPlatformInputChange}
                onFocus={() =>
                  searchPlatform.length >= 2 && setShowPlatformDropdown(true)
                }
                className="console-search-input"
              />
              {showPlatformDropdown && matchingPlatforms.length > 0 && (
                <ul className="console-suggestions">
                  {matchingPlatforms.map((p) => {
                    const optionName = typeof p === 'string' ? p : p.name;
                    return (
                      <li
                        key={optionName}
                        className="console-suggestion-item"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => onSelectPlatform(p)}
                      >
                        {optionName}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {selectedPlatforms.map((p) => (
              <span key={p.consoleid} className="platform-chip">
                {p.name}
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => onRemovePlatform(p)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGameToDatabase;
