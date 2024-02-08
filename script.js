// const inputDiv = document.getElementById("inputDiv");
const homeContainer = document.getElementById("homeContainer");
const translationDiv = document.getElementById("translationDiv");
const nextBtn = document.getElementById("nextBtn");
const homeIcon = document.getElementById("homeIcon");

homeIcon.addEventListener("click", resetToHome);

function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
}

function toggleCollapsible(collapsibleId, keepItOpen = false) {
    var collapsibleContent = document.getElementById(collapsibleId);
    const isContentVisible = collapsibleContent.style.display === 'block';
    if (isContentVisible && keepItOpen) {
    } else {
        collapsibleContent.style.display = (isContentVisible) ? 'none' : 'block';

        const collapsibleContainer = collapsibleContent.closest('.collapsible-container');
        const collapsibleHeading = collapsibleContainer.querySelector('.collapsible-heading');

        if (collapsibleContent.style.display === 'block') {
            collapsibleHeading.textContent = `- ${collapsibleHeading.textContent.slice(2)}`;
        } else {
            collapsibleHeading.textContent = `+ ${collapsibleHeading.textContent.slice(2)}`;
        }
    }
}

// populate story tiles
console.log(laLaLangStories);
const tilesHTML = laLaLangStories.reduce((acc, curr, index) => {
    return (
        acc +
        `<div class="storyTile" data-story-id=${curr.id} onclick="handleStoryClick(${curr.id})">
                  <div>
                    <img src="${curr.imgUrl}" />
                  </div>
                  <div class="m-y-10">${curr.title.toLowerCase()}</div>
                </div>`
    );
}, "");

const storiesContainer = document.getElementById("storiesContainer");
storiesContainer.innerHTML = tilesHTML;

function resetToHome() {
    homeContainer.style.display = "block";
    translationDiv.style.display = "none";
    nextBtn.style.display = "none";
    scrollToTop();
}

function openReader() {
    homeContainer.style.display = "none";
    translationDiv.style.display = "block";
    nextBtn.style.display = "block";
    scrollToTop();
}

// let sentenceIndex = -1;
// let sentenceArr = [];
const voices = speechSynthesis.getVoices();
let voice;

const lsSentenceArr = localStorage.getItem("lsSentenceArr") || `[]`;
let sentenceArr = JSON.parse(lsSentenceArr);

let sentenceIndex = localStorage.getItem("lsSentenceIndex") || -1;

if (sentenceArr.length) {
    --sentenceIndex;
    extractWords();
    openReader();
} else {
    resetToHome();
}

speechSynthesis.onvoiceschanged = () => {
    console.log("voices changed");
    const voices = speechSynthesis.getVoices();
    voice = voices.find(
        (v) => v.name === "Microsoft Henri Online (Natural) - French (France)"
    );

    if (!voice) {
        voice = voices.find((v) => v.lang === "fr_FR");
    }
};

console.log(voice);

const handleUserInput = () => {
    const paragraphInput = document.getElementById("paragraphInput").value;
    createDictionary(paragraphInput);
}


const handleStoryClick = (storyId) => {
    const story = laLaLangStories.find(({ id }) => id === storyId);
    createDictionary(story.text);

}

async function createDictionary(text) {
    sentenceIndex = -1;
    localStorage.setItem("lsSentenceIndex", -1);

    sentenceArr = text.split(".");
    localStorage.setItem("lsSentenceArr", JSON.stringify(sentenceArr));
    extractWords();
    openReader();
}

function extractWords() {
    const existingDictionary = document.getElementById("dictionaryMap");
    existingDictionary.innerHTML = "";

    const wikiPage = document.getElementById("wikiPage");
    wikiPage.innerHTML = "Click on a word to see its Wikitonary page.";
    const words = [];
    localStorage.setItem("lsSentenceIndex", ++sentenceIndex);
    const text = sentenceArr[sentenceIndex];
    let tableHtml = "";
    let originalWord = "";
    if (text) {
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.voice = voice;
        const learningLangDiv = document.getElementById("learningLangText");
        const knownLangDiv = document.getElementById("knownLangText");
        knownLangDiv.classList.add("blurText");
        knownLangDiv.innerHTML = text;
        learningLangDiv.innerHTML = text
            .split(" ")
            .map((word) => `<span>${word} </span>`)
            .join("");
        text.split(/\s+/).forEach((word, j) => {
            word = word.replace(/[[.,\]]/g, "").toLowerCase();
            originalWord = word;
            if (word.indexOf("'") !== -1) {
                word = word.split("'")[1];
            }
            if (
                // lsWordsArr.indexOf(word) === -1 &&
                word &&
                words.indexOf(word) === -1 &&
                ["!", "?", "-"].indexOf(word) === -1
            ) {
                words.push(word);

                tableHtml += `<div class="column">
                <div class="notranslate cell">${originalWord}</div>
                <div class="cell">${originalWord}</div>
                </div>`;
            }
        });
        if (voice) {
            speechSynthesis.speak(utterThis);
        }
    }
    const dictionaryMap = document.getElementById("dictionaryMap");
    dictionaryMap.innerHTML = tableHtml;
}

const learningLangDiv = document.getElementById("learningLangText");

async function renderWikiPage(word) {
    toggleCollapsible('collapsibleWikitionary', true);
    const wikiPage = document.getElementById("wikiPage");
    wikiPage.innerHTML = "Loading...";
    const response = await fetch(
        `https://en.wiktionary.org/api/rest_v1/page/mobile-html/${word}`
    );
    console.log(response.ok);
    if (response.ok) {
        const html = await response.text();
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        console.log(doc);
        const body = doc.getElementById("pcs");
        const anchorTags = body.querySelectorAll("a");
        anchorTags.forEach((aTag) => {
            let href = aTag.getAttribute("href");
            href = href.replace(".", "");
            aTag.setAttribute("href", `https://en.wiktionary.org/wiki${href}`);
            aTag.setAttribute("target", "_blank");
        });
        const header = body.getElementsByTagName("header")[0];
        header.classList.add("notranslate");
        const frenchHeadline = body.querySelector("#French");
        if (frenchHeadline) {
            const frenchSection = frenchHeadline.closest("section");
            frenchSection.classList.add("notranslate");
            const audios = frenchSection.getElementsByTagName("audio");
            if (audios?.[0]) {
                let audioLink = audios[0].getAttribute("resource");
                audioLink = audioLink.replace(".", "");
                audios[0].setAttribute(
                    "resource",
                    `https://en.wiktionary.org/wiki${audioLink}`
                );
                const sources = audios[0].getElementsByTagName("source");
                Array.from(sources).forEach((source) => {
                    console.log(source);
                    let src = source.getAttribute("src");
                    source.setAttribute("src", `https:${src}`);
                });
            }
            const imgs = frenchSection.getElementsByTagName("img");
            if (imgs?.[0]) {
                Array.from(imgs).forEach((img) => {
                    console.log(img);
                    let src = img.getAttribute("src");
                    img.setAttribute("src", `https:${src}`);
                });
            }
            wikiPage.innerHTML = "";
            wikiPage.appendChild(header);
            wikiPage.appendChild(frenchSection);
        }
    }
}

learningLangDiv.addEventListener("click", (event) => {
    renderWikiPage(event.target.innerHTML);
});

const knownLangText = document.getElementById("knownLangText");

knownLangText.addEventListener("click", () => {
    knownLangText.classList.remove("blurText");
});