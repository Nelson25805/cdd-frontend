import { useState } from 'react';
import '../App.css';
import { useUser } from '../Context/useUser';
import TopLinks from '../Context/TopLinks';
import { addGameToDatabase } from '../Api';
import { useNavigate } from 'react-router-dom';

const AddGameToDatabase = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    'Game Info': {
      platform: '',
      title: '',
    },
    'Cover Image': { image: null, imageName: 'No file chosen' }
  });

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
    const { platform, title } = formData['Game Info'];

    if (!platform || !title) {
      setErrorMessage('Please fill in all required fields: Platform and Title');
      return;
    }

    setErrorMessage(null);

    const formDataObj = new FormData();
    formDataObj.append('Name', title);
    formDataObj.append('Console', platform);
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
          <p className="game-information-titles">Platform</p>
          <select
            name="platform"
            value={formData['Game Info'].platform}
            onChange={(e) => handleInputChange(e, 'Game Info')}
            className='dropdown-box'
          >
            <option value="">Select Platform...</option>
            <option value="Xbox">Xbox</option>
            <option value="Xbox 360">Xbox 360</option>
            <option value="Xbox One">Xbox One</option>
            <option value="Nes">NES</option>
            <option value="Gameboy">Gameboy</option>
            <option value="Gameboy Color">Gameboy Color</option>
            <option value="Snes">SNES</option>
            <option value="Nintendo 64">Nintendo 64</option>
            <option value="Gamecube">Gamecube</option>
            <option value="Gameboy Advance">Gameboy Advance</option>
            <option value="Wii">Wii</option>
            <option value="Wii U">Wii U</option>
            <option value="Nintendo Switch">Nintendo Switch</option>
            <option value="Playstation 1">Playstation 1</option>
            <option value="Playstation 2">Playstation 2</option>
            <option value="Playstation 3">Playstation 3</option>
            <option value="Playstation 4">Playstation 4</option>
          </select>
        </div>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default AddGameToDatabase;
