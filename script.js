// const inputDiv = document.getElementById("inputDiv");
const homeContainer = document.getElementById("homeContainer");
const translationDiv = document.getElementById("translationDiv");
const flashcardsContainer = document.getElementById("flashcardsContainer");
const nextBtn = document.getElementById("nextBtn");
const homeIcon = document.getElementById("homeIcon");
const flashcardsIcon = document.getElementById("flashcardsIcon");
const appContainer = document.getElementById("appContainer");
const setupScreen = document.getElementById('setupScreen');

let displayId = 'HOME'; // HOME, STORY, FLASHCARDS
appContainer.style.display = "none";

const isAndroid = /android/i.test(navigator.userAgent);
if (isAndroid) {
    const elements = document.querySelectorAll('.setup-img-refs');

    elements.forEach(element => {
        element.style.display = 'block';
    });
}


const urlSearchParams = new URLSearchParams(window.location.search);
const isDevMode = urlSearchParams.has('dev');
if (isDevMode) {
    const customConsole = document.getElementById('console');
    customConsole.style.display = "block";
}


let sentenceIndex = -1;
let sentenceArr = [];

const init = () => {
    const lsSentenceArr = localStorage.getItem("lsSentenceArr") || `[]`;
    sentenceArr = JSON.parse(lsSentenceArr);

    sentenceIndex = localStorage.getItem("lsSentenceIndex") || -1;

    if (sentenceArr.length) {
        --sentenceIndex;
        extractWords();
        openReader();
    } else {
        resetToHome();
    }
}



// check whether browser translation has been turned on
const browserTranslationCheckInterval = setInterval(() => {
    const browserTranslationEnabledTestText = document.getElementById("browserTranslationEnabledTestText");
    const translatedWord = browserTranslationEnabledTestText.innerText.toLocaleLowerCase();
    console.log('checking browser translation', translatedWord)
    if (['hello', 'good day'].indexOf(translatedWord) !== -1) {
        appContainer.style.display = "block";
        setupScreen.style.display = "none";
        clearInterval(browserTranslationCheckInterval)
        init();
    }
}, 1000)

homeIcon.addEventListener("click", resetToHome);
flashcardsIcon.addEventListener("click", openFlashcards);

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
                  <div class="m-y-10 notranslate">${curr.title.toLowerCase()}</div>
                </div>`
    );
}, "");

const storiesContainer = document.getElementById("storiesContainer");
storiesContainer.innerHTML = tilesHTML;

function resetToHome() {
    homeContainer.style.display = "block";
    translationDiv.style.display = "none";
    nextBtn.style.display = "none";
    flashcardsContainer.style.display = "none";
    displayId = 'HOME';
    scrollToTop();
}

function openReader() {
    homeContainer.style.display = "none";
    translationDiv.style.display = "block";
    nextBtn.style.display = "block";
    flashcardsContainer.style.display = "none";
    displayId = 'STORY';
    scrollToTop();
}

function openFlashcards() {
    homeContainer.style.display = "none";
    translationDiv.style.display = "none";
    nextBtn.style.display = "block";
    flashcardsContainer.style.display = "block";
    displayId = 'FLASHCARDS';
    scrollToTop();
    renderFlashcardWord();
}

const renderFlashcardWord = () => {
    const lsFlashcards = localStorage.getItem("lsFlashcards") || `[]`;
    const flashcardsArr = JSON.parse(lsFlashcards);

    const word = flashcardsArr[Math.floor(Math.random() * flashcardsArr.length)];

    console.log(word);
    if (word) {
        renderWikiPage(word, true)
    } else {
        flashcardsContainer.innerHTML = 'Add words to flashcards';
    }

}


const addToFlashcards = (word) => {
    const lsFlashcards = localStorage.getItem("lsFlashcards") || `[]`;
    const flashcardsArr = JSON.parse(lsFlashcards);
    if (flashcardsArr.indexOf(word) === -1) {
        flashcardsArr.push(word);
        localStorage.setItem("lsFlashcards", JSON.stringify(flashcardsArr));
    }

    const wikiPageActionIcon = document.querySelector('.wikiPageActionIcon');
    wikiPageActionIcon.innerHTML = `<object data="./assets/icons/done.svg" type="image/svg+xml">
</object>`;
}

const removeFromFlashcard = (word) => {
    const lsFlashcards = localStorage.getItem("lsFlashcards") || `[]`;
    const flashcardsArr = JSON.parse(lsFlashcards);

    const wordIndex = flashcardsArr.indexOf(word);
    if (wordIndex > -1) { // only splice array when item is found
        flashcardsArr.splice(wordIndex, 1); // 2nd parameter means remove one item only
    }

    localStorage.setItem("lsFlashcards", JSON.stringify(flashcardsArr));
    console.log(flashcardsArr);

    const wikiPageActionIcon = document.querySelector('#flashcardsContainer .wikiPageActionIcon');
    wikiPageActionIcon.innerHTML = `<object data="./assets/icons/add.svg" type="image/svg+xml">
</object>`;
    wikiPageActionIcon.addEventListener('click', () => addToFlashcards(word))
}

let voice;
const setVoice = () => {
    const langIds = ["fr-FR", "fr_FR"]
    const voices = speechSynthesis.getVoices();
    console.log(voices);

    const prefferedVoiceNames = ['Microsoft Henri Online (Natural) - French (France)', 'Microsoft Paul - French (France)'];
    voice = voices.find(
        (v) => prefferedVoiceNames.indexOf(v.name) !== -1
    );

    if (!voice) {
        voice = voices.find((v) => langIds.indexOf(v.lang) !== -1);
    }

    let voiceList = voices.reduce((acc, { lang, name }) => acc + `<div>${lang} ### ${name}`, '');
    if (voice) {
        voiceList += `<div>Voice - ${voice.lang} $$$ ${voice.name}</div>`;
    }
    const customConsole = document.getElementById('console');
    if (customConsole) {
        customConsole.innerHTML = voiceList;
    }
}
setVoice();
speechSynthesis.onvoiceschanged = setVoice;

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

async function renderWikiPage(word, isFlashcard = false) {
    toggleCollapsible('collapsibleWikitionary', true);
    let wikiPage = document.getElementById("wikiPage");
    if (isFlashcard) {
        wikiPage = flashcardsContainer;
    }
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
        const headerIconAction = isFlashcard ? 'removeFromFlashcard' : 'addToFlashcards';
        const headerIcon = isFlashcard ? 'delete' : 'add';
        header.innerHTML += `<div  class="wikiPageActionIcon" onclick="${headerIconAction}('${word}')"><object data="./assets/icons/${headerIcon}.svg" type="image/svg+xml">
        <img src="yourfallback.jpg" />
      </object></div>`;
        const frenchHeadline = body.querySelector("#French");
        if (frenchHeadline) {
            const frenchSection = frenchHeadline.closest("section");
            frenchSection.classList.add("notranslate");

            if (isFlashcard) {
                frenchSection.classList.add("blurText");

                frenchSection.addEventListener("click", () => {
                    frenchSection.classList.remove("blurText");
                });
            }
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

nextBtn.addEventListener("click", () => {
    if (displayId === 'FLASHCARDS') {
        renderFlashcardWord();
    } else {
        extractWords();
    }
});
