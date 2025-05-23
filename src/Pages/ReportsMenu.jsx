import { useEffect, useState } from 'react';
import '../App.css';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/UserContext';
import { fetchReportData } from '../Api';

function ReportsMenu() {
    const { user } = useUser();
    const [selectedUserReport, setSelectedUserReport] = useState('');
    const [selectedMyCollectionReport, setSelectedMyCollectionReport] = useState('');
    const [selectedWishlistReport, setSelectedWishlistReport] = useState('');

    const [labelUser, setLabelUser] = useState(null);
    const [labelMyCollection, setLabelMyCollection] = useState(null);
    const [labelWishlist, setLabelWishlist] = useState(null);

    const [labelUserAnswer, setLabelUserAnswer] = useState(null);
    const [labelMostCollectedGameAnswer, setLabelMostCollectedGameAnswer] = useState(null);
    const [labelHighestReviewedGameAnswer, setLabelHighestReviewedGameAnswer] = useState(null);
    const [labelMostWantedGame, setLabelMostWantedGame] = useState(null);
    const [labelTotalWishlistsAnswer, setLabelTotalWishlistsAnswer] = useState(null);

    useEffect(() => {
        if (user && user.userId) {
            console.log('User:', user);
        }
    }, [user]);

    const handleUserReportSelection = (userReport) => {
        setSelectedUserReport(userReport);
        setLabelUser(
            userReport === 'TotalUsers' ? 'Total number of users' :
                userReport === 'TotalCollections' ? 'Total number of collections' : null
        );
    };

    const handleMyCollectionReportSelection = (myCollectionReport) => {
        setSelectedMyCollectionReport(myCollectionReport);
        setLabelMyCollection(
            myCollectionReport === 'MostCollectedGame' ? 'Most Collected Game' :
                myCollectionReport === 'HighestReviewedGame' ? 'Highest Reviewed Game' : null
        );
    };

    const handleWishlistReportSelection = (wishlistReport) => {
        setSelectedWishlistReport(wishlistReport);
        setLabelWishlist(
            wishlistReport === 'MostWantedGame' ? 'Most Wanted Game' :
                wishlistReport === 'TotalWishlists' ? 'Total number of wishlists' : null
        );
    };

    const handleReset = () => {
        setSelectedUserReport('');
        setSelectedMyCollectionReport('');
        setSelectedWishlistReport('');
        setLabelUser(null);
        setLabelMyCollection(null);
        setLabelWishlist(null);
        setLabelUserAnswer(null);
        setLabelMostCollectedGameAnswer(null);
        setLabelHighestReviewedGameAnswer(null);
        setLabelMostWantedGame(null);
        setLabelTotalWishlistsAnswer(null);
    };

    const handleGenerateReport = async () => {
        try {
            const selectedReports = [
                selectedUserReport,
                selectedMyCollectionReport,
                selectedWishlistReport
            ].filter(Boolean);

            if (selectedReports.length > 0) {
                const reportData = await fetchReportData(selectedReports);

                console.log('This is the report data: ', reportData);

                if (selectedUserReport) {
                    if (selectedUserReport === 'TotalUsers') {
                        setLabelUserAnswer(reportData.totalUsers?.count || 'N/A');
                    } else if (selectedUserReport === 'TotalCollections') {
                        setLabelUserAnswer(reportData.totalCollections?.count || 'N/A');
                    }
                }

                if (selectedMyCollectionReport) {
                    if (selectedMyCollectionReport === 'MostCollectedGame') {
                        const mostCollectedGame = reportData.mostCollectedGame || {};
                        setLabelMostCollectedGameAnswer(
                            `${mostCollectedGame.name || 'N/A'} (Count: ${mostCollectedGame.count || 'N/A'})`
                        );
                    } else if (selectedMyCollectionReport === 'HighestReviewedGame') {
                        const highestReviewedGame = reportData.highestReviewedGame || {};
                        setLabelHighestReviewedGameAnswer(
                            `${highestReviewedGame.name || 'N/A'} (Rating: ${highestReviewedGame.rating || 'N/A'})`
                        );
                    }
                }

                if (selectedWishlistReport) {
                    if (selectedWishlistReport === 'MostWantedGame') {
                        const mostWantedGame = reportData.mostWantedGame || {};
                        setLabelMostWantedGame(
                            `${mostWantedGame.name || 'N/A'} (Count: ${mostWantedGame.count || 'N/A'})`
                        );
                    } else if (selectedWishlistReport === 'TotalWishlists') {
                        setLabelTotalWishlistsAnswer(reportData.totalWishlists?.count || 'N/A');
                    }
                }
            }
        } catch (error) {
            console.error('Error generating reports:', error);
        }
    };

    return (
        <div className="App">
            <TopLinks />
            <main className="main-content">
                <h1>Reports Menu</h1>
                <div className="report-header">
                    <h2>Check buttons to generate a desired report</h2>
                </div>
                <div className="user-reports-container">
                    <div className="column">
                        <h3>Users</h3>
                        <label>
                            <input
                                type="radio"
                                value="TotalUsers"
                                checked={selectedUserReport === 'TotalUsers'}
                                onChange={() => handleUserReportSelection('TotalUsers')}
                            />
                            Total Number Of Users
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="TotalCollections"
                                checked={selectedUserReport === 'TotalCollections'}
                                onChange={() => handleUserReportSelection('TotalCollections')}
                            />
                            Total Number Of Collections
                        </label>
                        <button className="big-button" onClick={handleReset}>Reset</button>
                    </div>
                    <div className="column">
                        <h3>Collections</h3>
                        <label>
                            <input
                                type="radio"
                                value="MostCollectedGame"
                                checked={selectedMyCollectionReport === 'MostCollectedGame'}
                                onChange={() => handleMyCollectionReportSelection('MostCollectedGame')}
                            />
                            Most Collected Game
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="HighestReviewedGame"
                                checked={selectedMyCollectionReport === 'HighestReviewedGame'}
                                onChange={() => handleMyCollectionReportSelection('HighestReviewedGame')}
                            />
                            Highest Reviewed Game
                        </label>
                    </div>
                    <div className="column">
                        <h3>Wishlists</h3>
                        <label>
                            <input
                                type="radio"
                                value="MostWantedGame"
                                checked={selectedWishlistReport === 'MostWantedGame'}
                                onChange={() => handleWishlistReportSelection('MostWantedGame')}
                            />
                            Most Wished For Game
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="TotalWishlists"
                                checked={selectedWishlistReport === 'TotalWishlists'}
                                onChange={() => handleWishlistReportSelection('TotalWishlists')}
                            />
                            Total Number Of Wishlists
                        </label>
                        <button className="big-button" onClick={handleGenerateReport}>Generate Report</button>
                    </div>
                </div>
                <div className="centered-rectangle">
                    <div className="column">
                        <h3>Users</h3>
                        <p>{labelUser || 'NULL'}</p>
                        <p>{labelUserAnswer || 'NULL'}</p>
                    </div>
                    <div className="column">
                        <h3>My Collection</h3>
                        <p>{labelMyCollection || 'NULL'}</p>
                        {selectedMyCollectionReport === 'MostCollectedGame' && <p>{labelMostCollectedGameAnswer || 'NULL'}</p>}
                        {selectedMyCollectionReport === 'HighestReviewedGame' && <p>{labelHighestReviewedGameAnswer || 'NULL'}</p>}
                    </div>
                    <div className="column">
                        <h3>Wishlist</h3>
                        <p>{labelWishlist || 'NULL'}</p>
                        {selectedWishlistReport === 'TotalWishlists' && <p>{labelTotalWishlistsAnswer || 'NULL'}</p>}
                        {selectedWishlistReport === 'MostWantedGame' && <p>{labelMostWantedGame || 'NULL'}</p>}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ReportsMenu;
