// Importing necessary dependencies from React and other modules
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Importing styles and images
import '../App.css';
import discuss from '../Images/discuss.png';
import folder from '../Images/folder.png';
import search from '../Images/search.png';

// Importing custom components and hooks
import TopLinks from '../Context/TopLinks';
import { useUser } from '../Context/UserContext';

// Functional component for the HomePage
/*This component is used for the main home page, allowing
to read what website is about, and access other parts
of the website. Only allows to search website unless
user is logged in. */
function HomePage() {
  // Accessing user information using the useUser hook
  const { user, token, setUser, setToken, logout } = useUser();

  // Effect to log user information when user data changes
  useEffect(() => {
    if (user) {
      console.log('User: ', user);
      console.log('Token: ', token);
    }
  }, [user]);

  // Render UI component
  return (
    <div className="App">
      {/* TopLinks component for rendering top navigation links */}
      <TopLinks />
      <main className="main-content">
        <h1>The possibilities are endless..</h1>
        <h1>So let us keep that organized for you.</h1>

        {/* Conditional rendering based on user authentication */}
        {!user && (
          <Link to="/Register">
            {/* Button to navigate to the registration page */}
            <button className="big-button">
              Create an Account
            </button>
          </Link>
        )}

        {/* Container for displaying feature squares */}
        <div className="square-container">
          {/* Individual feature square for collecting video games */}
          <div className="square">
            <img src={folder} alt="Folder" />
            <h2>Collect video games</h2>
            <p>Keep your collection organized, up to date, and filled with information you want to know.</p>
          </div>

          {/* Individual feature square for discovering video games */}
          <div className="square">
            <img src={search} alt="Search" />
            <h2>Discover video games</h2>
            <p>Find new games to play or collect. Discover new adventures you have yet conquered.</p>
          </div>

          {/* Individual feature square for discussing video games */}
          <div className="square">
            <img src={discuss} alt="Discuss" />
            <h2>Discuss video games</h2>
            <p>Talk with others. Keep in touch with what they`ve played and what they`ve completed.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;