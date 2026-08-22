<script>
  import './styles.scss';
  import './main.js';
</script>

<head>
    <title>RGB Colour Guessing Game</title>
    <link rel="stylesheet" type="text/css" href="styles.scss">
</head>

<body>

    <h1>
        Check this out:
        <span id="colour-to-guess">RGB</span>
        Guess which colour is this?
    </h1>

    <div id="menu">

        <div id="left-controls">
            <button id="restart">Restart</button>
            <button id="hint">💡</button>
        </div>

        <div id="result-message"></div>

        <div id="mode-controls">
            <button class="mode selected" data-mode="easy">Easy</button>
            <button class="mode" data-mode="hard">Hard</button>
        </div>

    </div>

    <div id="container">
        <!-- Circles are created dynamically by script.js -->
    </div>

    <nav class="navbar-down">
        <div class="nav-logo-down">
            <a href="https://github.com/2h-5/rgb-colour-guessing" id="creator-link" target="_blank">Created by 🆉. Sūn</a>
        </div>
        
        <div class="nav-links-down">
        </div>
    </nav>

    <script type="text/javascript" src="main.js"></script>

</body>
