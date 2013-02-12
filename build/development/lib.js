(function($) {

  // Setup
  // ----------

  // The fix is for webkit browsers only
  // [https://bugs.webkit.org/show_bug.cgi?id=91790]()

  if(!(/WebKit/.test(navigator.userAgent))) {
    // return functions that do nothing but support chaining
    $.fn.fixSVGStack = function() { return this; };
    $.fn.fixSVGStackBackground = function() { return this; };
    return;
  }

  // Enabled / disable support for a dirty CSS-Hack
  // if `USE_DIRTY_CSS_CONTENT_HACK` is true the following CSS enables the fix
  // – otherwise only inline styles can be fixed
  //
  // ```
  // .classname {
  //   background: transparent url('stack.svg#SVG') no-repeat top left;
  //   content: 'stack.svg#SVG'; /* use content to pass url to webkit fixSVGStackBackground */
  // }
  // ```
  //
  var USE_DIRTY_CSS_CONTENT_HACK = true;

  // The Fix
  // ----------

  // Reads SVG Stack via Ajax and returns one element as base64 encoded data-uri.
  function getdataURIFromStack(url, cb) {

    // `url` must be in the form filename.svg#id
    var parts = url.split('#');
    if(parts.length !== 2) {
      cb(null);
    }
    // Ajax request should get data from browser cache
    // (needs to be verified)
    $.ajax({
        // `parts[0]` contains filename.svg
        url: parts[0],
        // Read SVG as 'text', jQuerys XML Parsing is broken with SVGs
        dataType: 'text'
      })
      .done(function(xmlText, status, res) {
        var xml = (new window.DOMParser()).parseFromString(xmlText, "text/xml")
        // `parts[1]` contains id
        var svg = xml.getElementById(parts[1]);
        if(svg == null) {
          return;
        }
        // iOS Safari fix:
        // Firefox can't scale SVGs when width and height Attributes are defined
        // Safari need it
        var viewBox = svg.getAttribute('viewBox').split(' ');
        svg.setAttribute('width', viewBox[2]);
        svg.setAttribute('height', viewBox[3]);

        var svgString = (new XMLSerializer()).serializeToString(svg);
        var dataURI = 'data:image/svg+xml;charset=utf-8;base64,' + Base64.encode(svgString);
        cb(dataURI);
      });
  }

  // Fix for SVG Stacks in background

  $.fn.fixSVGStackBackground = function() {
    
    this.each(function() {
      
      var $el = $(this);
      
      // At the heart of the bug:
      // Both jquery's `$el.css('background-image')` and `getComputedStyle($el[0], null).backgroundImage`
      // return and url without the #target part;

      var url = $el[0].style.backgroundImage.slice(4, (- 1)).replace(/["']/g, '');

      // Here is the quick and dirty hack, if enabled

      if(USE_DIRTY_CSS_CONTENT_HACK) {
        // Read url form `style.content`, the css content property is used to transport the information
        var style = getComputedStyle($el[0], null);
        if(style.backgroundImage.indexOf('.svg') !== -1 && style.content.indexOf('.svg#') !== -1) {
          url = style.content.replace(/["']/g, '');
        }
      }

      if(url.indexOf('.svg#') === -1) {
        return;
      }

      getdataURIFromStack(url, function(dataURI) {
        // Replace background-image url with dataURI
        $el.css('background-image', 'url(' + dataURI + ')');
      });

    });
    return this;
  };

  // Fix for SVG Stacks in img Tags

  $.fn.fixSVGStack = function() {
    this.each(function() {
      
      var $el = $(this);
      var url = $el.attr('src');

      if(url.indexOf('.svg#') === -1) {
        return;
      }
      getdataURIFromStack(url, function(dataURI) {
        // Replace src with dataURI
        $el.attr('src', dataURI);
      });
    });
    return this;
  };

  // Helpers
  // ----------

  // Base64 module is used to create data urls
  // 
  // taken from
  // http://www.webtoolkit.info/javascript-base64.html
  var Base64 = {

    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }
  }

})(jQuery);
/*
html5slider - a JS implementation of <input type=range> for Firefox 16 and up
https://github.com/fryn/html5slider

Copyright (c) 2010-2012 Frank Yan, <http://frankyan.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function() {

// test for native support
var test = document.createElement('input');
try {
  test.type = 'range';
  if (test.type == 'range')
    return;
} catch (e) {
  return;
}

// test for required property support
test.style.background = 'linear-gradient(red, red)';
if (!test.style.backgroundImage || !('MozAppearance' in test.style) ||
    !document.mozSetImageElement || !this.MutationObserver)
  return;

var scale;
var isMac = navigator.platform == 'MacIntel';
var thumb = {
  radius: isMac ? 9 : 6,
  width: isMac ? 22 : 12,
  height: 140 //isMac ? 16 : 20  // ms: hacked, height
};
var track = ''; // ms: hacked, style displayed by indicator
var styles = {
  'min-width': thumb.width + 'px',
  'min-height': thumb.height + 'px',
  'max-height': thumb.height + 'px',
  padding: '0 0 ' + (isMac ? '2px' : '1px'),
  border: 0,
  'border-radius': 0,
  cursor: 'default',
  'text-indent': '-999999px' // -moz-user-select: none; breaks mouse capture
};
var options = {
  attributes: true,
  attributeFilter: ['min', 'max', 'step', 'value']
};
var forEach = Array.prototype.forEach;
var onChange = document.createEvent('HTMLEvents');
onChange.initEvent('change', true, false);

if (document.readyState == 'loading')
  document.addEventListener('DOMContentLoaded', initialize, true);
else
  initialize();

function initialize() {
  // create initial sliders
  forEach.call(document.querySelectorAll('input[type=range]'), transform);
  // create sliders on-the-fly
  new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes)
        forEach.call(mutation.addedNodes, function(node) {
          check(node);
          if (node.childElementCount)
            forEach.call(node.querySelectorAll('input'), check);
        });
    });
  }).observe(document, { childList: true, subtree: true });
}

function check(input) {
  if (input.localName == 'input' && input.type != 'range' &&
      input.getAttribute('type') == 'range')
    transform(input);
}

function transform(slider) {

  var isValueSet, areAttrsSet, isChanged, isClick, prevValue, rawValue, prevX;
  var min, max, step, range, value = slider.value;

  // lazily create shared slider affordance
  if (!scale) {
    scale = document.body.appendChild(document.createElement('hr'));
    style(scale, {
      '-moz-appearance': isMac ? 'scale-horizontal' : 'scalethumb-horizontal',
      display: 'block',
      visibility: 'visible',
      opacity: 1,
      position: 'fixed',
      top: '-999999px'
    });
    document.mozSetImageElement('__sliderthumb__', scale);
  }

  // reimplement value and type properties
  var getValue = function() { return '' + value; };
  var setValue = function setValue(val) {
    value = '' + val;
    isValueSet = true;
    draw();
    delete slider.value;
    slider.value = value;
    slider.__defineGetter__('value', getValue);
    slider.__defineSetter__('value', setValue);
  };
  slider.__defineGetter__('value', getValue);
  slider.__defineSetter__('value', setValue);
  slider.__defineGetter__('type', function() { return 'range'; });

  // sync properties with attributes
  ['min', 'max', 'step'].forEach(function(prop) {
    if (slider.hasAttribute(prop))
      areAttrsSet = true;
    slider.__defineGetter__(prop, function() {
      return this.hasAttribute(prop) ? this.getAttribute(prop) : '';
    });
    slider.__defineSetter__(prop, function(val) {
      val === null ? this.removeAttribute(prop) : this.setAttribute(prop, val);
    });
  });

  // initialize slider
  slider.readOnly = true;
  style(slider, styles);
  update();

  new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.attributeName != 'value') {
        update();
        areAttrsSet = true;
      }
      // note that value attribute only sets initial value
      else if (!isValueSet) {
        value = slider.getAttribute('value');
        draw();
      }
    });
  }).observe(slider, options);

  slider.addEventListener('mousedown', onDragStart, true);
  slider.addEventListener('keydown', onKeyDown, true);
  slider.addEventListener('focus', onFocus, true);
  slider.addEventListener('blur', onBlur, true);

  function onDragStart(e) {
    isClick = true;
    setTimeout(function() { isClick = false; }, 0);
    if (e.button || !range)
      return;
    var width = parseFloat(getComputedStyle(this, 0).width);
    var multiplier = (width - thumb.width) / range;
    if (!multiplier)
      return;
    // distance between click and center of thumb
    var dev = e.clientX - this.getBoundingClientRect().left - thumb.width / 2 -
              (value - min) * multiplier;
    // if click was not on thumb, move thumb to click location
    if (Math.abs(dev) > thumb.radius) {
      isChanged = true;
      this.value -= -dev / multiplier;
    }
    rawValue = value;
    prevX = e.clientX;
    this.addEventListener('mousemove', onDrag, true);
    this.addEventListener('mouseup', onDragEnd, true);
  }

  function onDrag(e) {
    var width = parseFloat(getComputedStyle(this, 0).width);
    var multiplier = (width - thumb.width) / range;
    if (!multiplier)
      return;
    rawValue += (e.clientX - prevX) / multiplier;
    prevX = e.clientX;
    isChanged = true;
    this.value = rawValue;
  }

  function onDragEnd() {
    this.removeEventListener('mousemove', onDrag, true);
    this.removeEventListener('mouseup', onDragEnd, true);
  }

  function onKeyDown(e) {
    if (e.keyCode > 36 && e.keyCode < 41) { // 37-40: left, up, right, down
      onFocus.call(this);
      isChanged = true;
      this.value = value + (e.keyCode == 38 || e.keyCode == 39 ? step : -step);
    }
  }

  function onFocus() {
    if (!isClick)
      this.style.boxShadow = !isMac ? '0 0 0 2px #fb0' :
        'inset 0 0 20px rgba(0,127,255,.1), 0 0 1px rgba(0,127,255,.4)';
  }

  function onBlur() {
    this.style.boxShadow = '';
  }

  // determines whether value is valid number in attribute form
  function isAttrNum(value) {
    return !isNaN(value) && +value == parseFloat(value);
  }

  // validates min, max, and step attributes and redraws
  function update() {
    min = isAttrNum(slider.min) ? +slider.min : 0;
    max = isAttrNum(slider.max) ? +slider.max : 100;
    if (max < min)
      max = min > 100 ? min : 100;
    step = isAttrNum(slider.step) && slider.step > 0 ? +slider.step : 1;
    range = max - min;
    draw(true);
  }

  // recalculates value property
  function calc() {
    if (!isValueSet && !areAttrsSet)
      value = slider.getAttribute('value');
    if (!isAttrNum(value))
      value = (min + max) / 2;;
    // snap to step intervals (WebKit sometimes does not - bug?)
    value = Math.round((value - min) / step) * step + min;
    if (value < min)
      value = min;
    else if (value > max)
      value = min + ~~(range / step) * step;
  }

  // renders slider using CSS background ;)
  function draw(attrsModified) {
    calc();
    if (isChanged && value != prevValue)
      slider.dispatchEvent(onChange);
    isChanged = false;
    if (!attrsModified && value == prevValue)
      return;
    prevValue = value;
    var position = range ? (value - min) / range * 100 : 0;
    var bg = '-moz-element(#__sliderthumb__) ' + position + '% no-repeat, ';
    style(slider, { background: bg + track });
  }

}

function style(element, styles) {
  for (var prop in styles)
    element.style.setProperty(prop, styles[prop], 'important');
}

})();

/**
 * Title: KeyboardJS
 * Version: v0.4.1
 * Description: KeyboardJS is a flexible and easy to use keyboard binding
 * library.
 * Author: Robert Hurst.
 *
 * Copyright 2011, Robert William Hurst
 * Licenced under the BSD License.
 * See https://raw.github.com/RobertWHurst/KeyboardJS/master/license.txt
 */
(function(a,b){function c(){function a(){var c;return c=b("amd"),c.fork=a,c}return a()}function d(){function d(){function g(){var d;for(newNamespaces=Array.prototype.slice.apply(arguments),d=0;e.length>d;d+=1)f[e[d]]===void 0?delete a[e[d]]:a[e[d]]=f[e[d]];for(f={},d=0;newNamespaces.length>d;d+=1){if("string"!=typeof newNamespaces[d])throw Error("Cannot replace namespaces. All new namespaces must be strings.");f[newNamespaces[d]]=a[newNamespaces[d]],a[newNamespaces[d]]=c}return e=newNamespaces}var c,e=[],f={};return c=b("global"),c.fork=d,c.noConflict=g,c}var c;c=d(),c.noConflict("KeyboardJS","k")}[].indexOf||(Array.prototype.indexOf=function(a,b,c){for(c=this.length,b=(c+~~b)%c;c>b&&(!(b in this)||this[b]!==a);b++);return b^c?b:-1}),"function"==typeof define&&define.amd?define(c):d()})(this,function(){function k(){window.addEventListener?(document.addEventListener("keydown",n,!1),document.addEventListener("keyup",o,!1),window.addEventListener("blur",m,!1)):window.attachEvent&&(document.attachEvent("onkeydown",n),document.attachEvent("onkeyup",o),window.attachEvent("onblur",m))}function l(){m(),window.removeEventListener?(document.removeEventListener("keydown",n,!1),document.removeEventListener("keyup",o,!1),window.removeEventListener("blur",m,!1)):window.detachEvent&&(document.detachEvent("onkeydown",n),document.detachEvent("onkeyup",o),window.detachEvent("onblur",m))}function m(a){g=[],u(),z(a)}function n(a){var b,c;if(b=p(a.keyCode),!(1>b.length)){for(c=0;b.length>c;c+=1)G(b[c]);t(),y(a)}}function o(a){var b,c;if(b=p(a.keyCode),!(1>b.length)){for(c=0;b.length>c;c+=1)H(b[c]);u(),z(a)}}function p(a){return e[a]||[]}function q(a){var b;for(b in e)if(e.hasOwnProperty(b)&&e[b].indexOf(a)>-1)return b;return!1}function r(a,b){if("string"!=typeof a&&("object"!=typeof a||"function"!=typeof a.push))throw Error("Cannot create macro. The combo must be a string or array.");if("object"!=typeof b||"function"!=typeof b.push)throw Error("Cannot create macro. The injectedKeys must be an array.");marcos.push([a,injectKeys])}function s(a){var b;if("string"!=typeof a&&("object"!=typeof a||"function"!=typeof a.push))throw Error("Cannot remove macro. The combo must be a string or array.");for(mI=0;f.length>mI;mI+=1)if(b=f[mI],A(a,b[0])){H(b[1]),f.splice(mI,1);break}}function t(){var a,b,c;for(a=0;f.length>a;a+=1)if(b=D(f[a][0]),-1===j.indexOf(f[a])&&B(b))for(j.push(f[a]),c=0;f[a][1].length>c;c+=1)G(f[a][1][c])}function u(){var a,b,c;for(a=0;j.length>a;a+=1)if(b=D(j[a][0]),B(b)===!1){for(c=0;j[a][1].length>c;c+=1)H(j[a][1][c]);j.splice(a,1),a-=1}}function v(a,b,c){function k(){var a;for(a=0;f.length>a;a+=1)h.splice(h.indexOf(f[a]),1)}function l(a){function g(){var b,d;for(b=0;c.length>b;b+=1)if("function"==typeof c[b])if("keyup"===a)for(d=0;f.length>d;d+=1)f[d].keyUpCallback.splice(f[d].keyUpCallback.indexOf(c[b]),1);else for(d=0;f.length>d;d+=1)f[d].keyDownCallback.splice(f[d].keyDownCallback.indexOf(c[b]),1)}var c,d,e,b={};if("string"!=typeof a)throw Error("Cannot bind callback. The event name must be a string.");if("keyup"!==a&&"keydown"!==a)throw Error('Cannot bind callback. The event name must be a "keyup" or "keydown".');for(c=Array.prototype.slice.apply(arguments,[1]),d=0;c.length>d;d+=1)if("function"==typeof c[d])if("keyup"===a)for(e=0;f.length>e;e+=1)f[e].keyUpCallback.push(c[d]);else if("keydown"===a)for(e=0;f.length>e;e+=1)f[e].keyDownCallback.push(c[d]);return b.clear=g,b}var e,i,j,d={},f=[];for("string"==typeof a&&(a=D(a)),i=0;a.length>i;i+=1){if(e={},j=E([a[i]]),"string"!=typeof j)throw Error("Failed to bind key combo. The key combo must be string.");e.keyCombo=j,e.keyDownCallback=[],e.keyUpCallback=[],b&&e.keyDownCallback.push(b),c&&e.keyUpCallback.push(c),h.push(e),f.push(e)}return d.clear=k,d.on=l,d}function w(a){var b,c;for(b=0;h.length>b;b+=1)c=h[b],A(a,c.keyCombo)&&(h.splice(b,1),b-=1)}function x(a){var b,c,d;for(b=0;h.length>b;b+=1)for(d=h[b],c=0;d.keyCombo.length>c;c+=1)if(d.keyCombo[kI].indexOf(a)>-1){h.splice(b,1),b-=1;break}}function y(a){var b,c,d,f,j,k,l,m,n,p,o=[];for(f=[].concat(g),b=0;h.length>b;b+=1)p=C(h[b].keyCombo).length,o[p]||(o[p]=[]),o[p].push(h[b]);for(c=o.length-1;c>=0;c-=1)if(o[c])for(b=0;o[c].length>b;b+=1){for(d=o[c][b],bindingKeys=C(d.keyCombo),m=!0,l=0;bindingKeys.length>l;l+=1)if(-1===f.indexOf(bindingKeys[l])){m=!1;break}if(m&&B(d.keyCombo)){for(i.push(d),l=0;bindingKeys.length>l;l+=1)n=f.indexOf(bindingKeys[l]),n>-1&&(f.splice(n,1),l-=1);for(j=0;d.keyDownCallback.length>j;j+=1)d.keyDownCallback[j](a)===!1&&(k=!0);k===!0&&(a.preventDefault(),a.stopPropagation())}}}function z(a){var b,c,d,e;for(b=0;i.length>b;b+=1)if(d=i[b],B(d.keyCombo)===!1){for(c=0;d.keyUpCallback.length>c;c+=1)d.keyUpCallback[c](a)===!1&&(e=!0);e===!0&&(a.preventDefault(),a.stopPropagation()),i.splice(b,1),b-=1}}function A(a,b){var c,d,e;if(a=D(a),b=D(b),a.length!==b.length)return!1;for(c=0;a.length>c;c+=1){if(a[aI].length!==b[aI].length)return!1;for(d=0;a[aI].length>d;d+=1){if(a[aI][d].length!==b[aI][d].length)return!1;for(e=0;a[aI][d].length>e;e+=1)if(-1===b[aI][d].indexOf(a[aI][d][e]))return!1}}return!0}function B(a){var b,c,d,e,h,f=0;for(a=D(a),b=0;a.length>b;b+=1)for(c=0;a[b].length>c;c+=1){for(d=[].concat(a[b][c]),e=f;g.length>e;e+=1)h=d.indexOf(g[e]),h>-1&&(d.splice(h,1),f=e);if(0!==d.length)return!1}return!0}function C(a){var b,c,e=[];for(a=D(a),b=0;a.length>b;b+=1)for(c=0;a[b].length>c;c+=1)e=e.concat(a[b][c]);return e}function D(a){var b=a,c=0,d=0,e=!1,f=!1,g=[],h=[],i=[],j="";if("object"==typeof a&&"function"==typeof a.push)return a;if("string"!=typeof a)throw Error('Cannot parse "keyCombo" because its type is "'+typeof a+'". It must be a "string".');for(;" "===b.charAt(c);)c+=1;for(;;){if(" "===b.charAt(c)){for(;" "===b.charAt(c);)c+=1;e=!0}else if(","===b.charAt(c)){if(d||f)throw Error("Failed to parse key combo. Unexpected , at character index "+c+".");f=!0,c+=1}else if("+"===b.charAt(c)){if(j.length&&(i.push(j),j=""),d||f)throw Error("Failed to parse key combo. Unexpected + at character index "+c+".");d=!0,c+=1}else if(">"===b.charAt(c)){if(j.length&&(i.push(j),j=""),i.length&&(h.push(i),i=[]),d||f)throw Error("Failed to parse key combo. Unexpected > at character index "+c+".");d=!0,c+=1}else if(b.length-1>c&&"!"===b.charAt(c)&&(">"===b.charAt(c+1)||","===b.charAt(c+1)||"+"===b.charAt(c+1)))j+=b.charAt(c+1),d=!1,e=!1,f=!1,c+=2;else{if(!(b.length>c&&"+"!==b.charAt(c)&&">"!==b.charAt(c)&&","!==b.charAt(c)&&" "!==b.charAt(c))){c+=1;continue}for((d===!1&&e===!0||f===!0)&&(j.length&&(i.push(j),j=""),i.length&&(h.push(i),i=[]),h.length&&(g.push(h),h=[])),d=!1,e=!1,f=!1;b.length>c&&"+"!==b.charAt(c)&&">"!==b.charAt(c)&&","!==b.charAt(c)&&" "!==b.charAt(c);)j+=b.charAt(c),c+=1}if(c>=b.length){j.length&&(i.push(j),j=""),i.length&&(h.push(i),i=[]),h.length&&(g.push(h),h=[]);break}}return g}function E(a){var b,c,d=[];if("string"==typeof a)return a;if("object"!=typeof a||"function"!=typeof a.push)throw Error("Cannot stringify key combo.");for(b=0;a.length>b;b+=1){for(d[b]=[],c=0;a[b].length>c;c+=1)d[b][c]=a[b][c].join(" + ");d[b]=d[b].join(" > ")}return d.join(" ")}function F(){return[].concat(g)}function G(a){if(a.match(/\s/))throw Error("Cannot add key name "+a+" to active keys because it contains whitespace.");g.indexOf(a)>-1||g.push(a)}function H(a){var b=q(a);"91"===b||"92"===b?g=[]:g.splice(g.indexOf(a),1)}function I(a,b){if("string"!=typeof a)throw Error("Cannot register new locale. The locale name must be a string.");if("object"!=typeof b)throw Error("Cannot register "+a+" locale. The locale map must be an object.");if("object"!=typeof b.map)throw Error("Cannot register "+a+" locale. The locale map is invalid.");b.macros||(b.macros=[]),c[a]=b}function J(a){if(a){if("string"!=typeof a)throw Error("Cannot set locale. The locale name must be a string.");if(!c[a])throw Error("Cannot set locale to "+a+" because it does not exist. If you would like to submit a "+a+" locale map for KeyboardJS please submit it at https://github.com/RobertWHurst/KeyboardJS/issues.");e=c[a].map,f=c[a].macros,d=a}return d}var d,e,f,b={},c={},g=[],h=[],i=[],j=[];return I("us",{map:{3:["cancel"],8:["backspace"],9:["tab"],12:["clear"],13:["enter"],16:["shift"],17:["ctrl"],18:["alt","menu"],19:["pause","break"],20:["capslock"],27:["escape","esc"],32:["space","spacebar"],33:["pageup"],34:["pagedown"],35:["end"],36:["home"],37:["left"],38:["up"],39:["right"],40:["down"],41:["select"],42:["printscreen"],43:["execute"],44:["snapshot"],45:["insert","ins"],46:["delete","del"],47:["help"],91:["command","windows","win","super","leftcommand","leftwindows","leftwin","leftsuper"],92:["command","windows","win","super","rightcommand","rightwindows","rightwin","rightsuper"],145:["scrolllock","scroll"],186:["semicolon",";"],187:["equal","equalsign","="],188:["comma",","],189:["dash","-"],190:["period","."],191:["slash","forwardslash","/"],192:["graveaccent","`"],219:["openbracket","["],220:["backslash","\\"],221:["closebracket","]"],222:["apostrophe","'"],65:["a"],66:["b"],67:["c"],68:["d"],69:["e"],70:["f"],71:["g"],72:["h"],73:["i"],74:["j"],75:["k"],76:["l"],77:["m"],78:["n"],79:["o"],80:["p"],81:["q"],82:["r"],83:["s"],84:["t"],85:["u"],86:["v"],87:["w"],88:["x"],89:["y"],90:["z"],48:["zero","0"],49:["one","1"],50:["two","2"],51:["three","3"],52:["four","4"],53:["five","5"],54:["six","6"],55:["seven","7"],56:["eight","8"],57:["nine","9"],96:["numzero","num0"],97:["numone","num1"],98:["numtwo","num2"],99:["numthree","num3"],100:["numfour","num4"],101:["numfive","num5"],102:["numsix","num6"],103:["numseven","num7"],104:["numeight","num8"],105:["numnine","num9"],106:["nummultiply","num*"],107:["numadd","num+"],108:["numenter"],109:["numsubtract","num-"],110:["numdecimal","num."],111:["numdevide","num/"],144:["numlock","num"],112:["f1"],113:["f2"],114:["f3"],115:["f4"],116:["f5"],117:["f6"],118:["f7"],119:["f8"],120:["f9"],121:["f10"],122:["f11"],123:["f12"]},macros:[[[[["shift","graveaccent"]]],["tilde","~"]],[[[["shift","one"]]],["exclamation","exclamationpoint","!"]],[[[["shift","two"]]],["at","@"]],[[[["shift","three"]]],["number","#"]],[[[["shift","four"]]],["dollar","dollars","dollarsign","$"]],[[[["shift","five"]]],["percent","%"]],[[[["shift","six"]]],["caret","^"]],[[[["shift","seven"]]],["ampersand","and","&"]],[[[["shift","eight"]]],["asterisk","*"]],[[[["shift","nine"]]],["openparen","("]],[[[["shift","zero"]]],["closeparen",")"]],[[[["shift","dash"]]],["underscore","_"]],[[[["shift","equal"]]],["plus","+"]],[[[["shift","openbracket"]]],["opencurlybrace","opencurlybracket","{"]],[[[["shift","closebracket"]]],["closecurlybrace","closecurlybracket","}"]],[[[["shift","backslash"]]],["verticalbar","|"]],[[[["shift","semicolon"]]],["colon",":"]],[[[["shift","apostrophe"]]],["quotationmark",'"']],[[[["shift","comma"]]],["openanglebracket","<"]],[[[["shift","period"]]],["closeanglebracket",">"]],[[[["shift","forwardslash"]]],["questionmark","?"]],[[[["shift","a"]]],["A"]],[[[["shift","b"]]],["B"]],[[[["shift","c"]]],["C"]],[[[["shift","d"]]],["D"]],[[[["shift","e"]]],["E"]],[[[["shift","f"]]],["F"]],[[[["shift","g"]]],["G"]],[[[["shift","h"]]],["H"]],[[[["shift","i"]]],["I"]],[[[["shift","j"]]],["J"]],[[[["shift","k"]]],["K"]],[[[["shift","l"]]],["L"]],[[[["shift","m"]]],["M"]],[[[["shift","n"]]],["N"]],[[[["shift","o"]]],["O"]],[[[["shift","p"]]],["P"]],[[[["shift","q"]]],["Q"]],[[[["shift","r"]]],["R"]],[[[["shift","s"]]],["S"]],[[[["shift","t"]]],["T"]],[[[["shift","u"]]],["U"]],[[[["shift","v"]]],["V"]],[[[["shift","w"]]],["W"]],[[[["shift","x"]]],["X"]],[[[["shift","y"]]],["Y"]],[[[["shift","z"]]],["Z"]]]}),J("us"),k(),b.enable=k,b.disable=l,b.activeKeys=F,b.on=v,b.clear=w,b.clear.key=x,b.locale=J,b.locale.register=I,b.macro=r,b.macro.remove=s,b.key={},b.key.name=p,b.key.code=q,b.combo={},b.combo.parse=D,b.combo.stringify=E,b});
/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-input-inputtypes-svg-touch-shiv-addtest-teststyles-prefixes-load
 */
;window.Modernizr=function(a,b,c){function x(a){i.cssText=a}function y(a,b){return x(m.join(a+";")+(b||""))}function z(a,b){return typeof a===b}function A(a,b){return!!~(""+a).indexOf(b)}function B(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:z(f,"function")?f.bind(d||b):f}return!1}function C(){e.input=function(c){for(var d=0,e=c.length;d<e;d++)q[c[d]]=c[d]in j;return q.list&&(q.list=!!b.createElement("datalist")&&!!a.HTMLDataListElement),q}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")),e.inputtypes=function(a){for(var d=0,e,g,h,i=a.length;d<i;d++)j.setAttribute("type",g=a[d]),e=j.type!=="text",e&&(j.value=k,j.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(g)&&j.style.WebkitAppearance!==c?(f.appendChild(j),h=b.defaultView,e=h.getComputedStyle&&h.getComputedStyle(j,null).WebkitAppearance!=="textfield"&&j.offsetHeight!==0,f.removeChild(j)):/^(search|tel)$/.test(g)||(/^(url|email)$/.test(g)?e=j.checkValidity&&j.checkValidity()===!1:e=j.value!=k)),p[a[d]]=!!e;return p}("search tel url email datetime date month week time datetime-local number range color".split(" "))}var d="2.6.2",e={},f=b.documentElement,g="modernizr",h=b.createElement(g),i=h.style,j=b.createElement("input"),k=":)",l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n={svg:"http://www.w3.org/2000/svg"},o={},p={},q={},r=[],s=r.slice,t,u=function(a,c,d,e){var h,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:g+(d+1),l.appendChild(j);return h=["&#173;",'<style id="s',g,'">',a,"</style>"].join(""),l.id=g,(m?l:n).innerHTML+=h,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=f.style.overflow,f.style.overflow="hidden",f.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),f.style.overflow=k),!!i},v={}.hasOwnProperty,w;!z(v,"undefined")&&!z(v.call,"undefined")?w=function(a,b){return v.call(a,b)}:w=function(a,b){return b in a&&z(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=s.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(s.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(s.call(arguments)))};return e}),o.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:u(["@media (",m.join("touch-enabled),("),g,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c},o.svg=function(){return!!b.createElementNS&&!!b.createElementNS(n.svg,"svg").createSVGRect};for(var D in o)w(o,D)&&(t=D.toLowerCase(),e[t]=o[D](),r.push((e[t]?"":"no-")+t));return e.input||C(),e.addTest=function(a,b){if(typeof a=="object")for(var d in a)w(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof enableClasses!="undefined"&&enableClasses&&(f.className+=" "+(b?"":"no-")+a),e[a]=b}return e},x(""),h=j=null,function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b)}(this,b),e._version=d,e._prefixes=m,e.testStyles=u,e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};
// tipsy, facebook style tooltips for jquery
// version 1.0.0a
// (c) 2008-2010 jason frame [jason@onehackoranother.com]
// released under the MIT license

(function($) {
    
    function maybeCall(thing, ctx) {
        return (typeof thing == 'function') ? (thing.call(ctx)) : thing;
    };
    
    function isElementInDOM(ele) {
      while (ele = ele.parentNode) {
        if (ele == document) return true;
      }
      return false;
    };
    
    function Tipsy(element, options) {
        this.$element = $(element);
        this.options = options;
        this.enabled = true;
        this.fixTitle();
    };
    
    Tipsy.prototype = {
        show: function() {
            var title = this.getTitle();
            if (title && this.enabled) {
                var $tip = this.tip();
                
                $tip.find('.tipsy-inner')[this.options.html ? 'html' : 'text'](title);
                $tip[0].className = 'tipsy'; // reset classname in case of dynamic gravity
                $tip.remove().css({top: 0, left: 0, visibility: 'hidden', display: 'block'}).prependTo(document.body);
                
                var pos = $.extend({}, this.$element.offset(), {
                    width: this.$element[0].offsetWidth,
                    height: this.$element[0].offsetHeight
                });
                
                var actualWidth = $tip[0].offsetWidth,
                    actualHeight = $tip[0].offsetHeight,
                    gravity = maybeCall(this.options.gravity, this.$element[0]);
                
                var tp;
                switch (gravity.charAt(0)) {
                    case 'n':
                        tp = {top: pos.top + pos.height + this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 's':
                        tp = {top: pos.top - actualHeight - this.options.offset, left: pos.left + pos.width / 2 - actualWidth / 2};
                        break;
                    case 'e':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth - this.options.offset};
                        break;
                    case 'w':
                        tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width + this.options.offset};
                        break;
                }
                
                if (gravity.length == 2) {
                    if (gravity.charAt(1) == 'w') {
                        tp.left = pos.left + pos.width / 2 - 15;
                    } else {
                        tp.left = pos.left + pos.width / 2 - actualWidth + 15;
                    }
                }
                
                $tip.css(tp).addClass('tipsy-' + gravity);
                $tip.find('.tipsy-arrow')[0].className = 'tipsy-arrow tipsy-arrow-' + gravity.charAt(0);
                if (this.options.className) {
                    $tip.addClass(maybeCall(this.options.className, this.$element[0]));
                }
                
                if (this.options.fade) {
                    $tip.stop().css({opacity: 0, display: 'block', visibility: 'visible'}).animate({opacity: this.options.opacity});
                } else {
                    $tip.css({visibility: 'visible', opacity: this.options.opacity});
                }
            }
        },
        
        hide: function() {
            if (this.options.fade) {
                this.tip().stop().fadeOut(function() { $(this).remove(); });
            } else {
                this.tip().remove();
            }
        },
        
        fixTitle: function() {
            var $e = this.$element;
            if ($e.attr('title') || typeof($e.attr('original-title')) != 'string') {
                $e.attr('original-title', $e.attr('title') || '').removeAttr('title');
            }
        },
        
        getTitle: function() {
            var title, $e = this.$element, o = this.options;
            this.fixTitle();
            var title, o = this.options;
            if (typeof o.title == 'string') {
                title = $e.attr(o.title == 'title' ? 'original-title' : o.title);
            } else if (typeof o.title == 'function') {
                title = o.title.call($e[0]);
            }
            title = ('' + title).replace(/(^\s*|\s*$)/, "");
            return title || o.fallback;
        },
        
        tip: function() {
            if (!this.$tip) {
                this.$tip = $('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>');
                this.$tip.data('tipsy-pointee', this.$element[0]);
            }
            return this.$tip;
        },
        
        validate: function() {
            if (!this.$element[0].parentNode) {
                this.hide();
                this.$element = null;
                this.options = null;
            }
        },
        
        enable: function() { this.enabled = true; },
        disable: function() { this.enabled = false; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    };
    
    $.fn.tipsy = function(options) {
        
        if (options === true) {
            return this.data('tipsy');
        } else if (typeof options == 'string') {
            var tipsy = this.data('tipsy');
            if (tipsy) tipsy[options]();
            return this;
        }
        
        options = $.extend({}, $.fn.tipsy.defaults, options);
        
        function get(ele) {
            var tipsy = $.data(ele, 'tipsy');
            if (!tipsy) {
                tipsy = new Tipsy(ele, $.fn.tipsy.elementOptions(ele, options));
                $.data(ele, 'tipsy', tipsy);
            }
            return tipsy;
        }
        
        function enter() {
            var tipsy = get(this);
            tipsy.hoverState = 'in';
            if (options.delayIn == 0) {
                tipsy.show();
            } else {
                tipsy.fixTitle();
                setTimeout(function() { if (tipsy.hoverState == 'in') tipsy.show(); }, options.delayIn);
            }
        };
        
        function leave() {
            var tipsy = get(this);
            tipsy.hoverState = 'out';
            if (options.delayOut == 0) {
                tipsy.hide();
            } else {
                setTimeout(function() { if (tipsy.hoverState == 'out') tipsy.hide(); }, options.delayOut);
            }
        };
        
        if (!options.live) this.each(function() { get(this); });
        
        if (options.trigger != 'manual') {
            var binder   = options.live ? 'live' : 'bind',
                eventIn  = options.trigger == 'hover' ? 'mouseenter' : 'focus',
                eventOut = options.trigger == 'hover' ? 'mouseleave' : 'blur';
            this[binder](eventIn, enter)[binder](eventOut, leave);
        }
        
        return this;
        
    };
    
    $.fn.tipsy.defaults = {
        className: null,
        delayIn: 0,
        delayOut: 0,
        fade: false,
        fallback: '',
        gravity: 'n',
        html: false,
        live: false,
        offset: 0,
        opacity: 0.8,
        title: 'title',
        trigger: 'hover'
    };
    
    $.fn.tipsy.revalidate = function() {
      $('.tipsy').each(function() {
        var pointee = $.data(this, 'tipsy-pointee');
        if (!pointee || !isElementInDOM(pointee)) {
          $(this).remove();
        }
      });
    };
    
    // Overwrite this method to provide options on a per-element basis.
    // For example, you could store the gravity in a 'tipsy-gravity' attribute:
    // return $.extend({}, options, {gravity: $(ele).attr('tipsy-gravity') || 'n' });
    // (remember - do not modify 'options' in place!)
    $.fn.tipsy.elementOptions = function(ele, options) {
        return $.metadata ? $.extend({}, options, $(ele).metadata()) : options;
    };
    
    $.fn.tipsy.autoNS = function() {
        return $(this).offset().top > ($(document).scrollTop() + $(window).height() / 2) ? 's' : 'n';
    };
    
    $.fn.tipsy.autoWE = function() {
        return $(this).offset().left > ($(document).scrollLeft() + $(window).width() / 2) ? 'e' : 'w';
    };
    
    /**
     * yields a closure of the supplied parameters, producing a function that takes
     * no arguments and is suitable for use as an autogravity function like so:
     *
     * @param margin (int) - distance from the viewable region edge that an
     *        element should be before setting its tooltip's gravity to be away
     *        from that edge.
     * @param prefer (string, e.g. 'n', 'sw', 'w') - the direction to prefer
     *        if there are no viewable region edges effecting the tooltip's
     *        gravity. It will try to vary from this minimally, for example,
     *        if 'sw' is preferred and an element is near the right viewable 
     *        region edge, but not the top edge, it will set the gravity for
     *        that element's tooltip to be 'se', preserving the southern
     *        component.
     */
     $.fn.tipsy.autoBounds = function(margin, prefer) {
    return function() {
      var dir = {ns: prefer[0], ew: (prefer.length > 1 ? prefer[1] : false)},
          boundTop = $(document).scrollTop() + margin,
          boundLeft = $(document).scrollLeft() + margin,
          $this = $(this);

      if ($this.offset().top < boundTop) dir.ns = 'n';
      if ($this.offset().left < boundLeft) dir.ew = 'w';
      if ($(window).width() + $(document).scrollLeft() - $this.offset().left < margin) dir.ew = 'e';
      if ($(window).height() + $(document).scrollTop() - $this.offset().top < margin) dir.ns = 's';

      return dir.ns + (dir.ew ? dir.ew : '');
    }
  };
    
})(jQuery);