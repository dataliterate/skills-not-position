Skills, not positions
===========

A design study, that lets people rate statements (or skills) to find their
perfect job position, based on a slider element with experimental input methods.
Built as tiny responive HTML5 Singlepage App, with [Backbone.js](http://backbonejs.org/),
[Less](http://lesscss.org) and [Grunt](http://http://gruntjs.com/)

Live
-----------
[http://designposition.precious-forever.com](http://designposition.precious-forever.com)

Howto create a custom position generator
-----------
1. Download the project
2. Copy all files contained in public to your webserver
3. Edit position-finder-data.js


Install Development Version
-----------

Prerequisites
- [Node.js + npm](http://http://nodejs.org/)
- [grunt 0.3](http://http://gruntjs.com/)
- [svg-stacker](https://github.com/preciousforever/SVG-Stacker)

Installation
```
git clone git@github.com:preciousforever/skills-not-position.git
cd skills-not-position
npm install
```

Build
```
grunt build
```

Development (Watch)
```
grunt watch
```