# Dzieuo.js 
Dzieuo.js is a two dimentional slider plugin for jQuery. It allowes both vertical and horizontal transition between slides.

## Setup
Download plugin as .zip from github and add all necessary files to your project manually or install plugin package by using 
[Bower package manager](http://bower.io/). 

```
bower install dzieuo.js --save
```


## Usage

First make sure you have included script references for jQuery, jQuery.animate-enchanced.min.js and dzieuo.js like so:
```
  <script src="Lib/jquery-2.0.3.min.js"></script>
  <script src="Lib/jquery.animate-enhanced.min.js"></script>
  <script src="dzieuo.js"></script>
```
 To start dzieuo plugin simply call `.dzieuo()` method on a selected html element that will act as a container for the slider.
 
```
// start plugin with default options

 $('#dzieuo').dzieuo();

```
## HTML Structure
Proper CSS classes must be added to html elements to set up vertical and horizontal slides.
- ```.dz-column``` - elements with this class will be treated as horizontal slides.
- ```.dz-row``` - elements with this class will be treated as vertical slides.

**Important:**  *```.dz-column``` elements must be nested inside slider's container as first direct descendants. It means that the provided slider's container must only contain one or more ```.dz-column``` elements and nothing else. Siblings of ```.dz-column``` elements must be other ```.dz-column``` elements. Each  ```.dz-column``` element must contain at least one ```.dz-row``` element as first direct descendant. Similarly siblings of ```.dz-row``` elements must be other ```.dz-row``` elements*.

So HTML markup could be like this:

```
  <div id="dzieuo">
    <div class="dz-column">
      <div class="dz-row">
        horizontal slide #1, vertical slide #1
      </div>
      <div class="dz-row">
        horizontal slide #1, vertical slide #2
      </div>
      <div class="dz-row">
        horizontal slide #1, vertical slide #3
      </div>
    </div>
    <div class="dz-column">
      <div class="dz-row">
        horizontal slide #2, vertical slide #1
      </div>
      <div class="dz-row">
        horizontal slide #2, vertical slide #2
      </div>
      <div class="dz-row">
        horizontal slide #2, vertical slide #3
      </div>
    </div>
    <div class="dz-column">
      <div class="dz-row">
        horizontal slide #3, vertical slide #1
      </div>
      <div class="dz-row">
        horizontal slide #3, vertical slide #2
      </div>
      <div class="dz-row">
        horizontal slide #3, vertical slide #3
      </div>
    </div>
  </div>
```

##Options

| Option       | Type  | Default  | Description |
| ------------- |----|-------------| -----|
| prev_arrow_content| string |  `'<img src="Images/arrow-left.png" alt="left navigation arrow">'` | Content of the left (move to previous slide) horizontal arrow. The default is an image tag HTML string linked to the left arrow image that is provided with the plugin. Whatever content you provide for this option (text, html string etc.) it will be inserted into the arrow's container - ```#dzPrevArrow```.|
| next_arrow_content      | string     |   `'<img src="Images/arrow-right.png" alt="right navigation arrow">'` |  Content of the right (move to next slide) horizontal arrow. The default is an image tag HTML string linked to the right arrow image that is provided with the plugin. Whatever content you provide for this option (text, html string etc.) it will be inserted into the arrow's container - ```#dzNextArrow```. |
| up_arrow_content      | string     |   `'<img src="Images/arrow-up.png" alt="up navigation arrow">'` |  Content of the up (move to previous slide) vertical arrow. The default is an image tag HTML string linked to the up arrow image that is provided with the plugin. Whatever content you provide for this option (text, html string etc.) it will be inserted into the arrow's container - ```#dzUpArrow```. |
| down_arrow_content      | string     |   `'<img src="Images/arrow-down.png" alt="down navigation arrow">'` |  Content of the down (move to next slide) vertical arrow. The default is an image tag HTML string linked to the down arrow image that is provided with the plugin. Whatever content you provide for this option (text, html string etc.) it will be inserted into the arrow's container - ```#dzDownArrow```. |
| initialize_horizontal_arrows_position      | bool   |   `true` | Specifies if plugin should automatically calculate and set horizontal arrows' positions so that they will be placed in the middle of the screen. It will also recalculate and reset their positions on window resize event as well as on orientation changed event for mobile devices so that the arrows will always be placed in the middle of the screen. Setting this option to `false` will give user the power to place horizontal arrows wherever he wants by styling their appropriate css containers and the plugin will not override their positions. **Side note:** *Generally it is recomended to leave this option as it is (`true`) unless you really want to position horizontal arrows yourself.*
| initialize_vertical_arrows_position     | bool   |   `true` | Specifies if plugin should automatically calculate and set vertical arrows' positions so that they will be placed in the middle of the screen. It will also recalculate and reset their positions on window resize event as well as on orientation changed event for mobile devices so that the arrows will always be placed in the middle of the screen. Setting this option to `false` will give user the power to place vertical arrows wherever he wants by styling their appropriate css containers and the plugin will not override their positions. **Side note:** *Generally it is recomended to leave this option as it is (`true`) unless you really want to position vertical arrows yourself.*
| initialize_vertical_paging_position     | bool   |   `true` | Specifies if plugin should automatically calculate and set vertical's paging position so that it will be placed in the middle of the screen. It will also recalculate and reset its position on window resize event as well as on orientation changed event for mobile devices so that the vertical paging container will always be placed in the middle of the screen. Setting this option to `false` will give user the power to place vertical paging wherever he wants by styling its appropriate css container and the plugin will not override its position. **Side note:** *Generally it is recomended to leave this option as it is (`true`) unless you really want to position vertical paging yourself.*
| row_scroll_padding_top     | number   | `0` | Specifies the offset distance (in pixels) from the top of the current slide.
| scroll_calculation_interval | number   | `50` |  Specifies the interval time (in miliseconds) of when the plugin should recalculate scroll position. Whenever a scroll event is detected (if user is scrolling a page) then plugin recalculates scroll position at a specified interval thus marking proper vertical paging element as the current one. It may happen that if user scrolls really fast (in less than the specified time amount option value) then the plugin may miss calculation of scroll position thus we may see incorrect vertical paging element set as the current one. It would be ideal to have this option value set as low as possible but there is a scroll performance loss to consider. If we set this value to something too low then calculations will be fired so often while user is scrolling resulting in a choppy, uneven/unsmooth scrolling. **Side note:** *The default value of 50 seems to be just fine for most purposes so it is recommended to leave it like that.* 
| horizontal_animation_speed     | number   | `800` | Specifies horizontal animation speed (in milliseconds).
| vertical_animation_speed     | number   | `800` | Specifies vertical animation speed (in milliseconds).
| hide_vertical_paging_when_single_row | bool | `true` | Specifies if vertical paging control should be hidden when only one slide (single `.row` element) is present.
| hide_horizontal_paging_when_single_column | bool | `true` | Specifies if horizontal paging control should be hidden when only one slide (single `.column` element) is present.
| full_screen_mode  | bool  | `'false'` | Sets ```.dz-row``` element's height to window height so slides will be "full screen".
| row_height | number  | `0` | Sets ```.dz-row``` element's height to specified value. Value provided must be greater than ```0```. **Side note:** *This option should usually be used with option ```full_screen_mode```. When ```full_screen_mode``` is ```true``` and ```row_height``` is greater than ```0``` then plugin will compare screen's height and value provided in ```row_height``` and whichever  is greater then that is what is going to be applied to rows' height. For example - such functionality is sometimes desired in mobile devices. We can make slides (```.dz-row``` elements) to be in fullscreen mode (have height same as screen's height) in portrait mode but when phone changes orientation to landscape (rows' height will be readjusted to the "new" screen's height) then it may happen that the new height is not suitable (for example child elements overflow parent row element in landscape mode because height of the row element is now not big enough) so for such case we can specify ```row_height``` and if it is greater than the device's screen's height it will be used to set slides' new height.* 
| horizontal_animation_easing  | string   | `'slide'` | Specifies what kind of animation will be used for horizontal transition. Look below for a list of available animations.
| vertical_animation_easing  | string   | `'slide'` | Specifies what kind of animation will be used for vertical transition. Look below for a list of available animations.

