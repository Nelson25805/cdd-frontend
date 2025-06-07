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

  const [formData, setFormData] = useState({
    'Game Info': {
      title: '',
    },
    'Cover Image': { image: null, imageName: 'No file chosen' }
  });

  const [searchPlatform, setSearchPlatform] = useState('');
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const platformWrapperRef = useRef(null);

  // filter once ≥2 chars
  const matchingPlatforms =
    searchPlatform.length >= 2
      ? CONSOLE_OPTIONS.filter((p) =>
        p.toLowerCase().includes(searchPlatform.toLowerCase())
      )
      : [];

  // close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (platformWrapperRef.current && !platformWrapperRef.current.contains(e.target)) {
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
    if (!selectedPlatforms.includes(platform)) {
      setSelectedPlatforms((prev) => [...prev, platform]);
    }
    setSearchPlatform('');
    setShowPlatformDropdown(false);
  };

  const onRemovePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.filter((p) => p !== platform)
    );
  };



  const [selectedSection, setSelectedSection] = useState('Game Info');
  const [displayedCoverImage, setDisplayedCoverImage] = useState(null);
  const [, setSelectedCoverName] = useState('No file chosen');
  const [errorMessage, setErrorMessage] = useState(null);

  const sections = ['Game Info'];

  const handleSectionClick = (section) => {
    setSelectedSection(section);
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => {
      const updatedSection = { ...prevData['Game Info'] };
      if (type === 'radio') {
        updatedSection[name] = value === updatedSection[name] ? '' : value;
      } else if (type === 'checkbox') {
        updatedSection[name] = e.target.checked
          ? [...(updatedSection[name] || []), value]
          : (updatedSection[name] || []).filter((item) => item !== value);
      } else {
        updatedSection[name] = value;
      }
      return {
        ...prevData,
        'Game Info': updatedSection,
      };
    });
  };

  const handleCoverChange = (e) => {
    e.preventDefault();
    const newImage = e.target.files[0];
    if (newImage) {
      setFormData((prevData) => ({
        ...prevData,
        'Cover Image': {
          ...prevData['Cover Image'],
          image: newImage,
          imageName: newImage.name,
        },
      }));

      setDisplayedCoverImage(URL.createObjectURL(newImage));
      setSelectedCoverName(newImage.name);
    }
  };

  const handleAddGame = async () => {
    const title = formData['Game Info'].title;
    if (selectedPlatforms.length === 0 || !title) {
      setErrorMessage('Please fill in all required fields: at least one Platform and Title');
      return;
    }

    setErrorMessage(null);

    const formDataObj = new FormData();
    formDataObj.append('Name', title);
    // send as comma-separated; update your server when you're ready to accept arrays
    formDataObj.append('Console', selectedPlatforms.join(','));

    formDataObj.append('CoverArt', formData['Cover Image'].image);

    try {
      await addGameToDatabase(formDataObj, user.token);
      alert('Game added successfully!');
      navigate('/search');
    } catch (error) {
      if (error && error.error) {
        setErrorMessage(error.error);
      } else {
        setErrorMessage('Failed to add game to the database');
      }
    }
  };

  return (
    <div className="App">
      <TopLinks user={user} />
      <div className="section-selector">
        {sections.map((section) => (
          <div
            key={section}
            className={`section-option ${selectedSection === section && 'active'}`}
            onClick={() => handleSectionClick(section)}
          >
            {section}
          </div>
        ))}
      </div>
      <div className="game-information">
        <div className="left-section">
          <div className='textbox-input'>
            <p className="game-information-titles">Title</p>
            <input
              type="text"
              name="title"
              placeholder="Enter title..."
              value={formData['Game Info'].title}
              onChange={(e) => handleInputChange(e, 'Game Info')}
            />
          </div>
          <p className="game-information-titles">Cover Art</p>
          <div className='display-image'>
            {displayedCoverImage ? (
              <img
                src={displayedCoverImage}
                alt=""
              />
            ) : ('No image selected'
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleCoverChange} />
          <button
            onClick={handleAddGame}
            className='add-game-button'
          >
            Add Game
          </button>
        </div>
        <div className="right-section">
          <div ref={platformWrapperRef} className="platform-selector">
            <p className="game-information-titles">Platform(s)</p>

            {/* 1) Search input */}
            <input
              type="text"
              placeholder="Type ≥2 letters..."
              value={searchPlatform}
              onChange={onPlatformInputChange}
              onFocus={() => {
                if (searchPlatform.length >= 2) setShowPlatformDropdown(true);
              }}
              className="console-search-input"
            />

            {/* 2) Dropdown */}
            {showPlatformDropdown && matchingPlatforms.length > 0 && (
              <ul className="console-suggestions">
                {matchingPlatforms.map((p) => (
                  <li
                    key={p}
                    className="console-suggestion-item"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSelectPlatform(p)}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            )}

            {/* 3) Chips for selected items */}
            {selectedPlatforms.length > 0 && (
              <div className="platform-chips">
                {selectedPlatforms.map((p) => (
                  <span key={p} className="platform-chip">
                    {p}
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
            )}
          </div>

        </div>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default AddGameToDatabase;
