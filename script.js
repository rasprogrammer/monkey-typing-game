// 
const modeElement = document.querySelector('.mode');
const detailsElement = document.querySelector('.mode-setting');

const textContent = "Filler text is text that shares some characteristics of a real written text, but is random or otherwise generated. It may be used to display a sample of fonts, generate text for testing, or to spoof an e-mail spam filter.";
let textContentArray = textContent.split(" ");

let selectedMode = "";
let selectedModeOption = "";
let lastTypingTime = null;
let timerInterval = null;

let startTyping = false;
// mode : mode-details
const setting = {
    "Time": {
        15: 15, 30: 30, 45: 45, 60: 60
    }, 
    "Word": {
        10: 10
    },
    "Quote": {

    },
    "Zen": {

    },
    "Custom": {

    }
}

function showSettings(mode) {
    modeElement.innerHTML = generateMode(mode);
    detailsElement.innerHTML = generateModeDetails(mode);
}

function generateMode(mode) {
    let modeHTML = "";
    for (const modeName in setting) {
        modeHTML += `<div class="text-center modeButton ${mode === modeName ? "active": ""}">${modeName}</div>`;
    }
    return modeHTML;
}

function generateModeDetails(mode, select = null) {
    const details = setting[mode];
    const optionName = `mode-${mode}`;
    
    // Retrieve previous selection from localStorage
    let selectedModeDetails = localStorage.getItem(optionName);

    // If a new selection is provided, override and store it
    if (select) {
        selectedModeDetails = select;
        localStorage.setItem(optionName, select);
    } else {
        // If no selection exists yet, default to first available option
        if (!selectedModeDetails && Object.keys(details).length > 0) {
            selectedModeDetails = Object.keys(details)[0];
            localStorage.setItem(optionName, selectedModeDetails);
        }
    }

    // Generate HTML
    let detailsHTML = `<div class="modeDetails d-flex justify-content-md-start justify-content-center align-items-center">`;

    for (const detailOption in details) {
        const isActive = detailOption === selectedModeDetails ? "active" : "";
        if (isActive) 
            selectedModeOption = detailOption;
        detailsHTML += `<div class="text-center modeDetailsButton ${isActive}">${detailOption}</div>`;
    }

    detailsHTML += `</div>`;
    return detailsHTML;
}



function selectMode(mode = "Time") {
    showSettings(mode);
    selectedMode = mode;
}

selectMode();


document.querySelector('.setting').addEventListener('click', (e) => {
    const btn = e.target;
    if (e.target.classList.contains('modeButton')) {
        selectMode(btn.textContent);
    } else if (e.target.classList.contains('modeDetailsButton')) {

        const mode = document.querySelector('.mode .modeButton.active');
        if (!mode) return;
        const modeName = mode.textContent;
        detailsElement.innerHTML = generateModeDetails(modeName, btn.textContent);
        
    }
});

function updateTypingBody(content) {
    document.querySelector("#typing-body").innerHTML = content;
}

function showTimerUI(time) {
    document.querySelector('#timer').innerHTML = time;
}

function startTimer() {
    if (timerInterval) return;
    let timeInc = parseInt(selectedModeOption);

    // just for result purpose 
    lastTypingTime = timeInc; 

    if (selectedMode == "Time" && timeInc > 0) {
        timerInterval = setInterval(() => {
            showTimerUI(timeInc);
            if (timeInc <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                finishTyping();
            }
            timeInc--;
        }, 1000);
    }
}

function finishTyping() {
    const data = calculateWordsData();
    const accuracy = ((data.correctwords / data.totalwords) * 100 );
    const typingTime = lastTypingTime;
    const speed = ((data.totalwords / typingTime) * 60);
    const html = createResultTemplate(data, speed, accuracy, typingTime);
    updateTypingBody(html);
}

function createResultTemplate(data, speed, accuracy, typingTime) {
    return `
        <div class="d-flex justify-content-center align-items-center fs-2 p-5"> 
            <table>
                <tr>
                    <td>Speed : </td>
                    <td>${speed} WPH</td>
                </tr>
                <tr>
                    <td>Accuracy : </td>
                    <td>${accuracy.toFixed(2)}%</td>
                </tr>
                <tr>
                    <td>Time : </td>
                    <td>${typingTime} Sec</td>
                </tr>
                <tr>
                    <td>Total Words : </td>
                    <td>${data.totalwords}</td>
                </tr>
                <tr>
                    <td>Correct Words : </td>
                    <td>${data.correctwords}</td>
                </tr>
                <tr>
                    <td>Incorrect Words : </td>
                    <td>${data.incorrectwords}</td>
                </tr>
            </table>
        </div>
    `;
}

