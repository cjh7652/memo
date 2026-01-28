import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

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
const database = getDatabase(app);

(function () {
  const signupForm = document.getElementById('signupForm');
  const signupSubmitBtn = document.getElementById('signupSubmitBtn');
  const phoneInput = document.getElementById('phone');

  // 전화번호 자동 포맷팅
  phoneInput.addEventListener('input', function (e) {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 3 && value.length <= 7) {
      value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 7) {
      value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    e.target.value = value;
  });

  const usernameInput = document.getElementById('username');
  const useridInput = document.getElementById('userid');
  const passwordInput = document.getElementById('password');
  const passwordConfirmInput = document.getElementById('passwordConfirm');
  const emailInput = document.getElementById('email');

  usernameInput.addEventListener('blur', validateUsername);
  useridInput.addEventListener('blur', validateUserid);
  passwordInput.addEventListener('blur', validatePassword);
  passwordConfirmInput.addEventListener('input', validatePasswordConfirm);
  emailInput.addEventListener('blur', validateEmail);
  phoneInput.addEventListener('blur', validatePhone);

  function validateUsername() {
    const username = usernameInput.value.trim();
    const errorEl = document.getElementById('usernameError');
    if (!username) { errorEl.textContent = '유저 이름을 입력해주세요.'; return false; }
    if (username.length < 2) { errorEl.textContent = '유저 이름은 2자 이상이어야 합니다.'; return false; }
    if (username.length > 20) { errorEl.textContent = '유저 이름은 20자 이하여야 합니다.'; return false; }
    errorEl.textContent = '';
    return true;
  }

  function validateUserid() {
    const userid = useridInput.value.trim();
    const errorEl = document.getElementById('useridError');
    const pattern = /^[a-zA-Z0-9_]+$/;
    if (!userid) { errorEl.textContent = '유저 아이디를 입력해주세요.'; return false; }
    if (userid.length < 4) { errorEl.textContent = '유저 아이디는 4자 이상이어야 합니다.'; return false; }
    if (userid.length > 20) { errorEl.textContent = '유저 아이디는 20자 이하여야 합니다.'; return false; }
    if (!pattern.test(userid)) { errorEl.textContent = '영문, 숫자, 언더스코어(_)만 사용 가능합니다.'; return false; }
    errorEl.textContent = '';
    return true;
  }

  function validatePassword() {
    const password = passwordInput.value;
    const errorEl = document.getElementById('passwordError');
    if (!password) { errorEl.textContent = '비밀번호를 입력해주세요.'; return false; }
    if (password.length < 6) { errorEl.textContent = '비밀번호는 6자 이상이어야 합니다.'; return false; }
    errorEl.textContent = '';
    validatePasswordConfirm();
    return true;
  }

  function validatePasswordConfirm() {
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    const errorEl = document.getElementById('passwordConfirmError');
    if (!passwordConfirm) { errorEl.textContent = '비밀번호 확인을 입력해주세요.'; return false; }
    if (password !== passwordConfirm) { errorEl.textContent = '비밀번호가 일치하지 않습니다.'; return false; }
    errorEl.textContent = '';
    return true;
  }

  function validateEmail() {
    const email = emailInput.value.trim();
    const errorEl = document.getElementById('emailError');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) { errorEl.textContent = '이메일 주소를 입력해주세요.'; return false; }
    if (!emailPattern.test(email)) { errorEl.textContent = '올바른 이메일 형식이 아닙니다.'; return false; }
    errorEl.textContent = '';
    return true;
  }

  function validatePhone() {
    const phone = phoneInput.value.trim();
    const errorEl = document.getElementById('phoneError');
    const phonePattern = /^[0-9]{3}-[0-9]{4}-[0-9]{4}$/;
    if (!phone) { errorEl.textContent = '전화번호를 입력해주세요.'; return false; }
    if (!phonePattern.test(phone)) { errorEl.textContent = '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)'; return false; }
    errorEl.textContent = '';
    return true;
  }

  function setLoading(loading) {
    signupSubmitBtn.disabled = loading;
    signupSubmitBtn.textContent = loading ? '가입 중…' : '회원가입';
  }

  function getAuthErrorMessage(code) {
    const messages = {
      'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
      'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
      'auth/operation-not-allowed': '이메일/비밀번호 로그인이 비활성화되어 있습니다.',
      'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
      'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      'auth/network-request-failed': '네트워크 오류가 발생했습니다. 연결을 확인해주세요.'
    };
    return messages[code] || '회원가입에 실패했습니다. 다시 시도해주세요.';
  }

  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const isValid =
      validateUsername() &&
      validateUserid() &&
      validatePassword() &&
      validatePasswordConfirm() &&
      validateEmail() &&
      validatePhone();

    if (!isValid) {
      alert('입력한 정보를 확인해주세요.');
      return;
    }

    const agreeTerms = document.getElementById('agreeTerms').checked;
    const agreePrivacy = document.getElementById('agreePrivacy').checked;
    if (!agreeTerms || !agreePrivacy) {
      alert('이용약관과 개인정보 처리방침에 동의해주세요.');
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const username = usernameInput.value.trim();
    const userid = useridInput.value.trim();
    const phone = phoneInput.value.trim();
    const birthdate = document.getElementById('birthdate').value;
    const gender = document.getElementById('gender').value;
    const agreeMarketing = document.getElementById('agreeMarketing').checked;

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      const userProfile = {
        username,
        userid,
        email,
        phone,
        birthdate: birthdate || null,
        gender: gender || null,
        agreeMarketing,
        createdAt: Date.now()
      };

      const usersRef = ref(database, `users/${user.uid}`);
      await set(usersRef, userProfile);

      alert('회원가입이 완료되었습니다.');
      window.location.href = 'login.html';
    } catch (err) {
      setLoading(false);
      const msg = getAuthErrorMessage(err.code) || err.message;
      alert(msg);
    }
  });
})();
