import { useState, useEffect } from 'react';
import { useUser } from '../Context/UserContext';
import TopLinks from '../Context/TopLinks';
import { checkUsername, updateUsername, updatePassword, checkEmail, updateEmail } from '../Api';
import '../App.css';

function AccountSettings() {
    const { setUser, user, token } = useUser();
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            console.log('User:', user);
            setFormData({
                displayUsername: user.username || '',
                displayEmail: user.email || '',
                newUsername: '',
                confirmUsername: '',
                newPassword: '',
                confirmPassword: '',
                newEmail: '',
                confirmEmail: '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? e.target.checked : value,
        });
    };

    const handleUpdateUsername = async () => {
        console.log('User ID:', user.userid); // Add this line
        if (formData.newUsername !== formData.confirmUsername) {
            alert('Username mismatch, please keep them the same.');
            return;
        }
        if (formData.newUsername !== user.username) {
            try {
                const data = await checkUsername(formData.newUsername);
                if (data.exists) {
                    alert('Username already exists, please use another.');
                    return;
                }
                await updateUsername(user.userid, formData.newUsername);
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
            } catch (error) {
                console.error('Error updating username:', error);
                alert('Failed to update username. Please try again.');
            }
        }
    };


    const handleUpdatePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Password mismatch, please keep them the same.');
            return;
        }
        try {
            await updatePassword(user.userid, formData.newPassword);
            setFormData({
                ...formData,
                newPassword: '',
                confirmPassword: '',
            });
            alert('Password updated successfully!');
        } catch (error) {
            console.error('Error updating password:', error);
            alert('Failed to update password. Please try again.');
        }
    };

    const handleUpdateEmail = async () => {
        if (formData.newEmail !== formData.confirmEmail) {
            alert('Email mismatch, please keep them the same.');
            return;
        }
        if (!isValidEmail(formData.newEmail) || !isValidEmail(formData.confirmEmail)) {
            alert('Invalid email format. Please enter valid email addresses.');
            return;
        }
        if (formData.newEmail !== user.email) {
            try {
                const data = await checkEmail(formData.newEmail);
                if (data.exists) {
                    alert('Email already exists, please use another.');
                    return;
                }
                await updateEmail(user.userid, formData.newEmail);
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
            } catch (error) {
                console.error('Error updating email:', error);
                alert('Failed to update email. Please try again.');
            }
        }
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

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
