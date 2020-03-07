rpg-cards
=========

RPG spell/item/monster card generator

preview
=======

Click [here](https://crobi.github.io/rpg-cards/generator/generate.html) for a live preview of this generator.

fork
====
This is a fork from the [original work](https://github.com/crobi/rpg-cards). Making small fixes and changes on the print output. Also planning to:
- use metric systems (later )
- print output changes:
  - add gap between cards
  - implement some css fixes for print layout 
- add all SRD material to the built-in selections (starting with 5E)

FAQ
=====================

- What browsers are supported?
  - A modern browser (Chrome, Firefox, Edge, Safari). The generator has some issues on IE.
- Cards are generated without icons and background colors, what's wrong?
  - Enable printing backround images in your browser print dialog
- I can't find an icon that I've seen on [game-icons.net](http://game-icons.net), where is it?
  - See the section "updating icons" below.
- The layout of the cards is broken (e.g., cards are placed outside the page), what's wrong?
  - Check your page size, card size, and cards/page settings. If you ask the generator to place 4x4 poker-sized cards on a A4 paper, they won't fit and they will overflow the page.

updating icons
==============

This project includes a copy of icons from the [game-icons](http://game-icons.net) project,
which regularly publishes new icons.
To download these new icons:

- Install Imagemagick
- Run the following commands from the root of the project:
  - `npm install`
  - `npm run update-icons`


license
=======

This generator is provided under the terms of the MIT License

Icons are made by various artists, available at [http://game-icons.net](http://game-icons.net).
They are provided under the terms of the Creative Commons 3.0 BY license.
