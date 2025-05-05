// services/authService.js
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from 'firebase/auth';

// Hàm cập nhật thông tin người dùng
const updateUserProfile = async (userData) => {
  const user = auth.currentUser;
  if (user) {
    await updateProfile(user, {
      displayName: userData.displayName || user.displayName,
      photoURL: userData.photoURL || user.photoURL
    });
  }
};

const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
const register = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential;
};
const forgotPassword = (email) => sendPasswordResetEmail(auth, email);
const logout = () => signOut(auth);

export {
  auth,
  login,
  register,
  logout,
  forgotPassword,
  updateUserProfile // ✅ Export ở đây để AuthContext dùng
};


const STORAGE_KEY = 'flower_shop_auth';

// Dữ liệu mẫu cho người dùng admin
const ADMIN_USER = {
  id: 1,
  name: 'Admin',
  email: 'admin@gmail.com'
};