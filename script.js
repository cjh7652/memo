import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
import { getDatabase, ref, push, set, onValue, remove, update, get } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);

(function () {
  const memoInput = document.getElementById('memoInput');
  const addBtn = document.getElementById('addBtn');
  const memoList = document.getElementById('memoList');
  const countText = document.getElementById('countText');
  const authBtn = document.getElementById('authBtn');
  const welcomeMessage = document.getElementById('welcomeMessage');

  const memosRef = ref(database, 'memos');
  let items = [];
  let editingId = null;

  // Firebase에서 데이터 실시간 동기화
  onValue(memosRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      items = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
    } else {
      items = [];
    }
    renderList();
  });

  function updateCount() {
    const total = items.length;
    const done = items.filter(function (it) { return it.done; }).length;
    countText.textContent = total === 0 ? '총 0개' : "총 " + total + "개 (완료 " + done + "개)";
  }

  function createMemoElement(item) {
    const li = document.createElement('li');
    li.className = 'memo-item';
    li.dataset.id = item.id;
    if (item.done) li.classList.add('done');
    if (editingId === item.id) li.classList.add('editing');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'memo-checkbox';
    checkbox.checked = item.done;
    checkbox.setAttribute('aria-label', '완료 표시');
    checkbox.disabled = editingId === item.id;

    const span = document.createElement('span');
    span.className = 'memo-text';
    span.textContent = item.text;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'memo-edit-input';
    editInput.value = item.text;
    editInput.style.display = 'none';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '✎';
    editBtn.setAttribute('aria-label', '수정');
    editBtn.style.display = editingId === item.id ? 'none' : 'flex';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'save-btn';
    saveBtn.innerHTML = '✓';
    saveBtn.setAttribute('aria-label', '저장');
    saveBtn.style.display = editingId === item.id ? 'flex' : 'none';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.innerHTML = '✕';
    cancelBtn.setAttribute('aria-label', '취소');
    cancelBtn.style.display = editingId === item.id ? 'flex' : 'none';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.setAttribute('aria-label', '삭제');
    deleteBtn.style.display = editingId === item.id ? 'none' : 'flex';

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    checkbox.addEventListener('change', function () {
      const memoRef = ref(database, `memos/${item.id}`);
      update(memoRef, { done: checkbox.checked });
    });

    editBtn.addEventListener('click', function () {
      editingId = item.id;
      span.style.display = 'none';
      editInput.style.display = 'block';
      editBtn.style.display = 'none';
      deleteBtn.style.display = 'none';
      saveBtn.style.display = 'flex';
      cancelBtn.style.display = 'flex';
      li.classList.add('editing');
      checkbox.disabled = true;
      editInput.focus();
      editInput.select();
    });

    function exitEditMode() {
      editingId = null;
      span.style.display = '';
      editInput.style.display = 'none';
      editBtn.style.display = 'flex';
      deleteBtn.style.display = 'flex';
      saveBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
      li.classList.remove('editing');
      checkbox.disabled = false;
      editInput.value = item.text;
    }

    saveBtn.addEventListener('click', function () {
      const newText = editInput.value.trim();
      if (newText && newText !== item.text) {
        const memoRef = ref(database, `memos/${item.id}`);
        update(memoRef, { text: newText });
      }
      exitEditMode();
    });

    cancelBtn.addEventListener('click', function () {
      exitEditMode();
    });

    editInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        saveBtn.click();
      } else if (e.key === 'Escape') {
        cancelBtn.click();
      }
    });

    deleteBtn.addEventListener('click', function () {
      if (confirm('정말 삭제하시겠습니까?')) {
        const memoRef = ref(database, `memos/${item.id}`);
        remove(memoRef);
      }
    });

    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(saveBtn);
    buttonGroup.appendChild(cancelBtn);
    buttonGroup.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editInput);
    li.appendChild(buttonGroup);
    return li;
  }

  function renderList() {
    memoList.innerHTML = '';
    items.forEach(function (item) {
      memoList.appendChild(createMemoElement(item));
    });
    updateCount();
  }

  function addMemo() {
    const text = memoInput.value.trim();
    if (!text) return;

    const newMemo = {
      text: text,
      done: false,
      createdAt: Date.now()
    };

    push(memosRef, newMemo);
    memoInput.value = '';
    memoInput.focus();
  }

  addBtn.addEventListener('click', addMemo);
  memoInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addMemo();
  });

  async function updateAuthUI(user) {
    if (user) {
      let username = user.displayName || '사용자';
      
      try {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          if (userData.username) {
            username = userData.username;
          }
        }
      } catch (err) {
        console.error('사용자 정보 가져오기 실패:', err);
      }

      welcomeMessage.textContent = `${username}님 환영합니다.`;
      welcomeMessage.style.display = 'block';
      authBtn.textContent = '로그아웃';
      authBtn.className = 'logout-btn';
    } else {
      welcomeMessage.style.display = 'none';
      authBtn.textContent = '로그인';
      authBtn.className = 'login-btn';
    }
  }

  onAuthStateChanged(auth, async (user) => {
    await updateAuthUI(user);
  });

  authBtn.addEventListener('click', async function () {
    const user = auth.currentUser;
    if (user) {
      if (confirm('로그아웃하시겠습니까?')) {
        try {
          await signOut(auth);
          alert('로그아웃되었습니다.');
        } catch (err) {
          alert('로그아웃에 실패했습니다.');
          console.error(err);
        }
      }
    } else {
      window.location.href = 'login.html';
    }
  });
})();
