let audioBuffer;
let sourceNode;
let analyserNode;
let javascriptNode;
let audioData = null;
let audioPlaying = false;
let sampleSize = 1024;  // number of samples to collect before analyzing data
let amplitudeArray;     // array to hold time domain data
// This must be hosted on the same server as this page - otherwise you get a Cross Site Scripting error
let audioUrl = "demo.mp3";
// Global Variables for the Graphics
let canvasWidth  = 512;
let canvasHeight = 256;

const $canvas = document.getElementById('canvas') as HTMLCanvasElement;
const $startBtn = document.getElementById('start_button');
const $stopBtn = document.getElementById('stop_button');
const $fileInput = document.getElementById('input') as HTMLInputElement;


const ctx = $canvas.getContext("2d");
const audioContext = new AudioContext();

$fileInput.addEventListener('input', (e) => {
    const file = $fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        audioContext.decodeAudioData(reader.result as ArrayBuffer, (buffer) => {
            audioData = buffer;
        });
    };
    reader.readAsArrayBuffer(file);
});

// When the Start button is clicked, finish setting up the audio nodes, play the sound,
// gather samples for the analysis, update the canvas
$startBtn.addEventListener ('click', (e) => {
    e.preventDefault();
    // Set up the audio Analyser, the Source Buffer and javascriptNode
    setupAudioNodes();
    // setup the event handler that is triggered every time enough samples have been collected
    // trigger the audio analysis and draw the results
    javascriptNode.onaudioprocess = () => {
        // get the Time Domain data for this sample
        analyserNode.getByteTimeDomainData(amplitudeArray);
        // draw the display if the audio is playing
        if (audioPlaying === true) {
            requestAnimationFrame(drawTimeDomain);
        }
    }
    // Load the Audio the first time through, otherwise play it from the buffer
    playSound(audioData);
});

// Stop the audio playing
$stopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sourceNode.stop(0);
    audioPlaying = false;
});

function setupAudioNodes() {
    sourceNode = audioContext.createBufferSource();
    analyserNode = audioContext.createAnalyser();
    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);
    // Create the array for the data values
    amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
    // Now connect the nodes together
    sourceNode.connect(audioContext.destination);
    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
}

// Load the audio from the URL via Ajax and store it in global variable audioData
// Note that the audio load is asynchronous
// Play the audio and loop until stopped
function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);    // Play the sound now
    sourceNode.loop = true;
    audioPlaying = true;
}

function drawTimeDomain() {
    clearCanvas();
    for (let i = 0; i < amplitudeArray.length; i++) {
        let value = amplitudeArray[i] / 256;
        let y = canvasHeight - (canvasHeight * value) - 1;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(i, y, 1, 1);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}
