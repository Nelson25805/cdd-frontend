// Importing React hooks, components, and styles
import React, { useEffect, useState } from 'react';
import '../App.css';
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/UserContext';

// Functional component for the Reports Menu page
/*This component is used to allow the admin accounts to view reports
of the users game information on wishlists, collections, and users
themselves. */
function ReportsMenu() {
    // Accessing user information from UserContext
    const { user } = useUser();

    // State for managing selected report types and labels
    const [selectedUserReport, setSelectedUserReport] = useState('');
    const [selectedMyCollectionReport, setSelectedMyCollectionReport] = useState('');
    const [selectedWishlistReport, setSelectedWishlistReport] = useState('');

    // State for labels of selected report types
    const [labelUser, setLabelUser] = useState(null);
    const [labelMyCollection, setLabelMyCollection] = useState(null);
    const [labelWishlist, setLabelWishlist] = useState(null);

    // State for labels and answers of report results
    const [labelUserAnswer, setLabelUserAnswer] = useState(null);
    const [, setLabelMyCollectionAnswer] = useState(null);
    const [, setLabelWishlistAnswer] = useState(null);

    const [, setLabelMostCollectedGame] = useState(null);
    const [, setLabelHighestReviewedGame] = useState(null);
    const [labelMostCollectedGameAnswer, setLabelMostCollectedGameAnswer] = useState(null);
    const [labelHighestReviewedGameAnswer, setLabelHighestReviewedGameAnswer] = useState(null);

    const [labelMostWantedGame, setLabelMostWantedGame] = useState(null);
    const [, setLabelTotalWishlists] = useState(null);
    const [, setLabelMostWantedGameAnswer] = useState(null);
    const [labelTotalWishlistsAnswer, setLabelTotalWishlistsAnswer] = useState(null);

    // Effect to log user information when available
    useEffect(() => {
        if (user && user.userId) {
            console.log('User:', user);
        }
    }, [user]);

    // Function to fetch data from the API for a given report type
    const fetchData = async (reportType) => {
        try {
            const response = await fetch(`https://capstonebackend-mdnh.onrender.com/api/reports/${reportType}`);

            if (!response.ok) {
                // Handle non-OK response (e.g., 404 Not Found, 500 Internal Server Error)
                console.error(`Error fetching data. Status: ${response.status}`);
                throw new Error(`Error fetching data. Status: ${response.status}`);
            }

            const rawResponse = await response.text();

            // Check if the response is empty
            if (!rawResponse.trim()) {
                console.error('Empty response received.');
                throw new Error('Empty response received.');
            }

            const data = JSON.parse(rawResponse);

            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    // Functions to handle user selections for report types
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

    // Function to reset all selected report types and labels
    const handleReset = () => {
        setSelectedUserReport('');
        setSelectedMyCollectionReport('');
        setSelectedWishlistReport('');
        setLabelUser(null);
        setLabelMyCollection(null);
        setLabelWishlist(null);
        setLabelUserAnswer(null);
        setLabelMyCollectionAnswer(null);
        setLabelWishlistAnswer(null);
        setLabelMostCollectedGame(null);
        setLabelHighestReviewedGame(null);
        setLabelMostCollectedGameAnswer(null);
        setLabelHighestReviewedGameAnswer(null);
        setLabelMostWantedGame(null);
        setLabelTotalWishlists(null);
        setLabelMostWantedGameAnswer(null);
        setLabelTotalWishlistsAnswer(null);
    };

    // Function to generate and display reports based on selected report types
    const handleGenerateReport = async () => {
        try {
            if (selectedUserReport) {
                const userData = await fetchData(selectedUserReport);
                setLabelUserAnswer(userData.count); // Assuming the API response provides a count property
            }

            if (selectedMyCollectionReport) {
                const myCollectionData = await fetchData(selectedMyCollectionReport);

                setLabelMyCollectionAnswer(myCollectionData?.count ?? 'N/A');
                if (selectedMyCollectionReport === 'MostCollectedGame') {
                    setLabelMostCollectedGameAnswer(`${myCollectionData?.Name || 'N/A'} (Count: ${myCollectionData?.count || 'N/A'})`);
                } else if (selectedMyCollectionReport === 'HighestReviewedGame') {
                    // Here, set both the name and rating
                    setLabelHighestReviewedGameAnswer(`${myCollectionData?.Name || 'N/A'} (Rating: ${myCollectionData?.Rating || 'N/A'})`);
                }
            }

            if (selectedWishlistReport) {
                const wishlistData = await fetchData(selectedWishlistReport);
                setLabelWishlistAnswer(wishlistData.count); // Assuming the API response provides a count property

                if (selectedWishlistReport === 'MostWantedGame') {
                    setLabelMostWantedGame(`${wishlistData?.Name || 'N/A'} (Count: ${wishlistData?.count || 'N/A'})`);
                    setLabelMostWantedGameAnswer(wishlistData?.count ?? 'N/A');
                }

                if (selectedWishlistReport === 'TotalWishlists') {
                    setLabelTotalWishlistsAnswer(wishlistData?.TotalWishlistItems ?? 'N/A');
                }
            }

        } catch (error) {
            console.error('Error generating reports:', error);
        }
    };

    // Render UI component
    return (
        <div className="App">
            {/* TopLinks component for rendering top navigation links */}
            <TopLinks />
            <main className="main-content">
                <h1>Reports Menu</h1>

                {/* Grey rectangle for report selection */}
                <div className="report-header">
                    <h2>Check buttons to generate a desired report</h2>
                </div>

                {/* Rectangle with 3 columns for user reports */}
                <div className="user-reports-container">
                    {/* Column 1: Users Label and Radio Buttons */}
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
                        {/* Reset button */}
                        <button className="big-button" onClick={handleReset}>Reset</button>
                    </div>

                    {/* Column 2: My Collection Label and Radio Buttons */}
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

                    {/* Column 3: Wishlist Label and Radio Buttons */}
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
                        {/* Generate Report button */}
                        <button className="big-button" onClick={handleGenerateReport}>Generate Report</button>
                    </div>
                </div>

                {/* Centered rectangle with 3 columns for Users, My Collection, and Wishlist */}
                <div className="centered-rectangle">
                    {/* Column for Users */}
                    <div className="column">
                        <h3>Users</h3>
                        <p>{labelUser || 'NULL'}</p>
                        <p>{labelUserAnswer || 'NULL'}</p>
                    </div>
                    {/* Column for My Collection */}
                    <div className="column">
                        <h3>My Collection</h3>
                        <p>{labelMyCollection || 'NULL'}</p>
                        {selectedMyCollectionReport === 'MostCollectedGame' && <p>{labelMostCollectedGameAnswer || 'NULL'}</p>}
                        {selectedMyCollectionReport === 'HighestReviewedGame' && <p>{labelHighestReviewedGameAnswer || 'NULL'}</p>}
                    </div>
                    {/* Column for Wishlist */}
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
