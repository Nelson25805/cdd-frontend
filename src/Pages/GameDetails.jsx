// Importing necessary dependencies from React and other modules
import { useState, useEffect } from 'react';
import '../App.css';
import { useUser } from '../Context/useUser';
import StarRating from '../Context/StarRating';
import TopLinks from '../Context/TopLinks';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchGameInfo, addGameDetails } from '../Api';

// Functional component for GameDetails
/*This component is used to  create a collection game record with
details related to the game of the users choosing.*/
const GameDetails = () => {
    // Initializing state variables using React hooks
    const location = useLocation();
    const game = new URLSearchParams(location.search).get('q');

    const { user } = useUser();
    const userId = user?.userid;
    const navigate = useNavigate();
    const [error, setError] = useState('');

    // State variables for game details and form data
    const [gameDetails, setGameDetails] = useState({
        title: "...",
        coverart: null,
        platform: "",
    });

    const [availableConsoles, setAvailableConsoles] = useState([]);     // { consoleid, name }[]
    const [selectedConsoles, setSelectedConsoles] = useState([]);       // same shape

    const [formData, setFormData] = useState({
        'Game Info': { platform: '', ownership: '', included: '' },
        'Game Status': { title: '', condition: '', checkboxes: [], notes: '', pricePaid: '' },
        'Cover Image': { image: null, imageName: 'No file chosen' },
        'Game Log': { notes: '', gameCompletion: '', rating: 0, review: '', spoilerWarning: false },
    });

    // State variables for handling the active section, displayed cover image, and available sections
    const [selectedSection, setSelectedSection] = useState('Game Info');
    const [displayedCoverImage, setDisplayedCoverImage] = useState(null);
    const sections = ['Game Info', 'Game Status', 'Game Log'];

    // Effect to fetch game details when the component mounts or the game ID changes
    useEffect(() => {
        if (game) {
            // Fetch game details based on the gameId
            getGameDetails(game);
        }
    }, [game]);


    const getGameDetails = async (gameId) => {
        const token = localStorage.getItem('token');
        const result = await fetchGameInfo(gameId, token);
        if (result.success) {
            const { gameDetails } = result;
            setGameDetails(gameDetails);

            // Populate the console options
            setAvailableConsoles(gameDetails.consoles);
            setSelectedConsoles([]);  // start with none selected

            // Now set the cover image if present
            if (gameDetails.coverart) {
                setDisplayedCoverImage(
                    `data:image/png;base64,${gameDetails.coverart}`
                );
            } else {
                setDisplayedCoverImage(null);
            }
        } else {
            alert(result.message);
        }
    };

    // Event handler for clicking on a section
    const handleSectionClick = (section) => {
        setSelectedSection(section);
    };

    // Event handler for handling input changes in the form
    const handleInputChange = (e, section = selectedSection) => {
        const { name, value, type } = e.target;
        setFormData((prevData) => {
            const updatedSection = { ...prevData[section] };
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
                [section]: updatedSection,
            };
        });
    };

    // Event handler for handling checkbox changes
    const handleCheckBoxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [selectedSection]: {
                ...prevData[selectedSection],
                checkboxes: checked
                    ? [...prevData[selectedSection].checkboxes, name]
                    : prevData[selectedSection].checkboxes.filter((item) => item !== name),
            },
        }));
    };

    // Event handler for handling notes changes
    const handleNotesChange = (e) => {
        const { value } = e.target;
        handleInputChange({ target: { name: 'notes', value, type: 'textarea' } });
    };

    // Event handler for handling game completion changes
    const handleGameCompletionChange = (e) => {
        const { value } = e.target;
        handleInputChange({ target: { name: 'gameCompletion', value, type: 'dropdown' } });
    };

    // Event handler for handling rating changes
    const handleRatingChange = (rating) => {
        handleInputChange({ target: { name: 'rating', value: rating, type: 'rating' } });
    };

    // Event handler for handling review changes
    const handleReviewChange = (e) => {
        const { value } = e.target;
        handleInputChange({ target: { name: 'review', value, type: 'textarea' } });
    };

    // Event handler for handling spoiler changes
    const handleSpoilerChange = (e) => {
        const { checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            'Game Log': {
                ...prevData['Game Log'],
                spoilerWarning: checked,
            },
        }));
    };

    // Event handler for adding game details to the collection
    // GameDetails.jsx

    const handleAddGameDetails = async () => {
        setError('');
     if (selectedConsoles.length === 0) {
       setError('Please select at least one platform before adding.');
       return;
     }
        // flatten the nested formData into exactly the API’s expected shape
        const details = {
            ownership: formData['Game Info'].ownership,
            included: formData['Game Info'].included,
            checkboxes: formData['Game Status'].checkboxes,
            notes: formData['Game Status'].notes,
            completion: formData['Game Log'].gameCompletion,
            review: formData['Game Log'].review,
            spoiler: formData['Game Log'].spoilerWarning,
            price: parseFloat(formData['Game Status'].pricePaid) || null,
            rating: formData['Game Log'].rating,
            consoleIds: selectedConsoles.map((c) => c.consoleid),
        };

        const result = await addGameDetails(userId, game, details);

        if (result.success) {
            alert(result.message);
            navigate('/mycollection');
        } else {
            alert(result.message);
        }
    };


    // Render UI components
    return (
        <div className="App">
            <TopLinks user={user} />
            <div className="section-selector">
                {/* Rendering section options */}
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
                        {/* Input for the game title */}
                        <input
                            type="text"
                            name="title"
                            placeholder="Enter title..."
                            value={gameDetails.title}
                            onChange={(e) => handleInputChange(e, 'Game Status')}
                            disabled
                        />
                    </div>
                    <p className="game-information-titles">Cover Art</p>
                    <div className='display-image'>
                        {/* Displaying the cover image */}
                        {displayedCoverImage ? (
                            <img src={displayedCoverImage} alt="" />
                        ) : ('No image selected')}
                    </div>

                    {/* Button to add game details */}
                    <button
                        onClick={handleAddGameDetails}
                        className='add-game-button'
                    >
                        Add Game To Collection With Details
                    </button>
                </div>

                {/* -------- Game Info Section -------- */}
                {selectedSection === 'Game Info' && (
                    <div className="right-section">
                        {error && <p className="error-text">{error}</p>}
                        <p className="game-information-titles">Platform(s)</p>

                        <div className="dual-list-container">
                            {/* Available List */}
                            <div className="list available">
                                <h4>Available</h4>
                                <div className="list-body">
                                    {availableConsoles
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .filter((c) => !selectedConsoles.some((s) => s.consoleid === c.consoleid))
                                        .map((c) => (
                                            <div
                                                key={c.consoleid}
                                                onClick={() => {
                                                    const next = [...selectedConsoles, c]
                                                        .sort((a, b) => a.name.localeCompare(b.name));
                                                    setSelectedConsoles(next);
                                                    setFormData(fd => ({
                                                        ...fd,
                                                        'Game Info': {
                                                            ...fd['Game Info'],
                                                            consoleIds: next.map((x) => x.consoleid),
                                                        },
                                                    }));
                                                }}
                                            >
                                                {c.name}
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Selected List */}
                            <div className="list selected">
                                <h4>Selected</h4>
                                <div className="list-body">
                                    {selectedConsoles
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map((c) => (
                                            <div
                                                key={c.consoleid}
                                            >
                                                <span>{c.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const next = selectedConsoles
                                                            .filter((x) => x.consoleid !== c.consoleid);
                                                        setSelectedConsoles(next);
                                                        setFormData(fd => ({
                                                            ...fd,
                                                            'Game Info': {
                                                                ...fd['Game Info'],
                                                                consoleIds: next.map((x) => x.consoleid),
                                                            },
                                                        }));
                                                    }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {selectedSection === 'Game Status' && (
                    <div className="right-section">
                        <div className='textbox-input'>
                            <p className="game-information-titles">Price you paid</p>
                            {/* Input for entering the price paid */}
                            <input
                                type="text"
                                name="pricePaid"
                                placeholder="Enter the price"
                                value={formData['Game Status'].pricePaid}
                                onChange={(e) => handleInputChange(e, 'Game Status')}
                            />
                        </div>

                        {/* Fieldset for selecting the condition of the game */}
                        <fieldset className='condition-fieldset'>
                            <legend>Condition of Game</legend>
                            <div className='condition-checkbox-group'>
                                {/* Checkbox options for different conditions */}
                                {["No Blemishes", "Writing", "Stickers", "Torn Label", "Scratches", "Not Working", "Normal Wear"].map((text) => (
                                    <div className='condition-checkbox-group-item' key={text}>
                                        <input
                                            type="checkbox"
                                            id={`checkbox-${text}`}
                                            name={text}
                                            value={text}
                                            checked={formData['Game Status'].checkboxes.includes(text)}
                                            onChange={handleCheckBoxChange}
                                        />
                                        <label htmlFor={`checkbox-${text}`}>
                                            {text}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </fieldset>

                        <div className='game-status-section'>
                            <p className="game-information-titles">Notes</p>
                            {/* Textarea for entering notes */}
                            <textarea
                                rows="4"
                                placeholder="Enter your notes"
                                value={formData['Game Status'].notes}
                                onChange={handleNotesChange}
                            ></textarea>
                        </div>
                    </div>
                )}

                {selectedSection === 'Game Log' && (
                    <div className="right-section">
                        <p className="game-information-titles">Game Completion</p>
                        {/* Dropdown for selecting game completion status */}
                        <select
                            name="gameCompletion"
                            value={formData['Game Log'].gameCompletion}
                            onChange={handleGameCompletionChange}
                            className='dropdown-box'
                        >
                            <option value="">Select Completion Status...</option>
                            {/* Options for completion status */}
                            <option value="completed">100% Completed</option>
                            <option value="beaten">Beaten</option>
                            <option value="retired">Retired</option>
                            <option value="shelved">Shelved</option>
                            <option value="abandoned">Abandoned</option>
                            <option value="backloged">Backloged</option>
                        </select>

                        <div>
                            <p className="game-information-titles">Rating</p>
                            {/* StarRating component for selecting and displaying ratings */}
                            <StarRating rating={formData['Game Log'].rating} onChange={handleRatingChange} starSize={50} />
                        </div>

                        <p className="game-information-titles">Review</p>
                        {/* Textarea for entering a review */}
                        <textarea
                            rows="4"
                            placeholder="Write your review"
                            value={formData['Game Log'].review}
                            onChange={handleReviewChange}
                        ></textarea>

                        <div className="spoiler-container">
                            {/* Checkbox for indicating spoilers */}
                            <input
                                type="checkbox"
                                id="spoilerCheckbox"
                                name="spoilerWarning"
                                checked={formData['Game Log'].spoilerWarning}
                                onChange={handleSpoilerChange}
                                className="spoiler-checkbox"
                            />
                            <label htmlFor="spoilerCheckbox">
                                <span>Spoiler</span>
                                <span>Warning</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default GameDetails;
