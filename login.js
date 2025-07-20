// Coloque sua config do Firebase aqui:
const firebaseConfig = {
  apiKey: "AIzaSyBpp9d3QgpyUQL9lhvymBNMdMFq0EPBIY0",
  authDomain: "finzap-c9fa1.firebaseapp.com",
  projectId: "finzap-c9fa1",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");
const goToRegisterBtn = document.getElementById("go-to-register");

const forgotPasswordBtn = document.getElementById("forgot-password");
const resetPasswordForm = document.getElementById("reset-password-form");
const resetEmailInput = document.getElementById("reset-email");
const cancelResetBtn = document.getElementById("cancel-reset");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMessage.style.color = "red";
  errorMessage.textContent = "";

  const email = form.email.value;
  const password = form.password.value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    // Redireciona para dashboard
    window.location.href = "dashboard.html";
  } catch (error) {
    errorMessage.textContent = "Erro: " + error.message;
  }
});

goToRegisterBtn.addEventListener("click", () => {
  window.location.href = "cadastro.html";
});

// Mostrar formulário de recuperação ao clicar em "Esqueci a senha"
forgotPasswordBtn.addEventListener("click", () => {
  resetPasswordForm.style.display = "block";
  forgotPasswordBtn.style.display = "none";
  form.style.display = "none";
  goToRegisterBtn.style.display = "none";
  errorMessage.textContent = "";
});

// Cancelar recuperação e voltar para login
cancelResetBtn.addEventListener("click", () => {
  resetPasswordForm.style.display = "none";
  forgotPasswordBtn.style.display = "block";
  form.style.display = "block";
  goToRegisterBtn.style.display = "inline-block";
  errorMessage.textContent = "";
  resetPasswordForm.reset();
});

// Enviar e-mail de recuperação
resetPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = resetEmailInput.value;
  errorMessage.style.color = "red";
  errorMessage.textContent = "";

  try {
    await auth.sendPasswordResetEmail(email);
    errorMessage.style.color = "green";
    errorMessage.textContent =
      "E-mail de recuperação enviado! Verifique sua caixa de entrada.";
    resetPasswordForm.style.display = "none";
    forgotPasswordBtn.style.display = "inline-block";
    form.style.display = "block";
    goToRegisterBtn.style.display = "inline-block";
    resetPasswordForm.reset();
  } catch (error) {
    errorMessage.textContent = "Erro: " + error.message;
  }
});
