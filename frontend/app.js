const apiUrl = "https://saxi2tjxm5.execute-api.us-east-1.amazonaws.com/dev/orders";

const cognitoDomain = "https://p3orderapp-login-mrugdha.auth.us-east-1.amazoncognito.com";
const clientId = "1vpe2c7sf3ss712v9qrigtvabi";
const redirectUri = "https://d28yw45nn3s9io.cloudfront.net";

const loginUrl =
  `${cognitoDomain}/login?client_id=${clientId}&response_type=token&scope=openid+email&redirect_uri=${encodeURIComponent(redirectUri)}`;

const logoutUrl =
  `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(redirectUri)}`;

function getTokensFromUrl() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);

  return {
    idToken: params.get("id_token"),
    accessToken: params.get("access_token")
  };
}

function saveTokens(tokens) {
  if (tokens.idToken) {
    localStorage.setItem("id_token", tokens.idToken);
  }
  if (tokens.accessToken) {
    localStorage.setItem("access_token", tokens.accessToken);
  }
}

function getStoredToken() {
  return localStorage.getItem("id_token");
}

function clearTokens() {
  localStorage.removeItem("id_token");
  localStorage.removeItem("access_token");
}

function cleanUrl() {
  if (window.location.hash) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

function ensureAuthUI() {
  let authBox = document.getElementById("authBox");

  if (!authBox) {
    authBox = document.createElement("div");
    authBox.id = "authBox";
    authBox.style.display = "flex";
    authBox.style.justifyContent = "space-between";
    authBox.style.alignItems = "center";
    authBox.style.marginBottom = "20px";
    authBox.style.gap = "10px";

    const status = document.createElement("div");
    status.id = "authStatus";

    const actions = document.createElement("div");
    actions.id = "authActions";
    actions.style.display = "flex";
    actions.style.gap = "10px";

    const container = document.querySelector(".container");
    container.insertBefore(authBox, container.firstChild);
    authBox.appendChild(status);
    authBox.appendChild(actions);
  }

  return authBox;
}

function renderAuthState() {
  ensureAuthUI();

  const authStatus = document.getElementById("authStatus");
  const authActions = document.getElementById("authActions");
  const token = getStoredToken();

  authActions.innerHTML = "";

  if (token) {
    authStatus.textContent = "Logged in";
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.type = "button";
    logoutBtn.onclick = () => {
      clearTokens();
      window.location.href = logoutUrl;
    };
    authActions.appendChild(logoutBtn);
  } else {
    authStatus.textContent = "Not logged in";
    const loginBtn = document.createElement("button");
    loginBtn.textContent = "Login / Sign Up";
    loginBtn.type = "button";
    loginBtn.onclick = () => {
      window.location.href = loginUrl;
    };
    authActions.appendChild(loginBtn);
  }
}

const tokensFromUrl = getTokensFromUrl();
if (tokensFromUrl.idToken || tokensFromUrl.accessToken) {
  saveTokens(tokensFromUrl);
  cleanUrl();
}

renderAuthState();

const orderForm = document.getElementById("orderForm");
const responseBox = document.getElementById("responseBox");

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = getStoredToken();

  if (!token) {
    responseBox.classList.remove("hidden");
    responseBox.textContent = "Please login first.";
    return;
  }

  const payload = {
    customerName: document.getElementById("customerName").value.trim(),
    email: document.getElementById("email").value.trim(),
    productName: document.getElementById("productName").value.trim(),
    quantity: Number(document.getElementById("quantity").value),
    address: document.getElementById("address").value.trim()
  };

  responseBox.classList.add("hidden");
  responseBox.textContent = "";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    responseBox.classList.remove("hidden");

    if (response.ok) {
      responseBox.textContent =
        `Order created successfully!\n\nOrder ID: ${data.orderId}\nInvoice Key: ${data.invoiceKey}`;
      orderForm.reset();
    } else {
      responseBox.textContent =
        `Error: ${data.message || "Something went wrong."}`;
    }
  } catch (error) {
    responseBox.classList.remove("hidden");
    responseBox.textContent = `Request failed: ${error.message}`;
  }
});