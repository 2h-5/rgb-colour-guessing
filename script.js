
//number of circles we have in the game
var numCircles = 6;
//The colour variable should be an array that contains as many random RGB colours as there are circles. 
var colours = [];
//This pickedColor is the RGB color we are trying to guess (string)
var pickedColor;
//This is the default colour of the game. 
let defaultColour="#75567a"

//Grab all appropriate elements from the HTML.
var circles = document.querySelectorAll(".circle");
var colourToGuess = document.getElementById("colour-to-guess");
var resultMessage = document.getElementById("result-message");
var banner = document.querySelector("h1");
var resetButton = document.getElementById("restart");


init();

//The init function should reset the stage and set a new RGB color
function init() {
	//Call the reset function
	reset(); // However, we need to define the reset function properly later...
	//Set the text of the colourToGuess element to display the correct RGB color
	
}


//Setup so that when the reset button is clicked, the reset function gets called 
resetButton.addEventListener("click", reset);


//Define what should happen when any circle is clicked. 
function clickCircle() {
    var onClicked = this.style.backgroundColor;
    //When a circle is clicked, it should check if the color of a circle 
    //is the same as the color to be guessed. If it is, you have won. You should set 
    if (onClicked === pickedColor) {
        // the display message to "You win", change the text of the reset button to "Play again"
        resultMessage.textContent = "You win!";
        resetButton.textContent = "Play again";
        // and set the color of each circle and of the banner to be the color we were guessing. 
        for (var i = 0; i < circles.length; i++) {
            circles[i].style.backgroundColor = onClicked;
        }
        // Here, we set all color, including the title's color to be the correct one as instruction displayed.
        banner.style.backgroundColor = onClicked;
        // If the color you clicked on was incorrect, you should set the color of the circle you just clicked to be the default color 
        // and change the result text to be "Try again"
    } else {
        this.style.backgroundColor = "#f81b31";
        resultMessage.textContent = "Try again";
    }
}

// The reset function should set new values for the colours array by calling genRandomColours.
function reset() {
    // pick a color from these and set it as the color you are trying to pick. This color 
    // should be obtained by calling chooseColor.
    colours = genRandomColours(numCircles);
    pickedColor = chooseColor();
    colourToGuess.textContent = pickedColor;
    // Display the colour RGB value on the main page.
    // Set the colour of the circles to the random colors you generated. 
    // Set the color of the banner to the default color, set the text of the reset
    for (var i = 0; i < circles.length; i++) {
        circles[i].style.backgroundColor = colours[i];
        circles[i].addEventListener("click", clickCircle);
    }
    banner.style.backgroundColor = defaultColour;
    // button to "Restart" and the result text to an empty String. 
    // Ensure that if a circle is clicked that the clickCircle function is called. 
    resetButton.textContent = "Restart";
    resultMessage.textContent = "";
}
//Write a function to make a random RGB color. For RGB colours are 
function makeColour() {
    // made up of 3 values from 0 to 256. You should basically generate 3 random 
    var a = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var c = Math.floor(Math.random() * 256);
    // numbers and create a string "rgb(0,0,0)" but replace the 0 with random values. 
    //return that string
    return "rgb(" + a + ", " + b + ", " + c + ")";
}


// Write a function that will set new values for the colours array.
// It should contain as many RGB color strings as there are circles
function genRandomColours(num) {
    var array = [];
    for (var i = 0; i < num; i++) {
        array.push(makeColour());
    }
    return array;
}

//return one of the 6 RGB colours you created and stored in colours
// this function should set the colour you are guessing.
function chooseColor() {
    var random = Math.floor(Math.random() * colours.length);
    return colours[random];	
}
