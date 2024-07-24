// Importing necessary dependencies and components
import React, { useState, useEffect } from 'react';
import { useUser } from '../Context/UserContext';
import TopLinks from '../Context/TopLinks';
import '../App.css';

// Main functional component for Account Settings
/*This component is used for handling changing user account
username, password, or email. */
function AccountSettings() {
    // Destructuring values from UserContext
    const { setUser, user } = useUser();

    // State to manage form data and loading/error states
    const [formData, setFormData] = useState({
        displayUsername: '',
        displayEmail: '',
        newUsername: '',
        confirmUsername: '',
        newPassword: '',
        confirmPassword: '',
        newEmail: '',
        confirmEmail: '',
    });

    const [loading,] = useState(false);
    const [error,] = useState(null);

    // useEffect to update form data when user details change
    useEffect(() => {
        if (user && user.userId) {
            setFormData({
                displayUsername: user.username,
                displayEmail: user.email,
                newUsername: '',
                confirmUsername: '',
                newPassword: '',
                confirmPassword: '',
                newEmail: '',
                confirmEmail: '',
            });
        }
    }, [user, user?.userId, user?.email]);

    // Function to handle form input changes
    const handleChange = (e) => {
        const { name, value, type } = e.target;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? e.target.checked : value,
        });
    };

    // Function to handle updating username
    const handleUpdateUsername = () => {
        // Check if new and confirmed usernames match
        if (formData.newUsername !== formData.confirmUsername) {
            alert('Username mismatch, please keep them the same.'); // Show an error alert
            return;
        }

        // Check if the new username is different from the current one
        if (formData.newUsername !== user.username) {
            // Check if the new username already exists
            fetch(`https://capstonebackend-mdnh.onrender.com/api/check-username/${formData.newUsername}`)
                .then(response => response.json())
                .then(data => {
                    if (data.exists) {
                        alert('Username already exists, please use another.'); // Show an error alert
                        return;
                    }

                    // If new username is valid, update it
                    fetch(`https://capstonebackend-mdnh.onrender.com/api/update-username/${user.userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            newUsername: formData.newUsername,
                        }),
                    })
                        .then(response => response.json())
                        .then(data => {
                            // Update user context and reset form data
                            setUser((prevUser) => ({
                                ...prevUser,
                                username: formData.newUsername,
                            }));
                            setFormData({
                                ...formData,
                                displayUsername: formData.newUsername,
                                newUsername: '',
                                confirmUsername: '',
                            });
                            alert('Username updated successfully!');
                        })
                        .catch(error => {
                            console.error('Error updating username:', error);
                            alert('Failed to update username. Please try again.');
                        });
                })
                .catch(error => {
                    console.error('Error checking username:', error);
                    alert('Failed to check username. Please try again.');
                });
        }
    };

    // Function to handle updating password
    const handleUpdatePassword = () => {
        // Check if new and confirmed passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Password mismatch, please keep them the same.');
            return;
        }

        // Make an API request to update the password
        fetch(`https://capstonebackend-mdnh.onrender.com/api/update-password/${user.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                newPassword: formData.newPassword,
            }),
        })
            .then(response => response.json())
            .then(data => {
                alert('Password updated successfully!');
                // Reset the input values
                setFormData({
                    ...formData,
                    newPassword: '',
                    confirmPassword: '',
                });
            })
            .catch(error => {
                console.error('Error updating password:', error);
                alert('Failed to update password. Please try again.');
            });
    };

    // Function to handle updating email
    const handleUpdateEmail = () => {
        // Check if new and confirmed emails match
        if (formData.newEmail !== formData.confirmEmail) {
            console.error('Email mismatch');
            alert('Email mismatch, please keep them the same.');
            return;
        }

        // Validate email format
        if (!isValidEmail(formData.newEmail) || !isValidEmail(formData.confirmEmail)) {
            alert('Invalid email format. Please enter valid email addresses.');
            return;
        }

        // Check if the new email is different from the current one
        if (formData.newEmail !== user.email) {
            // Check if the new email already exists
            fetch(`https://capstonebackend-mdnh.onrender.com/api/check-email/${formData.newEmail}`)
                .then(response => response.json())
                .then(data => {
                    if (data.exists) {
                        console.error('Email already exists');
                        alert('Email already exists, please use another.');
                        return;
                    }

                    // If new email is valid, update it
                    fetch(`https://capstonebackend-mdnh.onrender.com/api/update-email/${user.userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            newEmail: formData.newEmail,
                        }),
                    })
                        .then(response => response.json())
                        .then(data => {
                            // Update user context and reset form data
                            setUser((prevUser) => ({
                                ...prevUser,
                                email: formData.newEmail,
                            }));
                            setFormData({
                                ...formData,
                                displayEmail: formData.newEmail,
                                newEmail: '',
                                confirmEmail: '',
                            });
                            alert('Email updated successfully!');
                        })
                        .catch(error => {
                            console.error('Error updating email:', error);
                            alert('Failed to update email. Please try again.');
                        });
                })
                .catch(error => {
                    console.error('Error checking email:', error);
                    alert('Failed to check email. Please try again.');
                });
        }
    };

    // Helper function to validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Rendering the Account Settings component
    return (
        <div>
            <TopLinks />
            <div className="register-container">
                <h1>Account Settings</h1>
                <div className="info-section">
                    <div>
                        <label>Current Username: {formData.displayUsername}</label>
                    </div>
                    <div>
                        <label>Current Email: {formData.displayEmail}</label>
                    </div>
                </div>
                <form>
                    <div className="change-section">
                        {/* Change Username Section */}
                        <div>
                            <label>Change Username</label>
                            <input
                                type="text"
                                id="newUsername"
                                name="newUsername"
                                placeholder="Enter new username"
                                value={formData.newUsername}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                id="confirmUsername"
                                name="confirmUsername"
                                placeholder="Confirm new username"
                                value={formData.confirmUsername}
                                onChange={handleChange}
                            />
                            <button className="big-button" type="button" onClick={handleUpdateUsername} disabled={loading}>
                                Change Username
                            </button>
                        </div>
                        {/* Change Password Section */}
                        <div>
                            <label>Change Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                placeholder="Enter new password"
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm new password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <button className="big-button" type="button" onClick={handleUpdatePassword} disabled={loading}>
                                Change Password
                            </button>
                        </div>
                        {/* Change Email Section */}
                        <div>
                            <label>Change Email</label>
                            <input
                                type="email"
                                id="newEmail"
                                name="newEmail"
                                placeholder="Enter new email"
                                value={formData.newEmail}
                                onChange={handleChange}
                            />
                            <input
                                type="email"
                                id="confirmEmail"
                                name="confirmEmail"
                                placeholder="Confirm new email"
                                value={formData.confirmEmail}
                                onChange={handleChange}
                            />
                            <button className="big-button" type="button" onClick={handleUpdateEmail} disabled={loading}>
                                Change Email
                            </button>
                        </div>
                    </div>
                </form>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
}

export default AccountSettings;
