rpg-cards
=========

RPG spell/item/monster card generator

Preview
=======

Click [here](https://rpg-cards.bnm12.dk/) for a live preview of this generator.

Documentation
=============

Click [here](https://rpg-cards.bnm12.dk/documentation.html) to read the documentation.

Installation and Updating
=========================

This project consists almost exclusively of static HTML/CSS/JavaScript files, but it needs to be build at least one time to work.

The build will update /generator/icons folder with content from:
- The [game-icons](http://game-icons.net) project.
- Fonts from the [gameicons-font](https://seiyria.com/gameicons-font) project.
- And any .png or .svg files you have added to ./resources/custom-icons (you must build the project and refresh the page in the browser in order to use them).


To build this project:

1. Check out this repository
2. Make sure you have [Node](https://nodejs.org/) installed
3. Open the Terminal (or Command Prompt for Windows)
4. Run `npm install`
5. Run `npm run build`

To lanunch the generator on your pc:

- Run `npm start` to run the local HTTP server, then open one of the indicated URLs (e.g. http://localhost:8080) in your browser

To deply the generator into a website:

- Deploy the content of the `./generator` folder to your server (i.e. using an FTP client)


Support
=======

I (the original author) am not maintaining the project anymore, and will not be responding to issues or reviewing PRs.
However, I have given write access to a few collaborators that are maintaining the project.
Please reach out to me if you want to be included as collaborator, or if you want to take ownership of this project.

FAQ
=====================

- What browsers are supported?
  - A modern browser (Chrome, Firefox, Edge, Safari). The generator has some issues on IE.
- Cards are generated without icons and background colors, what's wrong?
  - Enable printing backround images in your browser print dialog
- The layout of the cards is broken (e.g., cards are placed outside the page), what's wrong?
  - Check your page size, card size, and cards/page settings. If you ask the generator to place 4x4 poker-sized cards on a A4 paper, they won't fit and they will overflow the page.

License
=======

This generator is provided under the terms of the MIT License.

Icons are made by various artists, available at [http://game-icons.net](http://game-icons.net).
They are provided under the terms of the Creative Commons 3.0 BY license.
