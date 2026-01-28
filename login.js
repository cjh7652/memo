import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBWAm8-veis5NObcKxxhsLjUNxCQYCAgUg",
  authDomain: "memos-53669.firebaseapp.com",
  projectId: "memos-53669",
  storageBucket: "memos-53669.firebasestorage.app",
  messagingSenderId: "515312144211",
  appId: "1:515312144211:web:574ee4baaf5b602fa3dba6",
  measurementId: "G-D5VRD623YX",
  databaseURL: "https://memos-53669-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

(function () {
  const loginForm = document.getElementById('loginForm');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const signupLink = document.getElementById('signupLink');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  signupLink.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'signup.html';
  });

  function setLoading(loading) {
    loginSubmitBtn.disabled = loading;
    googleLoginBtn.disabled = loading;
    loginSubmitBtn.textContent = loading ? '로그인 중…' : '로그인';
  }

  function getAuthErrorMessage(code) {
    const messages = {
      'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
      'auth/user-disabled': '비활성화된 계정입니다.',
      'auth/user-not-found': '등록되지 않은 이메일입니다.',
      'auth/wrong-password': '비밀번호가 일치하지 않습니다.',
      'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
      'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      'auth/network-request-failed': '네트워크 오류가 발생했습니다. 연결을 확인해주세요.',
      'auth/popup-closed-by-user': '로그인 창이 닫혔습니다.',
      'auth/popup-blocked': '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.',
      'auth/cancelled-popup-request': '다른 로그인 요청이 진행 중입니다.'
    };
    return messages[code] || '로그인에 실패했습니다. 다시 시도해주세요.';
  }

  async function onEmailLogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('로그인되었습니다.');
      window.location.href = 'index.html';
    } catch (err) {
      setLoading(false);
      alert(getAuthErrorMessage(err.code) || err.message);
    }
  }

  async function onGoogleLogin() {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      alert('로그인되었습니다.');
      window.location.href = 'index.html';
    } catch (err) {
      setLoading(false);
      alert(getAuthErrorMessage(err.code) || err.message);
    }
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    onEmailLogin();
  });

  googleLoginBtn.addEventListener('click', onGoogleLogin);
})();
