import { useState, useEffect } from 'react';
import { useUser } from '../Context/useUser';
import TopLinks from '../Context/TopLinks';
import defaultAvatar from '../assets/default-avatar.jpg';
import {
  checkUsername, updateUsername,
  updatePassword,
  checkEmail, updateEmail,
  updateAvatar,
  removeAvatar
} from '../Api';
import '../App.css';

function AccountSettings() {
  const { setUser, user, token } = useUser();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarError, setAvatarError] = useState(null);

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

  // ─── Separate error states ───────────────────────────────────
  const [usernameError, setUsernameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [emailError, setEmailError] = useState(null);

  useEffect(() => {
    if (user) {
      setAvatarPreview(user.avatar || '');
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

  // when user picks a new file:
  const handleAvatarChange = e => {
    const file = e.target.files[0] || null;

    // 1. clear old errors
    setAvatarError(null);

    // 2. if nothing selected, reset to current avatar
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(user.avatar || '');
      return;
    }

    // 3. validate type
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (jpg, png, etc.)');
      setAvatarFile(null);
      setAvatarPreview(user.avatar || '');
      return;
    }

    // 4. valid image: set file & preview
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  // upload the selected file
  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      setAvatarError('No file selected to upload.');
      return;
    }
    const fd = new FormData();
    fd.append('avatar', avatarFile);
    try {
      const { avatar } = await updateAvatar(fd);
      // update context user
      setUser(u => ({ ...u, avatar }));
      // revoke preview URL
      URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarError(null);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setAvatarError(
        err.message || 'Upload failed. Please try again with a valid image.'
      );
    }
  };

  // remove the avatar
  const handleAvatarRemove = async () => {
    await removeAvatar();
    setUser(u => ({ ...u, avatar: null }));
    setAvatarPreview('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(fd => ({
      ...fd,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ─── Update Username ────────────────────────────────────────
  const handleUpdateUsername = async () => {
    // clear only this section’s error
    setUsernameError(null);
    setLoading(true);
    try {
      const { newUsername, confirmUsername } = formData;
      if (newUsername !== confirmUsername) {
        throw new Error('Usernames must match.');
      }
      if (newUsername === user.username) {
        throw new Error('New username is the same as current.');
      }
      if (!newUsername) {
        throw new Error('Username cannot be empty.');
      }
      const { exists } = await checkUsername(newUsername, token);
      if (exists) {
        throw new Error('That username is already taken.');
      }
      await updateUsername(user.userid, newUsername, token);
      setUser(u => ({ ...u, username: newUsername }));
      setFormData(fd => ({
        ...fd,
        displayUsername: newUsername,
        newUsername: '',
        confirmUsername: ''
      }));
      alert('Username updated successfully!');
    } catch (err) {
      console.error(err);
      setUsernameError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Update Password ────────────────────────────────────────
  const handleUpdatePassword = async () => {
    setPasswordError(null);
    setLoading(true);
    try {
      const { newPassword, confirmPassword } = formData;
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords must match.');
      }
      if (!newPassword) {
        throw new Error('Password cannot be empty.');
      }
      await updatePassword(user.userid, newPassword, token);
      setFormData(fd => ({
        ...fd,
        newPassword: '',
        confirmPassword: ''
      }));
      alert('Password updated successfully!');
    } catch (err) {
      console.error(err);
      setPasswordError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Update Email ───────────────────────────────────────────
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleUpdateEmail = async () => {
    setEmailError(null);
    setLoading(true);
    try {
      const { newEmail, confirmEmail } = formData;
      if (newEmail !== confirmEmail) {
        throw new Error('Emails must match.');
      }
      if (!isValidEmail(newEmail)) {
        throw new Error('Invalid email format.');
      }
      if (newEmail === user.email) {
        throw new Error('New email is the same as current.');
      }
      const { exists } = await checkEmail(newEmail, token);
      if (exists) {
        throw new Error('That email is already in use.');
      }
      await updateEmail(user.userid, newEmail, token);
      setUser(u => ({ ...u, email: newEmail }));
      setFormData(fd => ({
        ...fd,
        displayEmail: newEmail,
        newEmail: '',
        confirmEmail: ''
      }));
      alert('Email updated successfully!');
    } catch (err) {
      console.error(err);
      setEmailError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <TopLinks />
      <main className="main-content">
        <h1>Account Settings</h1>

        {/* Avatar section */}
        <section className="avatar-section">
          <h2>Your Avatar</h2>
          <img
            src={avatarPreview || defaultAvatar}
            alt="Your avatar"
            className="profile-avatar"
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            {avatarError && (
              <div className="error-message" style={{ marginTop: '4px' }}>
                {avatarError}
              </div>
            )}
            {avatarFile && (
              <button
                className="small-button"
                onClick={handleAvatarUpload}
                disabled={!!avatarError}
              >
                Upload
              </button>
            )}
            {(user.avatar || avatarPreview) && !avatarFile && (
              <button
                className="small-button"
                onClick={handleAvatarRemove}
              >
                Remove
              </button>
            )}
          </div>
        </section>

        {/* Display current info */}
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

            {/* Username Section */}
            <div>
              <label>Change Username</label>
              <input
                name="newUsername"
                placeholder="Enter new username"
                value={formData.newUsername}
                onChange={handleChange}
              />
              <input
                name="confirmUsername"
                placeholder="Confirm new username"
                value={formData.confirmUsername}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={handleUpdateUsername}
                disabled={loading}
                className="big-button"
              >
                Change Username
              </button>
              {usernameError && (
                <div className="error-message">{usernameError}</div>
              )}
            </div>

            {/* Password Section */}
            <div>
              <label>Change Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={handleChange}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={loading}
                className="big-button"
              >
                Change Password
              </button>
              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}
            </div>

            {/* Email Section */}
            <div>
              <label>Change Email</label>
              <input
                type="email"
                name="newEmail"
                placeholder="Enter new email"
                value={formData.newEmail}
                onChange={handleChange}
              />
              <input
                type="email"
                name="confirmEmail"
                placeholder="Confirm new email"
                value={formData.confirmEmail}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={handleUpdateEmail}
                disabled={loading}
                className="big-button"
              >
                Change Email
              </button>
              {emailError && (
                <div className="error-message">{emailError}</div>
              )}
            </div>

          </div>
        </form>
      </main>
    </div>
  );
}

export default AccountSettings;
