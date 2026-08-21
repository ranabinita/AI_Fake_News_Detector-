document.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chat-window");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const fakeNewsBtn = document.getElementById("fake-news-btn");
  const clickbaitBtn = document.getElementById("clickbait-btn");
  const spinner = document.getElementById("spinner");

  let currentMode = "fake-news"; // default mode

  const GOOGLE_API_KEY = "AIzaSyAGRze3-XVzoqyTOAaN_i9YMWVdq3WcwZM";
  const GOOGLE_CSE_ID = "d7dd7079a29664c29";

  function setMode(mode) {
    currentMode = mode;
    if (mode === "fake-news") {
      fakeNewsBtn.classList.add("active");
      clickbaitBtn.classList.remove("active");
      addMessage("📰 Switched to Fake News Detection mode. Enter a headline.", false);
    } else {
      clickbaitBtn.classList.add("active");
      fakeNewsBtn.classList.remove("active");
      addMessage("🚨 Switched to Clickbait Detection mode. Enter a headline.", false);
    }
    chatInput.value = "";
    chatInput.focus();
  }

  function addMessage(text, isUser = false) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${isUser ? "user-msg" : "ai-msg"}`;
    msgDiv.textContent = text;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function clearInput() {
    chatInput.value = "";
    chatInput.focus();
  }

  async function handleSend() {
    const query = chatInput.value.trim();
    if (!query) return;

    addMessage(query, true);
    addMessage(`🔍 Fetching related news and checking ${currentMode === "fake-news" ? "news authenticity..." : "clickbait..."}`, false);
    clearInput();

    spinner.classList.add("visible");
    sendBtn.disabled = true;

    try {
      const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=5&sort=date`;

      const googleResp = await fetch(googleUrl);
      if (!googleResp.ok) throw new Error(`Google API error: ${googleResp.status}`);
      const googleData = await googleResp.json();

      const googleResults = (googleData.items || []).map(item => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link
      }));

      const API_BASE_URL = "http://127.0.0.1:5000";
      const endpoint = "/api/check-news";

      const backendResp = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });

      if (!backendResp.ok) throw new Error(`Backend server error: ${backendResp.status}`);
      const backendData = await backendResp.json();

      // Remove "checking..." message
      if (chatWindow.lastChild && chatWindow.lastChild.textContent.startsWith("🔍")) {
        chatWindow.removeChild(chatWindow.lastChild);
      }

      if ((!backendData.results || backendData.results.length === 0) && googleResults.length === 0) {
        addMessage("⚠️ No results found for your query.", false);
        return;
      }

      // Show backend prediction results nicely
      const results = backendData.results || [];

      addMessage(currentMode === "fake-news" ? "📰 Fake News Detection Results:" : "🚨 Clickbait Detection Results:", false);

      results.forEach((item, i) => {
        const container = document.createElement("div");
        container.className = "ai-msg";
        container.style.marginBottom = "1rem";
        container.style.border = "1px solid #ccc";
        container.style.padding = "0.5rem";
        container.style.borderRadius = "6px";
        container.style.backgroundColor = "#fff";

        const titleEl = document.createElement("h4");
        titleEl.textContent = `${i + 1}. ${item.title}`;
        titleEl.style.marginBottom = "0.25rem";
        container.appendChild(titleEl);

        const snippetEl = document.createElement("p");
        snippetEl.textContent = item.snippet;
        snippetEl.style.marginTop = 0;
        snippetEl.style.marginBottom = "0.5rem";
        container.appendChild(snippetEl);

        const labelEl = document.createElement("span");
        labelEl.style.fontWeight = "bold";
        labelEl.style.padding = "0.15rem 0.5rem";
        labelEl.style.borderRadius = "12px";
        labelEl.style.color = "white";

        if (currentMode === "fake-news") {
          const detected = item.fakeNewsDetected;
          const confidenceRaw = item.fakeConfidence;
          const confidence = confidenceRaw !== null && confidenceRaw !== undefined
            ? (parseFloat(confidenceRaw) * 100).toFixed(1)
            : "N/A";

          if (detected) {
            labelEl.textContent = `Fake News (Confidence: ${confidence}%)`;
            labelEl.style.backgroundColor = "#dc3545"; // red
          } else {
            labelEl.textContent = `Not Fake (Confidence: ${confidence}%)`;
            labelEl.style.backgroundColor = "#198754"; // green
          }
        } else {
          const detected = item.isClickbait;
          const confidenceRaw = item.clickbaitConfidence;
          const confidence = confidenceRaw !== null && confidenceRaw !== undefined
            ? (parseFloat(confidenceRaw) * 100).toFixed(1)
            : "N/A";

          if (detected) {
            labelEl.textContent = `Clickbait (Confidence: ${confidence}%)`;
            labelEl.style.backgroundColor = "#dc3545"; // red
          } else {
            labelEl.textContent = `Not Clickbait (Confidence: ${confidence}%)`;
            labelEl.style.backgroundColor = "#198754"; // green
          }
        }
        container.appendChild(labelEl);

        chatWindow.appendChild(container);
      });

      if (googleResults.length > 0) {
        addMessage("🔎 Related Google News Articles:", false);

        googleResults.forEach((item, i) => {
          const container = document.createElement("div");
          container.className = "ai-msg";
          container.style.marginBottom = "1rem";
          container.style.border = "1px solid #ccc";
          container.style.padding = "0.5rem";
          container.style.borderRadius = "6px";
          container.style.backgroundColor = "#f1f1f1";

          const titleEl = document.createElement("h4");
          titleEl.textContent = `${i + 1}. ${item.title}`;
          titleEl.style.marginBottom = "0.25rem";
          container.appendChild(titleEl);

          const snippetEl = document.createElement("p");
          snippetEl.textContent = item.snippet;
          snippetEl.style.marginTop = 0;
          snippetEl.style.marginBottom = "0.5rem";
          container.appendChild(snippetEl);

          const linkEl = document.createElement("a");
          linkEl.href = item.link;
          linkEl.target = "_blank";
          linkEl.rel = "noopener noreferrer";
          linkEl.textContent = "Read More";
          linkEl.style.color = "#007bff";
          container.appendChild(linkEl);

          chatWindow.appendChild(container);
        });
      }
    } catch (err) {
      if (chatWindow.lastChild && chatWindow.lastChild.textContent.startsWith("🔍")) {
        chatWindow.removeChild(chatWindow.lastChild);
      }
      addMessage(`❌ Error: ${err.message}`, false);
    } finally {
      spinner.classList.remove("visible");
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", handleSend);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  });

  fakeNewsBtn.addEventListener("click", () => setMode("fake-news"));
  clickbaitBtn.addEventListener("click", () => setMode("clickbait"));

  setMode("fake-news");
});