Available animation_easing option values: 

* `'slide'`
* `'bounce'`
* `'linear'`
* `'swing'`
* `'easeInQuad'`
* `'easeInCubic'`
* `'easeInQuart'`
* `'easeInQuint'`
* `'easeInSine'`
* `'easeInExpo'`
* `'easeInCirc'`
* `'easeInBack'`
* `'easeOutQuad'`
* `'easeOutCubic'`
* `'easeOutQuart'`
* `'easeOutQuint'`
* `'easeOutSine'`
* `'easeOutExpo'`
* `'easeOutCirc'`
* `'easeOutBack'`
* `'easeInOutQuad'`
* `'easeInOutCubic'`
* `'easeInOutQuart'`
* `'easeInOutQuint'`
* `'easeInOutQuint'`
* `'easeInOutExpo'`
* `'easeInOutCirc'`
* `'easeInOutBack'`

## Example

``` 
// start slider with options

$('#dzieuo').dzieuo({
      prev_arrow_content: '<img src="Images/arrow-left.png" alt="left navigation arrow">',
      next_arrow_content: '<img src="Images/arrow-right.png" alt="right navigation arrow">',
      up_arrow_content: '<img src="Images/arrow-up.png" alt="up navigation arrow">',
      down_arrow_content: '<img src="Images/arrow-down.png" alt="down navigation arrow">',
      initialize_horizontal_arrows_position: true,
      initialize_vertical_arrows_position: true,
      initialize_vertical_paging_position: true,
      row_scroll_padding_top: 0,
      scroll_calculation_interval: 50,
      horizontal_animation_easing: 'slide',
      horizontal_animation_speed: 800,
      vertical_animation_easing: 'slide',
      vertical_animation_speed: 800,
      hide_vertical_paging_when_single_row: true,
      hide_horizontal_paging_when_single_column: true,
      full_screen_mode: false
    });
```
## Styling

