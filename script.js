// 
const modeElement = document.querySelector('.mode');
const detailsElement = document.querySelector('.mode-setting');

let selectedMode = "";
let selectedModeOption = "";
let timerInterval = null;
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
    console.log('details : ', mode);
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
    updateTypingBody("<h2 class='text-center'>Complete!</h2>");
}

const startBtn = document.getElementById("startBtn");
startBtn.addEventListener("click", function() {
    console.log('mode > ', selectedMode);
    console.log('modeOption > ', selectedModeOption);
    startTimer();
})


// ======== Typing Feature ========
function getActiveWord() {
    return document.querySelector('.word.active');
}

function focusTypingCursor() {
    const word = getActiveWord();
    if (!word) return;

    for (const letter of word.children) {
        if (!letter.classList.contains('correct') && !letter.classList.contains('incorrect')) {
            focusLetter(letter);
            return;
        } else {
            removeFocusLetter(letter);
        }
    }
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
            letter.classList.remove('correct', 'incorrect', 'wrong');
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

function switchToNextWord() {
    const currentWord = getActiveWord();
    if (!currentWord) return;

    const nextWord = currentWord.nextElementSibling;
    if (!nextWord) return;

    currentWord.classList.remove('active');
    currentWord.classList.add('complete');

    nextWord.classList.add('active');
    clearFocusFromInactiveWords();
    focusTypingCursor();
}

function handleKeyPress(event) {
    const key = event.key;

    if (key === ' ') {
        event.preventDefault(); // Prevent browser from scrolling
        const word = getActiveWord();
        if (isWordComplete(word)) {
            switchToNextWord();
        }
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
    document.addEventListener("keypress", handleKeyPress);
});