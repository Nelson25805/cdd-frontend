// Import necessary modules and components
import React, { useState, useEffect } from 'react';
import '../App.css';
import { useUser } from '../Context/UserContext';
import StarRating from '../Context/StarRating';
import TopLinks from '../Context/TopLinks';
import { useLocation } from 'react-router-dom';
import { fetchGameInfo, fetchGameDetails, editGameDetails } from '../Api';

// Main functional component for editing game details
/*This component is used to edit the game record that a user
has in their collection. */
const EditGameDetails = () => {
    // Hooks for managing state and retrieving user information
    const location = useLocation();
    const game = new URLSearchParams(location.search).get('q');
    const [, setIsLoading] = useState(true);

    const { user } = useUser();
    const userId = user?.userid;

    // State for storing game details and form data
    const [gameDetails, setGameDetails] = useState({
        title: "...",
        coverart: null,
        platform: "",
    });

    const [formData, setFormData] = useState({
        'Game Info': { platform: '', ownership: '', included: '' },
        'Game Status': { title: '', condition: '', checkboxes: [], notes: '', pricePaid: '' },
        'Cover Image': { image: null, imageName: 'No file chosen' },
        'Game Log': { notes: '', gameCompletion: '', rating: 0, review: '', spoilerWarning: false },
    });

    // State for managing the selected section in the form
    const [selectedSection, setSelectedSection] = useState('Game Info');

    // State for displaying the cover image
    const [displayedCoverImage, setDisplayedCoverImage] = useState(null);

    // Array of form sections
    const sections = ['Game Info', 'Game Status', 'Game Log'];

    // Effect to fetch game details and detailed information
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (game && user) {
                    const token = user.token; // Adjust this line to get the token from your user context or state

                    // Use the first fetchGameInfo function with token
                    const basicInfoResponse = await fetchGameInfo(game, token);

                    if (basicInfoResponse.success) {
                        const basicInfo = basicInfoResponse.gameDetails;

                        setGameDetails({
                            title: basicInfo.title, // Adjusted field names
                            coverArt: basicInfo.coverart, // Adjusted field names
                            platform: basicInfo.platform, // Adjusted field names
                        });

                        // Fetch detailed game information
                        const detailedInfoResponse = await fetchGameDetails(userId, game);

                        // Access gamedetails from the detailedInfo object
                        const { gamedetails } = detailedInfoResponse;

                        // Convert spoiler to a number and check
                        const spoilerNumber = Number(gamedetails.spoiler);
                        const spoilerValue = spoilerNumber === 1;

                        const { gameinfo } = detailedInfoResponse;

                        console.log('This is the gameinfo: ', gameinfo);

                        console.log('This is the gamedetails: ', gamedetails);

                        setFormData((prevData) => ({
                            'Game Info': {
                                ...prevData['Game Info'],
                                ownership: gamedetails.ownership,
                                included: gamedetails.included,
                            },
                            'Game Status': {
                                ...prevData['Game Status'],
                                checkboxes: gamedetails.condition,
                                notes: gamedetails.notes,
                                pricePaid: gamedetails.price,
                            },
                            'Cover Image': {
                                ...prevData['Cover Image'],
                            },
                            'Game Log': {
                                ...prevData['Game Log'],
                                gameCompletion: gamedetails.completion,
                                rating: gamedetails.rating,
                                review: gamedetails.review,
                                spoilerWarning: spoilerValue,
                            },
                        }));

                        if (basicInfo.coverart) {
                            setDisplayedCoverImage(`data:image/png;base64,${basicInfo.coverart}`);
                        }
                    } else {
                        console.error('Failed to fetch game details:', basicInfoResponse.message);
                    }
                }
            } catch (error) {
                console.error('Error fetching game details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [game, user, userId]);

    // Function to handle section click
    const handleSectionClick = (section) => {
        setSelectedSection(section);
    };

    // Function to handle form input change
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

    // Function to handle checkbox change
    const handleCheckBoxChange = (e) => {
        const { name, checked } = e.target;
        console.log("Checkbox name:", name);
        console.log("Checkbox checked:", checked);

        setFormData((prevData) => {
            const currentCheckboxes = prevData['Game Status']?.checkboxes || [];
            console.log("Previous checkboxes:", currentCheckboxes);

            const updatedCheckboxes = checked
                ? [...currentCheckboxes, name]
                : currentCheckboxes.filter((item) => item !== name);

            console.log("Updated checkboxes:", updatedCheckboxes);

            return {
                ...prevData,
                'Game Status': {
                    ...prevData['Game Status'],
                    checkboxes: updatedCheckboxes,
                },
            };
        });
    };





    // Function to handle notes change
    const handleNotesChange = (e) => {
        const { value } = e.target;
        handleInputChange({ target: { name: 'notes', value, type: 'textarea' } });
    };

    // Function to handle game completion change
    const handleGameCompletionChange = (e) => {
        const { value } = e.target;
        handleInputChange({ target: { name: 'gameCompletion', value, type: 'dropdown' } });
    };

    // Function to handle rating change
    const handleRatingChange = (rating) => {
        handleInputChange({ target: { name: 'rating', value: rating, type: 'rating' } });
    };

    // Function to handle review change
    const handleReviewChange = (e) => {
        const { value } = e.target;
        handleInputChange({ target: { name: 'review', value, type: 'textarea' } });
    };

    // Function to handle spoiler change
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

    const handleEditGameDetails = async () => {
        const { ownership, included } = formData['Game Info'];
        const { checkboxes, notes, pricePaid } = formData['Game Status'];
        const { gameCompletion, rating, review, spoilerWarning } = formData['Game Log'];

        // Ensure pricePaid is handled correctly as a number or empty string
        const parsedPricePaid = pricePaid ? parseFloat(pricePaid.replace(/[^0-9.-]+/g, '')) : '';

        const details = {
            ownership,
            included,
            checkboxes,
            notes,
            pricePaid: parsedPricePaid,
            gameCompletion,
            rating: parseInt(rating) || '',
            review,
            spoilerWarning,
        };

        try {
            const response = await editGameDetails(userId, game, details);

            if (response && response.message === 'Game details updated successfully') {
                alert('Game details edited successfully!');
            } else {
                console.error('Failed to edit game details:', response.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error editing game details:', error.message || 'An unexpected error occurred');
            alert('Failed to edit game details. Please try again.');
        }
    };


    // Render UI components
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
                            value={gameDetails.title}
                            onChange={(e) => handleInputChange(e, 'Game Status')}
                            disabled
                        />
                    </div>
                    <p className="game-information-titles">Cover Art</p>
                    <div className='display-image'>
                        {displayedCoverImage ? (
                            <img src={displayedCoverImage} alt="" />
                        ) : ('No image selected')}
                    </div>

                    <button
                        onClick={handleEditGameDetails}
                        className='add-game-button'
                    >
                        Edit Game with details
                    </button>
                </div>

                {selectedSection === 'Game Info' && (
                    <div className="right-section">
                        <p className="game-information-titles">Platform</p>
                        <select
                            name="platform"
                            value={gameDetails.platform}
                            onChange={(e) => handleInputChange(e, 'Game Info')}
                            className='dropdown-box'
                            disabled
                        >
                            <option value="">Select Platform...</option>
                            <option value="Xbox">Xbox</option>
                            <option value="Xbox 360">Xbox 360</option>
                            <option value="Xbox One">Xbox One</option>
                            <option value="Nes">NES</option>
                            <option value="Snes">SNES</option>
                            <option value="Nintendo64">Nintendo 64</option>
                            <option value="Gamecube">Gamecube</option>
                            <option value="Wii">Wii</option>
                            <option value="Wii U">Wii U</option>
                            <option value="Nintendo Switch">Nintendo Switch</option>
                            <option value="Playstation 1">Playstation 1</option>
                            <option value="Playstation 2">Playstation 2</option>
                            <option value="Playstation 3">Playstation 3</option>
                            <option value="Playstation 4">Playstation 4</option>
                        </select>

                        <p className="game-information-titles">Ownership</p>
                        <div className='ownership-radio-buttons'>
                            <input
                                type="radio"
                                id="physical"
                                name="ownership"
                                value="physical"
                                checked={formData['Game Info'].ownership === 'physical'}
                                onChange={(e) => handleInputChange(e, 'Game Info')}
                            />
                            <label htmlFor="physical">Physical</label>
                        </div>
                        <div className='ownership-radio-buttons'>
                            <input
                                type="radio"
                                id="digital"
                                name="ownership"
                                value="digital"
                                checked={formData['Game Info'].ownership === 'digital'}
                                onChange={(e) => handleInputChange(e, 'Game Info')}
                            />
                            <label htmlFor="digital">Digital</label>
                        </div>

                        <p className="game-information-titles">What's Included</p>
                        <select
                            value={formData['Game Info'].included}
                            onChange={(e) => handleInputChange(e, 'Game Info')}
                            name="included"
                            className='dropdown-box'
                        >
                            <option value="">Select What's Included...</option>
                            <option value="Game Only">Game Only</option>
                            <option value="Box Only">Box Only</option>
                            <option value="Manual Only">Manual Only</option>
                            <option value="Box And Manual">Box and Manual</option>
                            <option value="Box And Game">Box and Game</option>
                            <option value="Manual And Game">Manual and Game</option>
                            <option value="Complete In Box">Complete In Box</option>
                            <option value="Sealed">Sealed</option>
                            <option value="Graded">Graded</option>
                        </select>
                    </div>
                )}

                {selectedSection === 'Game Status' && (
                    <div className="right-section">
                        <div className='textbox-input'>
                            <p className="game-information-titles">Price you paid</p>
                            <input
                                type="text"
                                name="pricePaid"
                                placeholder="Enter the price"
                                value={formData['Game Status'].pricePaid || ''}
                                onChange={(e) => handleInputChange(e, 'Game Status')}
                            />
                        </div>

                        <fieldset className='condition-fieldset'>
                            <legend>Condition of Game</legend>
                            <div className='condition-checkbox-group'>
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
                        <select
                            name="gameCompletion"
                            value={formData['Game Log'].gameCompletion}
                            onChange={handleGameCompletionChange}
                            className='dropdown-box'
                        >
                            <option value="">Select Completion Status...</option>
                            <option value="completed">100% Completed</option>
                            <option value="beaten">Beaten</option>
                            <option value="retired">Retired</option>
                            <option value="shelved">Shelved</option>
                            <option value="abandoned">Abandoned</option>
                            <option value="backloged">Backloged</option>
                        </select>

                        <div>
                            <p className="game-information-titles">Rating</p>
                            <StarRating rating={formData['Game Log'].rating} onChange={handleRatingChange} starSize={50} />
                        </div>

                        <p className="game-information-titles">Review</p>

                        <textarea
                            rows="4"
                            placeholder="Write your review"
                            value={formData['Game Log'].review}
                            onChange={handleReviewChange}
                        ></textarea>

                        <div className="spoiler-container">
                            <input
                                type="checkbox"
                                id="spoilerCheckbox"
                                name="spoilerWarning"
                                checked={formData['Game Log'].spoilerWarning}
                                value={gameDetails.spoilerWarning}
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
        </div>
    );
};

export default EditGameDetails;