All styles for the plugin are found in dzieuo.css file.

`'.dz-row'` elements have initial height of 400px in css so feel free to remove/change this value to what you want.

**Important:** *If you plan to override default options `'prev_arrow_content'` and `'next_arrow_content'` with your own image tags then make sure you set the proper height in css for `#dzPrevArrow` and `#dzNextArrow`. Height of these containers should be the same as the height of the image. These heights are used by the plugin to place horizontal arrows in the middle of the screen.*

## Events

Dzieuo provides five events that allow us to process our own custom logic at the beginning and at the end of a slide animation. 

| Event name       | When is fired  |
| ------------- |----|
| `'horizontal_transition:before'` | Fires right before each horizontal animation
| `'horizontal_transition:after'` | Fires right after each horizontal animation
| `'vertical_transition:before'` | Fires right before each vertical animation
| `'vertical_transition:after'` | Fires right after each vertical animation
| `'vertical_scroll:row_changed'` | Fires when a row element (vertical slide) is set as the current one. For example when user scrolls down to a new vertical slide element.

Each fired event holds a transitionEventParam object that can be used to find out which slides are being animated.
Properties of transitionEventParam object:

| name       | type  | description |
| ------------- |----|------|
| `currentColumn` | number | Contains index of the current column element (horizontal slide).
| `targetColumn` | number| Contains index of the target column element (horizontal slide).
| `currentRow` | number| Contains index of the current row element (vertical slide).
| `targetRow` | number| Contains index of the target row element (vertical slide).

Index values start from 0.

**Important:** *For events `'horizontal_transition:after'`,`'vertical_transition:after'` and `'vertical_scroll:row_changed'`
value of currentRow/currentColumn (depending whether it is a horizontal or vertical transition) will be the index of the previous slide (the slide that we just moved from) and the index of the current slide (the slide that we just moved to) will now be found in the targetRow/targetColumn property.*


## Example

Listening to the events:

```
// an example how we can intercept these events
// e - is the native jQuery event param object
// arg - is the dzieuo's custom transitionEventParam object

    $(document).bind("horizontal_transition:before", function (e, arg) {
      console.log("horizontal_transition:before");
      console.log(arg);
    });
    $(document).bind("vertical_transition:before", function (e, arg) {
      console.log("vertical_transition:before");
      console.log(arg);
    });
    $(document).bind("horizontal_transition:after", function (e, arg) {
      console.log("horizontal_transition:after");
      console.log(arg);
    });
    $(document).bind("vertical_transition:after", function (e, arg) {
      console.log("vertical_transition:after");
      console.log(arg);
    });
    $(document).bind("vertical_scroll:row_changed", function (e, arg) {
      console.log("vertical_scroll:row_changed");
      console.log(arg);
    });
```
## Hardware acceleration

Dzieuo uses the jQuery Animate Enhanced plugin for additional slide animations and for smooth transitions using CSS instead of JavaScript which jQuery Animate Enhanced takes care of.

Checkout jQuery Animate Enhanced at https://github.com/benbarnett/jquery-animate-enhanced

## Inspiration

Superslides plugin was the source of knowledge and inspiration to write my own slider with additional 2D functionality. 
Checkout Superslides plugin at http://archive.nicinabox.com/superslides/#1 

