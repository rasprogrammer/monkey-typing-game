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