# Dzieuo.js 
Dzieuo.js is a two dimentional slider plugin for jQuery. It allowes both vertical and horizontal transition between slides.

## Usage

 In order to start dzieuo plugin simply call .dzieuo() method on a selected html element that will act as a container of the slider.
 
```
// start plugin with default options

 $('#dzieuo').dzieuo();

```
## HTML Structure
Proper CSS classes need to be added to html elements to set up vertical and horizontal slides.
- ```.dz-column``` - elements with this class will be treated as horizontal slides.
- ```.dz-row``` - elements with this class will be treated as vertical slides.

**Important:**  *```.dz-row``` elements need to be inside ```.dz-column``` element and a ```.dz-column``` element needs to contain at least one ```.dz-row``` element.*

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
      </div>|
    </div>
  </div>
```

##Options

| Option       | Type  | Default  | Description |
| ------------- |----|-------------| -----|
| prev_arrow_content| string |  `'<img src="Images/arrow-left.png" alt="left navigation arrow">'` | Content of the left (move to previous slide) horizontal arrow. The default is a path to the left arrow image that is provided with the plugin. Whatever content you provide for this option (text, html string etc.) it will be inserted into the arrow's container - ```#dzPrevArrow```.|
| next_arrow_content      | string     |   `'<img src="Images/arrow-right.png" alt="right navigation arrow">'` |  Content of the right (move to next slide) horizontal arrow. The default is a path to the right arrow image that is provided with the plugin. Whatever content you provide for this option (text, html string etc.) it will be inserted into the arrow's container - ```#dzNextArrow```. |
| up_arrow_content      | string     |   `'<img src="Images/arrow-up.png" alt="up navigation arrow">'` |  Content of the up (move to previous slide) vertical arrow. The default is a path to the up arrow image that is provided with the plugin. Whatever content you provide for this option (text, html string etc.) it will be inserted into the arrow's container - ```#dzUpArrow```. |
| down_arrow_content      | string     |   `'<img src="Images/arrow-down.png" alt="down navigation arrow">'` |  Content of the down (move to next slide) vertical arrow. The default is a path to the down arrow image that is provided with the plugin. Whatever content you provide for this option (text, html string etc.) it will be inserted into the arrow's container - ```#dzDownArrow```. |
| initialize_horizontal_arrows_position      | bool   |   `true` | Specifies if plugin should automatically calculate and set horizontal arrows' positions so that they will be placed in the middle of the screen. It will also recalculate and reset their positions on window resize event as well as on orientation changed event for mobile devices so that the arrows will always be placed in the middle of the screen. Setting this option to `false` will give user the power to place horizontal arrows wherever he wants by styling their appropriate css containers and the plugin will not override their positions. **Side note:** *Generally it is recomended to leave this option as it is (`true`) unless you really want to position horizontal arrows yourself.*
| initialize_vertical_arrows_position     | bool   |   `true` | Specifies if plugin should automatically calculate and set vertical arrows' positions so that they will be placed in the middle of the screen. It will also recalculate and reset their positions on window resize event as well as on orientation changed event for mobile devices so that the arrows will always be placed in the middle of the screen. Setting this option to `false` will give user the power to place vertical arrows wherever he wants by styling their appropriate css containers and the plugin will not override their positions. **Side note:** *Generally it is recomended to leave this option as it is (`true`) unless you really want to position vertical arrows yourself.*
| initialize_vertical_paging_position     | bool   |   `true` | Specifies if plugin should automatically calculate and set vertical's paging position so that it will be placed in the middle of the screen. It will also recalculate and reset its position on window resize event as well as on orientation changed event for mobile devices so that the vertical paging container will always be placed in the middle of the screen. Setting this option to `false` will give user the power to place vertical paging wherever he wants by styling its appropriate css container and the plugin will not override its position. **Side note:** *Generally it is recomended to leave this option as it is (`true`) unless you really want to position vertical paging yourself.*
| row_scroll_padding_top     | number   | `0` | Specifies the offset distance (in pixels) from the top of the current slide.
| scroll_calculation_interval | number   | `50` |  Specifies the interval time (in miliseconds) of when the plugin should recalculate scroll position. Whenever a scroll event is detected (if user is scrolling a page) then plugin recalculates scroll position at a specified interval thus marking proper vertical paging element as the current one. It may happen that if user scrolls really fast (in less than the specified time amount option value) then the plugin may miss calculation of scroll position thus we may see incorrect vertical paging element set as the current one. It would be ideal to have this option value set as low as possible but there is a scroll performance loss to consider. If we set this value to something too low then calculations will be fired so often while user is scrolling resulting in a choppy, uneven/unsmooth scrolling. **Side note:** *The default value of 50 seems to be just fine for most purposes so it is recommended to leave it like that.* 
| horizontal_animation_speed     | number   | `800` | Specifies horizontal animation speed (in milliseconds).
| vertical_animation_speed     | number   | `800` | Specifies vertical animation speed (in milliseconds).
| hide_vertical_paging_when_single_row | bool | `true` | Specifies if vertical paging control should be hidden when only one slide (single `.row` element) is present.
| hide_horizontal_paging_when_single_column | bool | `true` | Specifies if horizontal paging control should be hidden when only one slide (single `.column` element) is present.
| horizontal_animation_easing  | string   | `'slide'` | Specifies what kind of animation will be used for horizontal transition.
| vertical_animation_easing  | string   | `'slide'` | Specifies what kind of animation will be used for vertical transition.

Available animation_easing option values are: 

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


