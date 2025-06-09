// EditGameDetails.jsx
import { useState, useEffect } from 'react';
import '../App.css';
import { useUser } from '../Context/useUser';
import StarRating from '../Context/StarRating';
import TopLinks from '../Context/TopLinks';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchGameInfo, fetchGameDetails, editGameDetails } from '../Api';

const EditGameDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const gameId = new URLSearchParams(location.search).get('q');
    const { user } = useUser();
    const userId = user?.userid;
    const [error, setError] = useState('')

    const sections = ['Game Info', 'Game Status', 'Game Log'];
    const [selectedSection, setSelectedSection] = useState(sections[0]);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        'Game Info': { ownership: '', included: '', consoleIds: [] },
        'Game Status': { checkboxes: [], notes: '', pricePaid: '' },
        'Game Log': { gameCompletion: '', rating: 0, review: '', spoilerWarning: false },
    });

    const [availableConsoles, setAvailableConsoles] = useState([]);
    const [selectedConsoles, setSelectedConsoles] = useState([]);
    const [displayedCoverImage, setDisplayedCoverImage] = useState(null);
    const [gameTitle, setGameTitle] = useState('...');

    useEffect(() => {
        const load = async () => {
            if (!gameId || !userId) return;
            try {
                const basic = await fetchGameInfo(gameId);
                let allConsoles = [];
                if (basic.success) {
                    const { title, coverart, consoles } = basic.gameDetails;
                    setGameTitle(title || '');
                    setDisplayedCoverImage(coverart ? `data:image/png;base64,${coverart}` : null);
                    allConsoles = consoles;
                }
                const detail = await fetchGameDetails(userId, gameId);
                const { gamedetails, gameinfo } = detail;
                setFormData({
                    'Game Info': {
                        ownership: gamedetails.ownership || '',
                        included: gamedetails.included || '',
                        consoleIds: gameinfo.consoles.map(c => c.consoleid) || []
                    },
                    'Game Status': {
                        checkboxes: Array.isArray(gamedetails.condition) ? gamedetails.condition : [],
                        notes: gamedetails.notes || '',
                        pricePaid: gamedetails.price != null ? gamedetails.price : ''
                    },
                    'Game Log': {
                        gameCompletion: gamedetails.completion || '',
                        rating: gamedetails.rating || 0,
                        review: gamedetails.review || '',
                        spoilerWarning: Boolean(gamedetails.spoiler),
                    },
                });
                const selIds = gameinfo.consoles.map(c => c.consoleid);
                setSelectedConsoles(allConsoles.filter(c => selIds.includes(c.consoleid)));
                setAvailableConsoles(allConsoles.filter(c => !selIds.includes(c.consoleid)));
            } catch (e) {
                console.error('Error loading edit details:', e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [gameId, userId]);

    const handleInputChange = (e, section = selectedSection) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const sec = { ...prev[section] };
            if (type === 'checkbox' && section === 'Game Status') {
                sec.checkboxes = checked ? [...sec.checkboxes, name] : sec.checkboxes.filter(x => x !== name);
            } else {
                sec[name] = type === 'checkbox' ? checked : value;
            }
            return { ...prev, [section]: sec };
        });
    };

    const addConsole = c => {
        setSelectedConsoles(sc => [...sc, c].sort((a, b) => a.name.localeCompare(b.name)));
        setAvailableConsoles(ac => ac.filter(x => x.consoleid !== c.consoleid));
        setFormData(fd => ({
            ...fd,
            'Game Info': { ...fd['Game Info'], consoleIds: [...fd['Game Info'].consoleIds, c.consoleid] }
        }));
    };

    const removeConsole = c => {
        setAvailableConsoles(ac => [...ac, c].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedConsoles(sc => sc.filter(x => x.consoleid !== c.consoleid));
        setFormData(fd => ({
            ...fd,
            'Game Info': { ...fd['Game Info'], consoleIds: fd['Game Info'].consoleIds.filter(id => id !== c.consoleid) }
        }));
    };

    const handleSave = async () => {
        // clear prior error
        setError('');

        // ** validation: must have ≥1 console selected **
        if (selectedConsoles.length === 0) {
            setError('Please select at least one platform before saving.');
            return;
        }
        const details = {
            ownership: formData['Game Info'].ownership,
            included: formData['Game Info'].included,
            checkboxes: formData['Game Status'].checkboxes,
            notes: formData['Game Status'].notes,
            gameCompletion: formData['Game Log'].gameCompletion,
            review: formData['Game Log'].review,
            spoilerWarning: formData['Game Log'].spoilerWarning,
            pricePaid: parseFloat(formData['Game Status'].pricePaid) || null,
            rating: formData['Game Log'].rating,
            consoleIds: formData['Game Info'].consoleIds,
        };
        try {
            const res = await editGameDetails(userId, gameId, details);
            if (res.message?.includes('successfully')) {
                alert('Updated!');
                navigate('/mycollection');
            } else alert('Save failed');
        } catch (e) {
            console.error('Error saving:', e);
            alert('Error saving');
        }
    };

    if (isLoading) return <div>Loading…</div>;

    return (
        <div className="App">
            <TopLinks user={user} />
            <div className="section-selector">
                {sections.map(sec => (
                    <div
                        key={sec}
                        className={`section-option ${selectedSection === sec && 'active'}`}
                        onClick={() => setSelectedSection(sec)}
                    >{sec}</div>
                ))}
            </div>
            <div className="game-information">
                <div className="left-section">
                    <div className="textbox-input">
                        <p className="game-information-titles">Title</p>
                        <input value={gameTitle || ''} disabled />
                    </div>
                    <p className="game-information-titles">Cover Art</p>
                    <div className="display-image">
                        {displayedCoverImage ? <img src={displayedCoverImage} alt="" /> : 'No image'}
                    </div>
                    <button onClick={handleSave} className="add-game-button">Save Changes</button>
                </div>

                {selectedSection === 'Game Info' && (
                    <div className="right-section">
                        <p className="game-information-titles">Platform(s)</p>
                        {error && <p className="error-text">{error}</p>}
                        <div className="dual-list-container">
                            <div className="list available">
                                <h4>Available</h4>
                                <div className="list-body">
                                    {availableConsoles
                                        .filter(c => !selectedConsoles.some(s => s.consoleid === c.consoleid))
                                        .map(c => <div key={c.consoleid} onClick={() => addConsole(c)}>{c.name}</div>)}
                                </div>
                            </div>
                            <div className="list selected">
                                <h4>Selected</h4>
                                <div className="list-body">
                                    {selectedConsoles.map(c => (
                                        <div key={c.consoleid}><span>{c.name}</span><button onClick={() => removeConsole(c)}>×</button></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="game-information-titles">Ownership</p>
                        <div className="ownership-radio-buttons">
                            <input type="radio" id="physical" name="ownership" value="physical" checked={formData['Game Info'].ownership === 'physical'} onChange={e => handleInputChange(e, 'Game Info')} /><label>Physical</label>
                        </div>
                        <div className="ownership-radio-buttons">
                            <input type="radio" id="digital" name="ownership" value="digital" checked={formData['Game Info'].ownership === 'digital'} onChange={e => handleInputChange(e, 'Game Info')} /><label>Digital</label>
                        </div>
                        <p className="game-information-titles">What’s Included</p>
                        <select name="included" value={formData['Game Info'].included} onChange={e => handleInputChange(e, 'Game Info')} className="dropdown-box">
                            <option value="">Select…</option><option>Game Only</option><option>Box Only</option><option>Manual Only</option><option>Box and Manual</option><option>Box and Game</option><option>Manual and Game</option><option>Complete In Box</option><option>Sealed</option><option>Graded</option>
                        </select>
                    </div>
                )}

                {selectedSection === 'Game Status' && (
                    <div className="right-section">
                        <div className="textbox-input">
                            <p className="game-information-titles">Price you paid</p>
                            <input type="text" name="pricePaid" value={formData['Game Status'].pricePaid ?? ''} onChange={e => handleInputChange(e, 'Game Status')} />
                        </div>
                        <fieldset className="condition-fieldset"><legend>Condition of Game</legend><div className="condition-checkbox-group">
                            {['No Blemishes', 'Writing', 'Stickers', 'Torn Label', 'Scratches', 'Not Working', 'Normal Wear'].map(text => (
                                <div className="condition-checkbox-group-item" key={text}><input type="checkbox" name={text} checked={formData['Game Status'].checkboxes.includes(text)} onChange={e => handleInputChange(e, 'Game Status')} /><label>{text}</label></div>
                            ))}
                        </div></fieldset>
                        <div className="game-status-section"><p className="game-information-titles">Notes</p><textarea name="notes" rows="4" value={formData['Game Status'].notes ?? ''} onChange={e => handleInputChange(e, 'Game Status')} /></div>
                    </div>
                )}

                {selectedSection === 'Game Log' && (
                    <div className="right-section">
                        <p className="game-information-titles">Game Completion</p>
                        <select name="gameCompletion" value={formData['Game Log'].gameCompletion ?? ''} onChange={e => handleInputChange(e, 'Game Log')} className="dropdown-box">
                            <option value="">Select Completion Status...</option>{['completed', 'beaten', 'retired', 'shelved', 'abandoned', 'backloged'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <div><p className="game-information-titles">Rating</p><StarRating rating={formData['Game Log'].rating} onChange={val => handleInputChange({ target: { name: 'rating', value: val, type: 'rating' } }, 'Game Log')} starSize={50} /></div>
                        <p className="game-information-titles">Review</p><textarea name="review" rows="4" value={formData['Game Log'].review ?? ''} onChange={e => handleInputChange(e, 'Game Log')} />
                        <div className="spoiler-container"><input type="checkbox" name="spoilerWarning" checked={formData['Game Log'].spoilerWarning} onChange={e => handleInputChange(e, 'Game Log')} /><label><span>Spoiler</span> <span>Warning</span></label></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditGameDetails;
