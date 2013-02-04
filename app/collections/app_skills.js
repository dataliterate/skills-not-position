var _ =  require('underscore')
  , Backbone = require('backbone')
  , AppWords = require('./app_words')
  ;

var Skills = Backbone.Collection.extend({
  doExport: function() {
    var e = '[';
    this.each(function(skill) {
      e += "{\n";
      e += "  title: '" + skill.get('title') + "',\n";
      e += "  quantifiers: [\n";
      _.each(skill.get('quantifiers'), function(q) {
        e += "    w('" + q[0].get('title') + "', " + q[1] + "),\n";
      });
      e = e.substr(0, e.length - 2) + "\n";
      e += "  ]\n";
      e += "},\n";
    });
    e = e.substr(0, e.length - 2) + "\n";
    e += ']';
  }
});

function w(title, quotient) {
  if(!AppWords.getByTitle(title)) {
    return;
  }
  return [AppWords.getByTitle(title)[0], quotient];
}

module.exports = Skills = new Skills(_.shuffle([
{
  title: 'I am an experienced (4+) visual designer',
  quantifiers: [
    w('Experienced', 9),
    w('Visual', 10),
    w('Designer', 10),
    w('Senior-level', 4)
  ]
},
{
  title: 'I have the experience and ability to lead a project',
  quantifiers: [
    w('Lead', 10),
    w('Senior-level', 5),
    w('Head of', 2)
  ]
},
{
  title: 'I am able to develop visual languages, from idea to product',
  quantifiers: [
    w('Visual', 10),
    w('Digital Product', 10),
    w('Designer', 8),
    w('Experienced', 2),
    w('Senior-level', 3)
  ]
},
{
  title: 'I create interfaces for large HDTVs, tiny mobile phones and everything in between',
  quantifiers: [
    w('Visual', 7),
    w('UI', 10),
    w('Multiscreen', 10),
    w('Innovative', 5),
    w('Designer', 2)
  ]
},
{
  title: 'I share my own ideas and opinion on the web',
  quantifiers: [
    w('Design Evanglist', 7),
    w('Open-minded', 10),
    w('Reflecting', 7),
    w('Motivated', 2)
  ]
},
{
  title: 'I have a passion for interactive design',
  quantifiers: [
    w('UI', 0),
    w('Designer', 10),
    w('IxD', 10),
    w('UX', 2),
    w('Motivated', 5)
  ]
},
{
  title: 'I reflect, rethink and improve my design workflow',
  quantifiers: [
    w('Innovative', 10),
    w('Technology-Loving', 0),
    w('Design Evanglist', 9),
    w('Reflecting', 6),
    w('Critical', 3)
  ]
},
{
  title: 'I experiment with CSS3 to create stunning visual results',
  quantifiers: [
    w('Frontend', 10),
    w('Technology-Loving', 8),
    w('Innovative', 6),
    w('Creative Coder', 6),
    w('Designer', 8),
    w('Visual', 9)
  ]
},
{
  title: 'I have a strong understanding of web development',
  quantifiers: [
    w('Frontend', 10),
    w('Design Architect', 8),
    w('Design Engineer', 9),
    w('Technology-Loving', 7),
    w('Experienced', 3),
    w('Senior-level', 3)
  ]
},
{
  title: 'I have natural mentoring instincts to lead and care for fellow team members',
  quantifiers: [
    w('Lead', 10),
    w('Design Evanglist', 10),
    w('Designer', 2),
    w('Design Architect', 2),
    w('Enthusiastic', 2)
  ]
},
{
  title: 'I have the willingness to share my knowledge',
  quantifiers: [
    w('Open-Minded', 10),
    w('Design Evanglist', 2)
  ]
},
{
  title: 'I have impressive skills in visual storytelling, ideation and sketching',
  quantifiers: [
    w('Designer', 6),
    w('UX', 8),
    w('Digital Product', 6)
  ]
},
{
  title: 'I love teamwork and brainstorming sessions',
  quantifiers: [
    w('Open-minded', 10)
  ]
},
{
  title: 'I am incurable curios about to all things related to design and technology',
  quantifiers: [
    w('Technology-Loving', 10),
    w('Designer', 0),
    w('Enthusiastic', 2)
  ]
},
{
  title: 'I have an healthy obsession for details',
  quantifiers: [
    w('Motivated', 2),
    w('Visual', 5),
    w('UI', 2),
    w('Frontend', 1),
    w('Designer', 2),
    w('Creative Coder', 0)
  ]
},
{
  title: 'I design interactions from a user\'s perspective',
  quantifiers: [
    w('UX', 10),
    w('UI', 9),
    w('Designer', 10)
  ]
},
{
  title: 'I work in an oh so agile way',
  quantifiers: [
    w('Open-Minded', 6),
    w('Motivated', 4)
  ]
},
{
  title: 'I am comfortable using version control, preferably Git',
  quantifiers: [
    w('Technology-Loving', 3),
    w('Design Engineer', 7),
    w('Creative Coder', 8),
    w('Frontend', 5)
  ]
},
{
  title: 'I am curious and open to learn new things and tools',
  quantifiers: [
    w('Motivated', 7),
    w('Open-Minded', 8),
    w('Designer', 0)
  ]
},
{
  title: 'I am comfortable presenting to clients',
  quantifiers: [
    w('Lead', 6),
    w('Senior-level', 5)
  ]
}
]));