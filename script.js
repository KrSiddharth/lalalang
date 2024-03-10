const homeContainer = getEle("#homeContainer");
const translationDiv = getEle("#translationDiv");
const flashcardsContainer = getEle("#flashcardsContainer");
const nextBtn = getEle("#nextBtn");
const homeIcon = getEle("#homeIcon");
const flashcardsIcon = getEle("#flashcardsIcon");
const appContainer = getEle("#appContainer");
const setupScreen = getEle('#setupScreen');
const customConsole = getEle('#console');
const storiesContainer = getEle("#storiesContainer");
const storyEndContainer = getEle("#storyEndContainer");
const languageSelector = getEle("#languageSelector");
const translationPrompt = getEle("#translationPrompt");

let displayId = 'HOME'; // HOME, STORY, FLASHCARDS
let narrationVoice;
appContainer.style.display = "none";

const isAndroid = /android/i.test(navigator.userAgent);
const isBraveBrowser = (navigator.brave && navigator.brave.isBrave() || false);
if (isAndroid) {
    const elements = getEle('.setup-img-refs');

    elements.forEach(element => {
        element.style.display = 'block';
    });
}

if (isBraveBrowser) {
    nextBtn.classList.add('nextBtn-height')
}

// Custom error handling function
function handleCustomError(errorArgs) {
    // Perform actions based on the errorArgs
    customConsole.innerHTML += `<div>${errorArgs.reduce((acc, err) => acc + err, '')}</div>`
}


const urlSearchParams = new URLSearchParams(window.location.search);
const isDevMode = urlSearchParams.has('dev');
if (isDevMode) {
    customConsole.style.display = "block";
    // Create a variable to store the original console.error function
    const originalConsoleError = console.error;

    // Override console.error
    console.error = function (...args) {
        // Call the original console.error function
        originalConsoleError.apply(console, args);

        // Your custom error handling logic here
        handleCustomError(args);
    };
}

document.addEventListener('DOMContentLoaded', function () {
    const lsSelectedLanguage = localStorage.getItem("lsSelectedLanguage");
    const htmlElement = document.documentElement;
    console.log(lsSelectedLanguage)
    if (lsSelectedLanguage) {
        htmlElement.setAttribute('lang', lsSelectedLanguage);
        languageSelector.style.display = "none";
        checkForBrowserTranslation();
    } else {
        languageSelector.style.display = "flex";
        const langArr = Object.values(LANGUAGE_MAP);
        const dropdownSelect = getEle('#langDropdownSelect');

        langArr.forEach(({ name, nativeName, abbr }) => {
            const optionElement = document.createElement('option');
            optionElement.value = abbr;
            optionElement.textContent = `${name} ${nativeName}`;
            dropdownSelect.appendChild(optionElement);
        });

        dropdownSelect.addEventListener('change', function () {
            const selectedValue = dropdownSelect.value;
            localStorage.setItem("lsSelectedLanguage", selectedValue);
            languageSelector.style.display = "none";
            htmlElement.setAttribute('lang', selectedValue);
            console.log(htmlElement.getAttribute('lang'));

            checkForBrowserTranslation();
        });
    }
});



let sentenceIndex = -1;
let sentenceArr = [];

const init = () => {
    const lsSelectedLanguage = localStorage.getItem("lsSelectedLanguage");
    const selectedLangData = LANGUAGE_MAP[lsSelectedLanguage];
    let voice;
    const setVoice = () => {
        const langIds = selectedLangData.langVoiceIds;
        const voices = speechSynthesis.getVoices();
        console.log(voices);

        const prefferedVoiceNames = selectedLangData.prefferedVoices;
        voice = voices.find(
            (v) => prefferedVoiceNames.indexOf(v.name) !== -1
        );

        if (!voice) {
            voice = voices.find((v) => langIds.indexOf(v.lang) !== -1);
        }

        let voiceList = voices.reduce((acc, { lang, name }) => acc + `<div>${lang} ### ${name}`, '');
        const narrationPrompt = getEle('#narrationPrompt');
        if (voice) {
            voiceList += `<div>Voice - ${voice.lang} $$$ ${voice.name}</div>`;
            narrationPrompt.style.display = "none";
        } else {
            narrationPrompt.style.display = "block";
            const learningLanguageDisplayTexts = getEle('.learningLanguageDisplayText');
            learningLanguageDisplayTexts.forEach(ele => ele.innerHTML = ` ${selectedLangData.name} `)
        }
        const customConsole = getEle('#console');
        if (customConsole) {
            customConsole.innerHTML += voiceList;
        }

        narrationVoice = voice;

        console.log({ voice });
    }
    setVoice();
    speechSynthesis.onvoiceschanged = setVoice;

    const lsSentenceArr = localStorage.getItem("lsSentenceArr") || `[]`;
    sentenceArr = JSON.parse(lsSentenceArr);
    sentenceIndex = localStorage.getItem("lsSentenceIndex") || -1;

    if (sentenceArr.length) {
        --sentenceIndex;
        extractWords();
        renderView('STORY');
    } else {
        renderView('HOME');
    }
}

