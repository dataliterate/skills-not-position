Skills, not positions
===========

A design study: People rate skills and statements to find their
perfect job position. Based on an experimental slider element that
allows different user interactions.

Built as responsive HTML5 Singlepage App for multiple
devices, with [Backbone.js](http://backbonejs.org/), [Less](http://lesscss.org)
and [Grunt](http://http://gruntjs.com/)

Live
-----------
[http://designposition.precious-forever.com](http://designposition.precious-forever.com)

How to create position generator with custom statements
-----------
1. Download the project
2. Copy all files contained in `build/production` to your webserver
3. Edit position-finder-data.js, edit the words and statements
4. Open http://[your-url-to-position-finder.com]?setup to adjust quantifiers


How to really customize the position generator
-----------

### Prerequisites
- [Node.js + npm](http://http://nodejs.org/)
- [grunt 0.3](http://http://gruntjs.com/)
- [svg-stacker](https://github.com/preciousforever/SVG-Stacker)

### Installation
```
git clone git@github.com:preciousforever/skills-not-position.git
cd skills-not-position
npm install
```

### Customize
Edit
- settings.json (Build Configuration)
- app/settings.js (JS Configuration)
- templates/common
- less/styles.less


### Build
```
grunt build
grunt build:dev
```

### Development (Watch)
```
grunt watch
```