function calculateWordsData() {
    const data = {
        totalwords: 0,
        correctwords: 0,
        incorrectwords: 0,
        totalletters: 0,
        correctletters: 0,
        incorrectletters: 0
    };

    const words = document.querySelectorAll('.word.typed');
    words.forEach(word => {
        const letters = word.children;
        for (const letter of letters) {
            if (letter.classList.contains('correct')) {
                data.correctletters++;
            } 
            // else if (letter.classList.contains('incorrect')) {
                // data.incorrectletters++;
                // wrongword = true; }
            else {
                data.incorrectletters++;
            }
            data.totalletters++;
        }
        if (word.classList.contains('wrong')) {
            data.incorrectwords++;
        } else {
            data.correctwords++;
        }
        data.totalwords++;
    })

    return data;
}

// ====== Load Typing Content ========
function updateTypingContent(content) {
    document.getElementById('typing-content').innerHTML = content;
}

function loadTextContent() {
    let wordsHTML = "";
    let active = true;
    textContentArray.forEach((letters) => {
        wordsHTML += `<div class="word ${active ? 'active' : ''}">`;
        active = false;
        for(let i = 0; i < letters.length; i++) {
            const letter = letters[i];
            wordsHTML += `<letter>${letter}</letter>`;
        }
        wordsHTML += `</div>`;
    })
    updateTypingContent(wordsHTML);
}

loadTextContent();

// ======== Typing Feature ========
function getActiveWord() {
    return document.querySelector('.word.active');
}

function focusTypingCursor() {
    const word = getActiveWord();
    if (!word) return;

    let letterIndex = 0;
    for (const letter of word.children) {
        const lastLetterIndex = word.children.length - 1;
        if (!letter.classList.contains('correct') && !letter.classList.contains('incorrect')) {
            focusLetter(letter);
            return;
        } else {
            removeFocusLetter(letter);
        }
        if (letterIndex === lastLetterIndex) {
            focusEndLetter(letter);
        }
        letterIndex++;
    }
}

function focusEndLetter(element) {
    element.classList.add('focus-end');
}

function removeFocusEndLetter(element) {
    element.classList.remove('focus-end');
}

function focusLetter(element) {
    removeFocusLetter(element);
    element.classList.add('focus');
}

function removeFocusLetter(element) {
    element.classList.remove('focus');
}

function clearFocusFromInactiveWords() {
    const words = document.querySelectorAll('.word:not(.active)');
    for (const word of words) {
        for (const letter of word.children) {
            removeFocusLetter(letter);
        }
    }
}

function matchKeyPressToOriginal(value) {
    const word = getActiveWord();
    if (!word) return;

    for (const letter of word.children) {
        if (!letter.classList.contains('correct') && !letter.classList.contains('incorrect')) {
            const expected = letter.textContent.trim();
            letter.classList.remove('correct', 'incorrect');
            letter.classList.add(value === expected ? 'correct' : 'incorrect');
            break;
        }
    }
}

function isWordComplete(word) {
    return [...word.children].every(letter =>
        letter.classList.contains('correct') || letter.classList.contains('incorrect')
    );
}

function markWrongWord(word) {
    for(const letter of word.children) {
        letter.classList.remove('focus');
        if (letter.classList.length < 1 || letter.classList.contains('incorrect')) {
            word.classList.add('wrong');
            return;
        }
    }
}

function switchToNextWord() {
    const currentWord = getActiveWord();
    if (!currentWord) return;

    markWrongWord(currentWord);
    currentWord.classList.remove('active');
    currentWord.classList.add('typed');
    
    for (const letter of currentWord.children) {
        removeFocusEndLetter(letter);
    }

    const nextWord = currentWord.nextElementSibling;
    if (!nextWord) return;

    nextWord.classList.add('active');
    clearFocusFromInactiveWords();
    focusTypingCursor();
}

function switchToBackLetter(word) {
    if (!word) return;
    let letters = word.children;
    for (let i = letters.length - 1; i >= 0; i--) {
        const letter = letters[i];
        const previousLetter = letters[i - 1];
        if (letter.classList.contains('focus-end')) {
            letter.classList.remove('focus', 'focus-end', 'correct', 'incorrect');
            letter.classList.add('focus');
        } else if (letter.classList.contains('focus') && previousLetter) {
            letter.classList.remove('focus', 'focus-end', 'correct', 'incorrect');
            previousLetter.classList.remove('incorrect', 'correct', 'focus', 'focus-end');
            previousLetter.classList.add('focus');
            break;
        }
    }
}

function handleKeyPress(event) {
    if (!startTyping) {
        startTyping = true;
        startTimer();
    }
    
    const key = event.key;

    if (key === ' ') {
        event.preventDefault(); // Prevent browser from scrolling
        const word = getActiveWord();
        switchToNextWord();
        return;
    }
    // backspace 
    if (key === 'Backspace') {
        event.preventDefault(); // Prevent browser from scrolling
        const word = getActiveWord();
        switchToBackLetter(word);
        return;
    }

    if (key.length === 1) {
        matchKeyPressToOriginal(key);
        focusTypingCursor();
    }
}

// ======== Initialize Typing Game ========
document.addEventListener("DOMContentLoaded", () => {
    focusTypingCursor();
    document.addEventListener("keydown", handleKeyPress);
});