const populateStoryTiles = () => {
    const lsSelectedLanguage = localStorage.getItem("lsSelectedLanguage");
    const stories = LA_LA_LANG_STORIES[lsSelectedLanguage];
    const tilesHTML = stories.reduce((acc, curr) => {
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
    storiesContainer.innerHTML = tilesHTML;
}


const checkForBrowserTranslation = () => {
    // check whether browser translation has been turned on
    translationPrompt.style.display = "block";
    const lsSelectedLanguage = localStorage.getItem("lsSelectedLanguage");
    const translationTriggerText = getEle("#translationTriggerText");
    const browserTranslationEnabledTestText = getEle("#browserTranslationEnabledTestText");

    const langData = LANGUAGE_MAP[lsSelectedLanguage];
    translationTriggerText.innerHTML = langData.translationTriggerText;
    browserTranslationEnabledTestText.innerHTML = langData.testWord;


    const browserTranslationCheckInterval = setInterval(() => {
        const translatedWord = browserTranslationEnabledTestText.innerText.toLocaleLowerCase();
        console.log('checking browser translation', translatedWord)
        if (customConsole) {
            customConsole.innerHTML += `<div>Browser translated word - ${translatedWord}</div>`
        }

        if (['dictionary'].indexOf(translatedWord) !== -1) {
            appContainer.style.display = "block";
            setupScreen.style.display = "none";
            clearInterval(browserTranslationCheckInterval)
            init();
        }
    }, 1000)
}

homeIcon.addEventListener("click", () => renderView('HOME'));
flashcardsIcon.addEventListener("click", () => renderView('FLASHCARDS'));

function toggleCollapsible(collapsibleId, keepItOpen = false) {
    var collapsibleContent = getEle(`#${collapsibleId}`);
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

const renderView = (viewId) => {
    homeContainer.style.display = "none";
    translationDiv.style.display = "none";
    nextBtn.style.display = "none";
    flashcardsContainer.style.display = "none";
    storyEndContainer.style.display = "none";
    scrollToTop();
    if (viewId !== 'STORY') {
        speechSynthesis.cancel();
    }
    switch (viewId) {
        case 'HOME':
            displayId = 'HOME';
            homeContainer.style.display = "block";

            const lsSelectedLanguage = localStorage.getItem("lsSelectedLanguage");
            const learningLangInput = getEle("#learningLangInput");
            learningLangInput.placeholder = `Enter ${LANGUAGE_MAP[lsSelectedLanguage].name} text`;

            populateStoryTiles();
            break;
        case 'STORY':
            translationDiv.style.display = "block";
            nextBtn.style.display = "block";
            displayId = 'STORY';
            break;
        case 'FLASHCARDS':
            flashcardsContainer.style.display = "block";
            displayId = 'FLASHCARDS';
            setupFlashcards();
            break;
        case 'STORY_END':
            storyEndContainer.style.display = "block";
            displayId = 'STORY_END';
            break;
        default:
            break;
    }
}

let flashcardChooser;

const setupFlashcards = () => {
    const lsFlashcards = localStorage.getItem("lsFlashcards") || `[]`;
    const flashcardsArr = JSON.parse(lsFlashcards);
    flashcardChooser = randomNoRepeats(flashcardsArr);
    renderFlashcard();

}

const renderFlashcard = () => {
    const word = flashcardChooser();

    console.log(word);
    if (word) {
        nextBtn.style.display = "block";
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

    const wikiPageActionIcon = getEle('.wikiPageActionIcon', true);
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

    const wikiPageActionIcon = getEle('#flashcardsContainer .wikiPageActionIcon', true);

    wikiPageActionIcon.innerHTML = `<object data="./assets/icons/add.svg" type="image/svg+xml">
</object>`;
    wikiPageActionIcon.addEventListener('click', () => addToFlashcards(word))
}

const handleUserInput = () => {
    const learningLangInput = getEle("#learningLangInput");
    createDictionary(learningLangInput.value);
}


const handleStoryClick = (storyId) => {
    const lsSelectedLanguage = localStorage.getItem("lsSelectedLanguage");
    const stories = LA_LA_LANG_STORIES[lsSelectedLanguage];
    const story = stories.find(({ id }) => id === storyId);
    createDictionary(story.text);

}

async function createDictionary(text) {
    sentenceIndex = -1;
    localStorage.setItem("lsSentenceIndex", -1);

    sentenceArr = text.split(".");
    sentenceArr = sentenceArr.filter(arr => arr);
    localStorage.setItem("lsSentenceArr", JSON.stringify(sentenceArr));
    extractWords();
    renderView('STORY');
}

function extractWords() {
    // const existingDictionary = getEle("dictionaryMap");
    // existingDictionary.innerHTML = "";

    const wikiPage = getEle("#wikiPage");
    wikiPage.innerHTML = "Click on a word to see its Wikitonary page.";
    const words = [];
    localStorage.setItem("lsSentenceIndex", ++sentenceIndex);
    if (sentenceIndex + 1 === sentenceArr.length) {
        localStorage.setItem("lsSentenceIndex", -1);
        localStorage.setItem("lsSentenceArr", JSON.stringify([]));
        renderView('STORY_END');
    } else {
        const text = sentenceArr[sentenceIndex];
        let tableHtml = "";
        let originalWord = "";
        if (text) {
            const utterThis = new SpeechSynthesisUtterance(text);
            utterThis.voice = narrationVoice;
            const learningLangDiv = getEle("#learningLangText");
            const knownLangDiv = getEle("#knownLangText");
            const browserTranslationTriggerTest = getEle('#browserTranslationTriggerTest');
            browserTranslationTriggerTest.innerHTML = BROWSER_TRANSLATION_TRIGGER_TEXT;
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
                                    <div class="notranslate cell" onclick="renderWikiPage('${originalWord}')">
                                        ${originalWord}
                                    </div>
                                    <div class="cell">${originalWord}</div>
                                 </div>`;
                }
            });
            if (narrationVoice) {
                speechSynthesis.speak(utterThis);
            }
        }
        // const dictionaryMap = getEle("dictionaryMap");
        // dictionaryMap.innerHTML = tableHtml;
    }
}

const learningLangDiv = getEle("#learningLangText");
console.log({ learningLangDiv });

learningLangDiv.addEventListener("click", (event) => {
    renderWikiPage(event.target.innerHTML);
});

async function renderWikiPage(word, isFlashcard = false) {
    toggleCollapsible('collapsibleWikitionary', true);
    let wikiPage = getEle("#wikiPage");
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
        const lsSelectedLanguage = localStorage.getItem("lsSelectedLanguage");
        const selectedLangData = LANGUAGE_MAP[lsSelectedLanguage];
        const selectedLanguageName = selectedLangData.name;

        const headline = body.querySelector(`#${selectedLanguageName}`);
        if (headline) {
            const section = headline.closest("section");
            section.classList.add("notranslate");

            if (isFlashcard) {
                section.classList.add("blurText");

                section.addEventListener("click", () => {
                    section.classList.remove("blurText");
                });
            }
            const audios = section.getElementsByTagName("audio");
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
            const imgs = section.getElementsByTagName("img");
            if (imgs?.[0]) {
                Array.from(imgs).forEach((img) => {
                    console.log(img);
                    let src = img.getAttribute("src");
                    img.setAttribute("src", `https:${src}`);
                });
            }
            wikiPage.innerHTML = "";
            wikiPage.appendChild(header);
            wikiPage.appendChild(section);
        }
    } else {
        wikiPage.innerHTML = "Something went wrong :(";
    }
}

const knownLangText = getEle("#knownLangText");

knownLangText.addEventListener("click", () => {
    knownLangText.classList.remove("blurText");
});

nextBtn.addEventListener("click", () => {
    speechSynthesis.cancel();
    if (displayId === 'FLASHCARDS') {
        renderFlashcard();
    } else {
        extractWords();
    }
});

const modal = getEle('#modal');
const overlay = getEle('#overlay');

function openModal() {
    modal.style.display = 'block';
    overlay.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    overlay.style.display = 'none';
}

