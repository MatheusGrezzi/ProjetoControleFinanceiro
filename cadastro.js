const firebaseConfig = {
  apiKey: "AIzaSyBpp9d3QgpyUQL9lhvymBNMdMFq0EPBIY0",
  authDomain: "finzap-c9fa1.firebaseapp.com",
  projectId: "finzap-c9fa1",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.getElementById("signup-btn").onclick = async () => {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  try {
    const userCred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection("users").doc(userCred.user.uid).set({ name, phone });
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Erro ao cadastrar: " + err.message);
  }
};
