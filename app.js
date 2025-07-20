const firebaseConfig = {
  apiKey: "AIzaSyBpp9d3QgpyUQL9lhvymBNMdMFq0EPBIY0",
  authDomain: "finzap-c9fa1.firebaseapp.com",
  projectId: "finzap-c9fa1",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const googleBtn = document.getElementById('google-login');

signupBtn.onclick = async () => {
  const name = nameInput.value;
  const email = emailInput.value;
  const phone = phoneInput.value;
  const password = passwordInput.value;

  try {
    const userCred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection('users').doc(userCred.user.uid).set({ name, phone });
    window.location.href = "dashboard.html";
  } catch (err) {
    alert(err.message);
  }
};

googleBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).then(() => {
    window.location.href = "dashboard.html";
  });
};
