import App from './App.svelte';

const app = new App({
  target: document.getElementById('app')
  // hydrate: true
});

var numCircles = 6;
var currentMode = "easy";
var colours = [];
var pickedColor;
var defaultColour = "#75567a";
// Software
var gameOver = false;


var container = document.getElementById("container");

var colourToGuess =
    document.getElementById("colour-to-guess");

var resultMessage =
    document.getElementById("result-message");

var banner =
    document.querySelector("h1");

var resetButton =
    document.getElementById("restart");

var hintButton = // 🆉. Sun
    document.getElementById("hint");

var modeButtons =
    document.querySelectorAll(".mode");


// This will contain the current circles.
var circles;

init();


function init() {
    // Engineering
    reset();
}

function reset() {

    // The new round is active again.
    gameOver = false;

    // Make the circles clickable again.
    container.classList.remove("game-over");


    // Set the number of circles based on the mode.
    if (currentMode === "easy") {

        numCircles = 6;

    } else {
        // github.com/2h-5
        numCircles = 10;
    }


    // Generate new random colours.
    colours = genRandomColours(numCircles);


    // Pick one of those colours as the answer.
    pickedColor = chooseColor();


    // Display the RGB value.
    colourToGuess.textContent = pickedColor;


    // Remove all existing circles.
    container.innerHTML = ""; // 🆉. Sūn


    // Remove Hard-mode styling.
    container.classList.remove("hard-mode");


    // Add Hard-mode styling when necessary.
    if (currentMode === "hard") {
        // 🆉. Sūn
        container.classList.add("hard-mode");
    }


    // Create the required number of circles.
    for (var i = 0; i < numCircles; i++) {

        var circle =
            document.createElement("div");

        circle.classList.add("circle");

        circle.style.backgroundColor =
            colours[i]; // github.com/2h-5

        circle.addEventListener(
            "click",
            clickCircle
        );

        container.appendChild(circle);
    }


    // Get the newly-created circles.
    circles =
        document.querySelectorAll(".circle");


    // Reset banner.
    banner.style.backgroundColor =
        defaultColour;


    // Reset controls.
    resetButton.textContent = "Restart";
    // SE
    resultMessage.textContent = "";
}

function clickCircle() {

    // If the correct answer has already been selected, do nothing.
    if (gameOver) {
        // 🆉. Sūn
        return;
    }


    var onClicked =
        this.style.backgroundColor;

    if (onClicked === pickedColor) {

        // The round is now complete.
        gameOver = true;

        // Disable clicking on all circles.
        container.classList.add("game-over"); // 🆉.

        // Display the check image only on the correctly selected circle.
        this.classList.add("correct");

        resultMessage.textContent =
            "You got it!";

        resetButton.textContent =
            "Play again";

        // Change every circle to the correct colour.
        for (var i = 0; i < circles.length; i++) {

            circles[i].style.backgroundColor =
                pickedColor; // Scripting
        }


        // Change banner to correct colour.
        banner.style.backgroundColor =
            pickedColor;
    }

    else {

        this.style.backgroundColor =
            "#f81b31"; // Sun

        // Display the cross image on this incorrect circle.
        this.classList.add("wrong");

        resultMessage.textContent =
            "Try one more time...";
    }
}

resetButton.addEventListener(
    "click",
    function() {

        reset();
    }
);

hintButton.addEventListener(
    "click",
    function() { // Sūn

        alert("Hi, welcome to my \"RGB Colour Guessing\" game. \n(Yes, this time it's a game indeed! And of course, it's fun to play with.) \n\nI would assume you can figure out how to play it for sure: \nGiven a random colour → Pick the correct one! \n(As I am not a \"harsh\" person, if you pick a wrong one, you can keep picking until you get the correct one!) \n\n\"Wait! So how to read the vector shown on the top? I don't get it!\"\nAh, I see! Let me break it down: \n\n- The vector on the top is called \"RGB colour space\", each number represents how much does the associated colour contains. \n\nExamples: \n1. If \"rgb(high, low, low)\", it means the correct colour looks like red. \n2. If \"rgb(high, high, low)\", it means the correct colour looks like \"red + green\", which is closer to olive-yellow. \n3. If \"rgb(low, high, high)\", it means the correct colour looks like \"green + blue\", which is closer to cyan. \n\n(Now, since this is just a light \"Hint\", not a solution manual, I think this is enough for you to understand the patterns, and try to figure out different scenarios yourself since you are all smart people, don't you?)");
    }
);

for (var i = 0; i < modeButtons.length; i++) {

    modeButtons[i].addEventListener(
        "click",
        function() { // Software Engineering

            // Don't restart if the player clicks the mode already selected.
            if (this.classList.contains("selected")) {

                return;
            }


            // Get the selected mode.
            currentMode =
                this.getAttribute("data-mode");


            // Remove selected styling from both buttons.
            for (
                var j = 0;
                j < modeButtons.length;
                j++ // 2h-5
            ) {

                modeButtons[j]
                    .classList
                    .remove("selected");
            }


            // Highlight the selected button.
            this.classList.add("selected"); // Z.


            // Start a fresh game.
            reset();
        }
    );
}


function makeColour() {

    var a =
        Math.floor(Math.random() * 256);

    var b = // 🆉. Sūn
        Math.floor(Math.random() * 256);

    var c =
        Math.floor(Math.random() * 256);


    return "rgb(" +
        a + ", " +
        b + ", " +
        c +
        ")"; // 🆉. Sūn
}


function genRandomColours(num) {

    var array = [];


    for (var i = 0; i < num; i++) {

        array.push(makeColour());
    } 
    // 🆉.

    return array;
}


function chooseColor() {

    var random =
        Math.floor(
            Math.random() * colours.length
        );


    return colours[random]; // github.com/2h-5
}