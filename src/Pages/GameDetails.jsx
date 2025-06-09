// src/Pages/GameDetails.jsx
import { useState, useEffect } from 'react';
import '../App.css';
import { useUser } from '../Context/useUser';
import StarRating from '../Context/StarRating';
import TopLinks from '../Context/TopLinks';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchGameInfo, addGameDetails } from '../Api';

const GameDetails = () => {
    const location = useLocation();
    const gameId = new URLSearchParams(location.search).get('q');
    const { user } = useUser();
    const userId = user?.userid;
    const navigate = useNavigate();

    // Local UI state
    const [error, setError] = useState('');
    const [gameDetails, setGameDetails] = useState({ title: '...', coverart: null });
    const [availableConsoles, setAvailableConsoles] = useState([]);
    const [selectedConsoles, setSelectedConsoles] = useState([]);
    const [displayedCoverImage, setDisplayedCoverImage] = useState(null);

    // Form sections
    const sections = ['Game Info', 'Game Status', 'Game Log'];
    const [selectedSection, setSelectedSection] = useState(sections[0]);

    // Nested form data
    const [formData, setFormData] = useState({
        'Game Info': { consoleIds: [], ownership: '', included: '' },
        'Game Status': { checkboxes: [], notes: '', pricePaid: '' },
        'Game Log': { gameCompletion: '', rating: 0, review: '', spoilerWarning: false },
    });

    // Load base info + console list
    useEffect(() => {
        if (!gameId) return;
        (async () => {
            const result = await fetchGameInfo(gameId);
            if (result.success) {
                const { title, coverart, consoles } = result.gameDetails;
                setGameDetails({ title, coverart });
                setAvailableConsoles(consoles);
                setDisplayedCoverImage(
                    coverart ? `data:image/png;base64,${coverart}` : null
                );
            } else {
                alert(result.message);
            }
        })();
    }, [gameId]);

    // Section tab click
    const handleSectionClick = sec => {
        setError('');
        setSelectedSection(sec);
    };

    // Generic input change
    const handleInputChange = (e, section = selectedSection) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const sec = { ...prev[section] };
            if (type === 'checkbox' && section === 'Game Status') {
                sec.checkboxes = checked
                    ? [...sec.checkboxes, name]
                    : sec.checkboxes.filter(x => x !== name);
            } else {
                sec[name] = type === 'checkbox' ? checked : value;
            }
            return { ...prev, [section]: sec };
        });
    };

    // Dual-list add/remove
    const addConsole = c => {
        setSelectedConsoles(sc =>
            [...sc, c].sort((a, b) => a.name.localeCompare(b.name))
        );
        setAvailableConsoles(ac =>
            ac.filter(x => x.consoleid !== c.consoleid)
        );
        setFormData(fd => ({
            ...fd,
            'Game Info': {
                ...fd['Game Info'],
                consoleIds: [...fd['Game Info'].consoleIds, c.consoleid],
            },
        }));
    };
    const removeConsole = c => {
        setAvailableConsoles(ac =>
            [...ac, c].sort((a, b) => a.name.localeCompare(b.name))
        );
        setSelectedConsoles(sc =>
            sc.filter(x => x.consoleid !== c.consoleid)
        );
        setFormData(fd => ({
            ...fd,
            'Game Info': {
                ...fd['Game Info'],
                consoleIds: fd['Game Info'].consoleIds.filter(id => id !== c.consoleid),
            },
        }));
    };

    // Submit handler
    const handleAddGameDetails = async () => {
        setError('');
        const { consoleIds, ownership, included } = formData['Game Info'];

        if (consoleIds.length === 0) {
            setError('Please select at least one platform.');
            setSelectedSection('Game Info');
            return;
        }
        if (!ownership) {
            setError('Please choose Physical or Digital ownership.');
            setSelectedSection('Game Info');
            return;
        }
        if (!included) {
            setError('Please choose what’s included.');
            setSelectedSection('Game Info');
            return;
        }

        const details = {
            ownership,
            included,
            checkboxes: formData['Game Status'].checkboxes,
            notes: formData['Game Status'].notes,
            completion: formData['Game Log'].gameCompletion,
            review: formData['Game Log'].review,
            spoiler: formData['Game Log'].spoilerWarning,
            price: parseFloat(formData['Game Status'].pricePaid) || null,
            rating: formData['Game Log'].rating,
            consoleIds,
        };

        const result = await addGameDetails(userId, gameId, details);
        if (result.success) {
            alert(result.message);
            navigate('/mycollection');
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="App">
            <TopLinks user={user} />

            {/* Section Tabs */}
            <div className="section-selector">
                {sections.map(sec => (
                    <div
                        key={sec}
                        className={`section-option ${selectedSection === sec && 'active'}`}
                        onClick={() => handleSectionClick(sec)}
                    >
                        {sec}
                    </div>
                ))}
            </div>

            <div className="game-information">
                {/* Left Column */}
                <div className="left-section">
                    <p className="game-information-titles">Title</p>
                    <input value={gameDetails.title} disabled />

                    <p className="game-information-titles">Cover Art</p>
                    <div className="display-image">
                        {displayedCoverImage ? <img src={displayedCoverImage} alt="" /> : 'No image selected'}
                    </div>

                    <button onClick={handleAddGameDetails} className="add-game-button">
                        Add Game To Collection With Details
                    </button>
                </div>

                {/* Right Column: Game Info */}
                {selectedSection === 'Game Info' && (
                    <div className="right-section">
                        {error && <p className="error-text">{error}</p>}

                        {/* Platform Dual List */}
                        <p className="game-information-titles">Platform(s)</p>
                        <div className="dual-list-container">
                            <div className="list available">
                                <h4>Available</h4>
                                <div className="list-body">
                                    {availableConsoles.map(c => (
                                        <div key={c.consoleid} onClick={() => addConsole(c)}>
                                            {c.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="list selected">
                                <h4>Selected</h4>
                                <div className="list-body">
                                    {selectedConsoles.map(c => (
                                        <div key={c.consoleid}>
                                            <span>{c.name}</span>
                                            <button onClick={() => removeConsole(c)}>×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Ownership Radios */}
                        <p className="game-information-titles">Ownership</p>
                        <div className="ownership-radio-buttons">
                            <input
                                type="radio"
                                id="physical"
                                name="ownership"
                                value="physical"
                                checked={formData['Game Info'].ownership === 'physical'}
                                onChange={e => handleInputChange(e, 'Game Info')}
                            />
                            <label htmlFor="physical">Physical</label>
                        </div>
                        <div className="ownership-radio-buttons">
                            <input
                                type="radio"
                                id="digital"
                                name="ownership"
                                value="digital"
                                checked={formData['Game Info'].ownership === 'digital'}
                                onChange={e => handleInputChange(e, 'Game Info')}
                            />
                            <label htmlFor="digital">Digital</label>
                        </div>

                        {/* Included Dropdown */}
                        <p className="game-information-titles">What’s Included</p>
                        <select
                            name="included"
                            value={formData['Game Info'].included}
                            onChange={e => handleInputChange(e, 'Game Info')}
                            className="dropdown-box"
                        >
                            <option value="">Select…</option>
                            <option>Game Only</option>
                            <option>Box Only</option>
                            <option>Manual Only</option>
                            <option>Box and Manual</option>
                            <option>Box and Game</option>
                            <option>Manual and Game</option>
                            <option>Complete In Box</option>
                            <option>Sealed</option>
                            <option>Graded</option>
                        </select>
                    </div>
                )}

                {/* Right Column: Game Status */}
                {selectedSection === 'Game Status' && (
                    <div className="right-section">
                        <div className="textbox-input">
                            <p className="game-information-titles">Price you paid</p>
                            <input
                                type="text"
                                name="pricePaid"
                                placeholder="Enter the price"
                                value={formData['Game Status'].pricePaid}
                                onChange={e => handleInputChange(e, 'Game Status')}
                            />
                        </div>
                        <fieldset className="condition-fieldset">
                            <legend>Condition of Game</legend>
                            <div className="condition-checkbox-group">
                                {[
                                    'No Blemishes',
                                    'Writing',
                                    'Stickers',
                                    'Torn Label',
                                    'Scratches',
                                    'Not Working',
                                    'Normal Wear',
                                ].map(text => (
                                    <div className="condition-checkbox-group-item" key={text}>
                                        <input
                                            type="checkbox"
                                            id={`checkbox-${text}`}
                                            name={text}
                                            checked={formData['Game Status'].checkboxes.includes(text)}
                                            onChange={e => handleInputChange(e, 'Game Status')}
                                        />
                                        <label htmlFor={`checkbox-${text}`}>{text}</label>
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                        <div className='game-status-section'>
                            <p className="game-information-titles">Notes</p>
                            <textarea
                                name="notes"
                                rows="4"
                                placeholder="Enter your notes"
                                value={formData['Game Status'].notes}
                                onChange={e => handleInputChange(e, 'Game Status')}
                            />
                        </div>
                    </div>
                )}

                {/* Right Column: Game Log */}
                {selectedSection === 'Game Log' && (
                    <div className="right-section">
                        <p className="game-information-titles">Game Completion</p>
                        <select
                            name="gameCompletion"
                            value={formData['Game Log'].gameCompletion}
                            onChange={e => handleInputChange(e, 'Game Log')}
                            className="dropdown-box"
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
                            <StarRating
                                rating={formData['Game Log'].rating}
                                onChange={val =>
                                    handleInputChange({ target: { name: 'rating', value: val, type: 'rating' } }, 'Game Log')
                                }
                                starSize={50}
                            />
                        </div>
                        <p className="game-information-titles">Review</p>
                        <textarea
                            name="review"
                            rows="4"
                            placeholder="Write your review"
                            value={formData['Game Log'].review}
                            onChange={e => handleInputChange(e, 'Game Log')}
                        />
                        <div className="spoiler-container">
                            <input
                                type="checkbox"
                                id="spoilerCheckbox"
                                name="spoilerWarning"
                                checked={formData['Game Log'].spoilerWarning}
                                onChange={e => handleInputChange(e, 'Game Log')}
                                className="spoiler-checkbox"
                            />
                            <label htmlFor="spoilerCheckbox">
                                <span>Spoiler</span> <span>Warning</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameDetails;
