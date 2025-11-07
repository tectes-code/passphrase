let words = [];
let count = 3;
let maxLength = 11;

const wordlistURLs = {
  de: "words/de-de.txt",
  en: "words/en-en.txt"
};

async function loadWordList(url) {
  try {
    const output = document.getElementById("passphrase");
    output.textContent = "Lade Wortliste...";
    const response = await fetch(url);
    if (!response.ok) throw new Error("Fehler beim Laden der Wortliste");
    const text = await response.text();
    words = text.split(/\r?\n/).filter(w => w.trim().length > 0);
    generatePassphrase();
  } catch (err) {
    document.getElementById("passphrase").textContent = "⚠️ Fehler beim Laden";
    console.error(err);
  }
}

function generatePassphrase() {
  const output = document.getElementById("passphrase");

  if (!words.length) {
    output.textContent = "⚠️ Wortliste leer oder nicht geladen";
    return;
  }

  // Filter by length
  const filteredWords = words.filter(w => w.length <= maxLength);

  if (filteredWords.length < count) {
    output.textContent = `⚠️ Nur ${filteredWords.length} Wörter ≤ ${maxLength} Buchstaben verfügbar, ${count} benötigt.`;
    return;
  }

  const separator = document.getElementById("separator").value || ".";
  const capitalize = document.getElementById("capitalize").checked;
  const includeNumbers = document.getElementById("include-numbers").checked;

  // Pick unique words
  const shuffled = [...filteredWords].sort(() => 0.5 - Math.random());
  const chosenWords = shuffled.slice(0, count).map(w => {
    w = w.toLowerCase();
    if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
    if (includeNumbers && Math.random() < 0.3) w += Math.floor(Math.random() * 10);
    return w;
  });

  output.textContent = chosenWords.join(separator);
}

// --- UI Bindings ---
document.getElementById("refresh").onclick = generatePassphrase;
document.getElementById("copy-btn").onclick = () => {
  navigator.clipboard.writeText(document.getElementById("passphrase").textContent);
};

document.getElementById("minus").onclick = () => {
  count = Math.max(3, count - 1);
  document.getElementById("word-count").textContent = count;
  generatePassphrase();
};

document.getElementById("plus").onclick = () => {
  count++;
  document.getElementById("word-count").textContent = count;
  generatePassphrase();
};

document.getElementById("separator").addEventListener("input", generatePassphrase);
document.getElementById("capitalize").addEventListener("change", generatePassphrase);
document.getElementById("include-numbers").addEventListener("change", generatePassphrase);
document.getElementById("max-length").addEventListener("input", e => {
  maxLength = parseInt(e.target.value) || 11;
  generatePassphrase();
});

// Wordlist select
document.getElementById("wordlist-select").addEventListener("change", e => {
  const val = e.target.value;
  const customContainer = document.getElementById("custom-url-container");
  if (val === "custom") {
    customContainer.style.display = "flex";
    document.getElementById("wordlist-url").focus();
  } else {
    customContainer.style.display = "none";
    loadWordList(wordlistURLs[val]);
  }
});

// Custom URL
document.getElementById("wordlist-url").addEventListener("change", e => {
  const url = e.target.value.trim();
  if (url) loadWordList(url);
});

// Load default wordlist
window.addEventListener("DOMContentLoaded", () => {
  loadWordList(wordlistURLs.de);
});
