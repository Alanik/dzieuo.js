﻿(function ($) {
  "use strict";
  function createDzieuo($dzieuo, opts) {

    // issues TODO:
    // 1. #viewPort adds up css left property value resulting in a very big negative or positive css left value.
    // Perhaps it can be optimized - Left property should be +- screen width value.

    //default options
    var OPTIONS = {
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
      hide_horizontal_paging_when_single_column: true
    }

    $.extend(OPTIONS, opts);

    /////////////////////////////////////////
    //private object definitions
    /////////////////////////////////////////
    var ViewPortItem = function (data, column, row) {
      this.column = column;
      this.row = row;

      this.get$Column = function () {
        return data.structure.columns[this.column].$column;
      }

      this.get$Row = function () {
        return data.structure.columns[data.viewPort.currentItem.column].rows[this.row];
      }
    }

    var urlRouter = function (data, beginHorizontalTransitionFn) {
      var self = this;
      self.hash = 0;

      self.initialize = function () {
        window.location.hash = self.hash;

        $(window).on('hashchange', function () {
          var hash;
          if (!data.viewPort.isAnimationInProgressX) {
            hash = parseInt(window.location.hash.substr(1));

            if (hash >= 0 && hash < data.structure.numOfColumns) {
              if (self.hash < hash) {
                self.hash = hash;
                data.structure.$nextHorizontalArrow.attr('href', "#" + self.hash);
                beginHorizontalTransitionFn(data, self.hash)
              } else if (self.hash > hash) {
                self.hash = hash;
                data.structure.$prevHorizontalArrow.attr('href', "#" + self.hash);
                beginHorizontalTransitionFn(data, self.hash)
              }
            } else {
              self.hash = 0;
              window.location.hash = self.hash;
            }
          }
        })
      }
    }
    ///////////////////////////////////////////
    //private plugin state
    ///////////////////////////////////////////
    var _data = {
      structure: {
        $dzieuo: $dzieuo,
        $viewPort: null,
        $horizontalPaging: null,
        $prevHorizontalArrow: null,
        $nextHorizontalArrow: null,
        $horizontalNav: null,
        $verticalPaging: null,
        $downVerticalArrow: null,
        $upVerticalArrow: null,
        $verticalNav: null,
        columns: [ //{ $column : $(column), rows : [ $(row) , $(row) ], numOfRows = rows.length, currentRow = 0 }
        ],
        numOfColumns: 0
      },
      viewPort: {
        prevItem: null, // new ViewPortItem(_data.structure, 0, 0 )
        currentItem: null, // new ViewPortItem(_data.structure, 0, 0 )
        nextItem: null, // new ViewPortItem(_data.structure, 1, 0 )
        isAnimationInProgressX: false,
        isAnimationInProgressY: false,
        horizontalSlideOffset: 0
      },
      scroll: {
        lastScrollTop: 0,
        shouldCalculateScroll: true
      }
    };

    ///////////////////////////////////////////
    //private plugin initialization methods
    ///////////////////////////////////////////
    var _plugin = {

      // call order:
      // 1
      setUpDataStructure: function (structure) {
        var $columns = structure.$dzieuo.children();
        var numOfColumns = 0;
        var numOfRows = 0;

        $columns.each(function (columnIndex) {
          numOfColumns++;
          var $column = $(this);
          var column = { "$column": $column, "rows": [], "currentRow": 0 };

          structure.columns.push(column);

          $column.children().each(function (rowIndex) {
            numOfRows++;
            column.rows.push($(this));
          });

          structure.columns[columnIndex].numOfRows = numOfRows;

          numOfRows = 0;
        })

        structure.numOfColumns = numOfColumns;
      },
      // 2
      setUpViewPortItems: function (data) {
        var col, row;

        data.viewPort.currentItem = new ViewPortItem(data, 0, 0);
        data.viewPort.prevItem = new ViewPortItem(data, 0, 0)

        col = data.structure.numOfColumns == 1 ? 0 : 1;
        row = data.structure.columns[0].numOfRows == 1 ? 0 : 1;

        data.viewPort.nextItem = new ViewPortItem(data, col, row);
        data.viewPort.horizontalSlideOffset = data.structure.$dzieuo.width() - 20;
      },
      // 3
      setUpViewPort: function (structure) {
        var $row, $rows, $column, $columnInnerWrapper;
        var viewPortContainerId = 'dzViewPort';
        var $viewPortContainer = $('<div id="' + viewPortContainerId + '"></div>');
        var columnInnerWrapperClass = 'dz-column-inner-wrapper';
        var $columns = structure.$dzieuo.children();

        // add 'current' class to first dz-row in first column
        if ($columns.length) {
          $rows = $columns.first().children();
          $row = $rows.first()
          if ($row.length) {
            $row.addClass('current')
          }
        }

        // set up inner wrapper per column
        $columns.each(function (index, element) {
          $column = $(element);
          $rows = $column.children();
          $columnInnerWrapper = $('<div class="' + columnInnerWrapperClass + '"></div>');
          $rows.detach().appendTo($columnInnerWrapper);
          $columnInnerWrapper.appendTo($column);
        })

        $columns.hide();
        $columns.detach().appendTo($viewPortContainer);
        $dzieuo.append($viewPortContainer);

        structure.$viewPort = $viewPortContainer;
      },
      // 4
      setUpHorizontalNav: function (structure) {
        var containerId = "dzHorizontalNav", prevArrowId = "dzPrevArrow", nextArrowId = "dzNextArrow";
        var $nav, $prevArrow, $nextArrow, winHalfHeight, style = '';

        $prevArrow = $("<a id ='" + prevArrowId + "' href='#' style='display:none'></a>");

        if (!OPTIONS.hide_horizontal_paging_when_single_column || structure.numOfColumns > 1) {

          if (!OPTIONS.hide_horizontal_paging_when_single_column) {
            style = "style='display:none'";
          }

          $nav = $("<nav id='" + containerId + "'></nav>");
          $nextArrow = $("<a id='" + nextArrowId + "' href='#' " + style + "></a>");

          winHalfHeight = _plugin.getHalfWindowHeight();

          $prevArrow.html(OPTIONS.prev_arrow_content);
          $nextArrow.html(OPTIONS.next_arrow_content);

          $nav.append($prevArrow);
          $nav.append($nextArrow);

          structure.$dzieuo.append($nav);

          structure.$prevHorizontalArrow = $prevArrow;
          structure.$nextHorizontalArrow = $nextArrow;
          structure.$horizontalNav = $nav;

          // horizontal arrows
          if (OPTIONS.initialize_horizontal_arrows_position) {
            $prevArrow.css('top', winHalfHeight - ($prevArrow.height() / 2));
            $nextArrow.css('top', winHalfHeight - ($nextArrow.height() / 2));
          }
        }
      },
      // 5
      setUpHorizontalPaging: function (structure) {
        var containerId = "dzHorizontalPaging";
        var pageItemClass = "dz-horizontal-paging-item";
        var nav, $paging;

        if (!OPTIONS.hide_horizontal_paging_when_single_column || structure.numOfColumns > 1) {
          nav = "<nav id='" + containerId + "'>"
          nav += "<a class='" + pageItemClass + " current' href='#0' data-column='0'></a>";
          for (var i = 1; i < structure.numOfColumns; i++) {
            nav += "<a class='" + pageItemClass + "' href='#" + i + "' data-column='" + i + "'></a>";
          }
          nav += "</nav>";

          $paging = $(nav);
          structure.$dzieuo.append($paging);

          structure.$horizontalPaging = $paging;
        }
      },
      // 6
      setUpVerticalNav: function (data) {
        var containerId = "dzVerticalNav", className = "dz-nav-arrows", prevArrowId = "dzUpArrow", nextArrowId = "dzDownArrow";
        var $prevArrow, $nextArrow, $nav = $("<nav id='" + containerId + "'></nav>");
        var style = "style='display:none'", structure = data.structure;

        $prevArrow = $("<a id='" + prevArrowId + "' class='" + className + "' href='#' " + style + "></a>");

        if (structure.columns[data.viewPort.currentItem.column].numOfRows > 1) {
          style = '';
        }

        $nextArrow = $("<a id='" + nextArrowId + "' class='" + className + "' href='#' " + style + "></a>");

        $prevArrow.html(OPTIONS.up_arrow_content);
        $nextArrow.html(OPTIONS.down_arrow_content);
        $nav.append($prevArrow);
        $nav.append($nextArrow);

        structure.$dzieuo.append($nav);

        structure.$upVerticalArrow = $nav.find("#" + prevArrowId);
        structure.$downVerticalArrow = $nav.find("#" + nextArrowId);
        structure.$verticalNav = $nav;

        if (OPTIONS.initialize_vertical_arrows_position) {
          $nav.css('top', _plugin.getHalfWindowHeight() - ($nav.height() / 2));
        }

      },
      // 7
      setUpVerticalPaging: function (data) {
        var containerId = "dzVerticalPaging";
        var pageItemClass = "dz-vertical-paging-item";
        var html = "<nav id='" + containerId + "'>";

        if (!OPTIONS.hide_vertical_paging_when_single_row || data.structure.columns[data.viewPort.currentItem.column].numOfRows > 1) {
          html += "<a class='" + pageItemClass + " current' href='#" + data.viewPort.currentItem.column + "' data-row='0'>";

          for (var i = 1; i < data.structure.columns[data.viewPort.currentItem.column].numOfRows; i++) {
            html += "<a class='" + pageItemClass + "' href='#" + data.viewPort.currentItem.column + "' data-row='" + i + "'>";
          }
        }

        html += "</nav>";

        var $paging = $(html);
        data.structure.$dzieuo.append($paging);
        data.structure.$verticalPaging = $paging;

        if (OPTIONS.initialize_vertical_paging_position) {
          $paging.css('top', _plugin.getHalfWindowHeight() - ($paging.height() / 2));
        }
      },
      // 8
      setUpViewPortPositions: function (viewPort) {
        var $currentViewPortElement = viewPort.currentItem.get$Column()
        $currentViewPortElement.show();
        $currentViewPortElement.css({ "left": 0, "top": 0 });
      },
      // 9
      setUpInitialColumnCssOverflow: function (structure) {
        _plugin.setUpColumnCssOverflow(0, structure);
      },
      // 10
      setUpClickHandlers: function (data) {
        data.structure.$dzieuo.on("click", "#dzNextArrow", function () {
          if (!data.viewPort.isAnimationInProgressX) {
            data.structure.$nextHorizontalArrow.attr('href', "#" + data.viewPort.nextItem.column);
            _plugin.beginHorizontalTransition(data, data.viewPort.nextItem.column);
          }
        })

        data.structure.$dzieuo.on("click", "#dzPrevArrow", function () {
          if (!data.viewPort.isAnimationInProgressX) {
            data.structure.$prevHorizontalArrow.attr('href', "#" + data.viewPort.prevItem.column);
            _plugin.beginHorizontalTransition(data, data.viewPort.prevItem.column);
          }
        })

        data.structure.$dzieuo.on("click", "#dzDownArrow", function () {
          if (!data.viewPort.isAnimationInProgressY) {
            data.scroll.shouldCalculateScroll = false;
            data.structure.$downVerticalArrow.attr('href', "#" + data.viewPort.currentItem.column);
            _plugin.beginVerticalTransition(data, data.viewPort.currentItem.row + 1);
          }
        })

        data.structure.$dzieuo.on("click", "#dzUpArrow", function () {
          if (!data.viewPort.isAnimationInProgressY) {
            data.scroll.shouldCalculateScroll = false;

            data.structure.$upVerticalArrow.attr('href', "#" + data.viewPort.currentItem.column);
            _plugin.beginVerticalTransition(data, data.viewPort.currentItem.row - 1);
          }
        })

        data.structure.$dzieuo.on("click", ".dz-horizontal-paging-item", function () {
          var targetColumn = $(this).data("column");

          if (!data.viewPort.isAnimationInProgressX && data.viewPort.currentItem.column !== targetColumn) {
            if (data.viewPort.currentItem.column < targetColumn) {
              _plugin.beginHorizontalTransition(data, targetColumn);
            }
            else if (data.viewPort.currentItem.column > targetColumn) {
              _plugin.beginHorizontalTransition(data, targetColumn);
            }
          }
        });

        data.structure.$dzieuo.on("click", ".dz-vertical-paging-item", function () {
          var targetRow = $(this).data("row");

          if (!data.viewPort.isAnimationInProgressY && data.viewPort.currentItem.row !== targetRow) {
            data.scroll.shouldCalculateScroll = false;
            _plugin.beginVerticalTransition(data, targetRow);
          }
        })
      },
      // 11
      updateVerticalPagingOnWindowScroll: function (data) {
        var currentColumn, winHeightHalf, $nextRow, $currentRow;
        var viewPort = data.viewPort, structure = data.structure, scroll = data.scroll;

        function throttle(fn, delay) {
          delay || (delay = 100);
          var last = +new Date;
          return function () {
            var now = +new Date;
            if (now - last > delay) {
              fn.apply(this, arguments);
              last = now;
            }
          };
        };

        $(".dz-column").scroll(throttle(function () {
          var st, currentColumn = viewPort.currentItem.column;

          // if only one row exists no need to do any calculations
          if (structure.columns[currentColumn].numOfRows === 1) {
            return;
          }

          if (scroll.shouldCalculateScroll) {

            winHeightHalf = _plugin.getHalfWindowHeight();
            st = $(this).scrollTop();

            // scroll down
            if (st > scroll.lastScrollTop) {
              $nextRow = viewPort.nextItem.get$Row();

              if ($nextRow.offset().top <= winHeightHalf && viewPort.currentItem.row !== viewPort.nextItem.row) {
                _plugin.rowToggleCurrentClass(data, viewPort.nextItem.row, true);

                viewPort.prevItem.row = viewPort.currentItem.row;
                viewPort.currentItem.row = viewPort.nextItem.row;

                if (structure.columns[currentColumn].numOfRows - 1 > viewPort.nextItem.row) {
                  viewPort.nextItem.row++;
                }

                structure.columns[currentColumn].currentRow = viewPort.currentItem.row;
                _plugin.updateVerticalPaging(structure.$verticalPaging, viewPort.currentItem.row);
                _plugin.toggleVerticalArrowVisibility(viewPort.prevItem.row, viewPort.currentItem.row, viewPort.currentItem.column, data);

              }
            }
              // scroll up
            else {
              $currentRow = viewPort.currentItem.get$Row();

              if ($currentRow.offset().top >= winHeightHalf && viewPort.currentItem.row !== viewPort.prevItem.row) {
                _plugin.rowToggleCurrentClass(data, viewPort.prevItem.row, true);

                viewPort.nextItem.row = viewPort.currentItem.row;
                viewPort.currentItem.row = viewPort.prevItem.row;

                if (viewPort.currentItem.row !== 0) {
                  viewPort.prevItem.row--;
                }

                structure.columns[currentColumn].currentRow = viewPort.currentItem.row;
                _plugin.updateVerticalPaging(structure.$verticalPaging, viewPort.currentItem.row);
                _plugin.toggleVerticalArrowVisibility(viewPort.nextItem.row, viewPort.currentItem.row, viewPort.currentItem.column, data);
              }
            }

            scroll.lastScrollTop = st;
          }

        }, OPTIONS.scroll_calculation_interval));
      },
      // 12
      updatePagingAndArrowsOnWindowResize: function (data) {
        $(window).on('resize', function () {
          setTimeout(function () {
            var winHalfHeight = _plugin.getHalfWindowHeight();

            // horizontal arrows
            if (data.structure.numOfColumns > 1 && OPTIONS.initialize_horizontal_arrows_position) {
              data.structure.$prevHorizontalArrow.css('top', winHalfHeight - (data.structure.$prevHorizontalArrow.height() / 2));
              data.structure.$nextHorizontalArrow.css('top', winHalfHeight - (data.structure.$nextHorizontalArrow.height() / 2));
            }

            // vertical paging
            if (OPTIONS.initialize_vertical_paging_position) {
              data.structure.$verticalPaging.css('top', winHalfHeight - (data.structure.$verticalPaging.height() / 2));
            }

            // vertical arrows
            if (OPTIONS.initialize_vertical_arrows_position) {
              data.structure.$verticalNav.css('top', _plugin.getHalfWindowHeight() - (data.structure.$verticalNav.height() / 2));
            }

          }, 10);
        });
      }
    };

    ///////////////////////////////////////////
    //private other plugin  methods
    ///////////////////////////////////////////
    _plugin.beginHorizontalTransition = function (data, targetColumn) {
      var columnObj, $row, topOffset, currentRow;

      if (data.viewPort.currentItem.column < targetColumn) {
        if ((data.viewPort.currentItem.column + 1) === data.structure.numOfColumns) {
          return false;
        }

        reCreateVerticalPaging(data, targetColumn);
        _plugin.updateVerticalPaging(data.structure.$verticalPaging, data.structure.columns[targetColumn].currentRow);
        _plugin.toggleVerticalArrowVisibility(data.viewPort.currentItem.row, data.structure.columns[targetColumn].currentRow, targetColumn, data);
        updateHorizontalPaging(data.structure.$horizontalPaging, targetColumn);
        moveToNext(data, targetColumn);
      }
      else {
        if ((data.viewPort.currentItem.column === 0)) {
          return false;
        }

        reCreateVerticalPaging(data, targetColumn);
        _plugin.updateVerticalPaging(data.structure.$verticalPaging, data.structure.columns[targetColumn].currentRow);
        _plugin.toggleVerticalArrowVisibility(data.viewPort.currentItem.row, data.structure.columns[targetColumn].currentRow, targetColumn, data);
        updateHorizontalPaging(data.structure.$horizontalPaging, targetColumn);
        moveToPrevious(data, targetColumn);
      }

      function moveToNext(data, targetColumnIndex) {
        var columnObj = data.structure.columns[targetColumnIndex];
        var left = data.structure.$viewPort.offset().left;
        var $row = columnObj.rows[columnObj.currentRow];

        columnObj.$column.show();

        _plugin.setUpColumnCssOverflow(targetColumnIndex, data.structure);

        data.viewPort.prevItem.column = data.viewPort.currentItem.column;
        data.viewPort.nextItem.column = targetColumnIndex;
        data.viewPort.currentItem.column = targetColumnIndex;

        toggleHorizontalArrowVisibility(targetColumnIndex, data.viewPort.prevItem.column, data.structure);

        columnObj.$column.css({ "left": data.viewPort.horizontalSlideOffset - left, "top": 0 });

        data.viewPort.isAnimationInProgressX = true;
        data.structure.$viewPort.animate({
          "left": (left - data.viewPort.horizontalSlideOffset)
        }, OPTIONS.horizontal_animation_speed, OPTIONS.horizontal_animation_easing, function () {

          data.viewPort.prevItem.get$Column().hide();
          data.viewPort.prevItem.column = targetColumnIndex - 1;
          data.viewPort.nextItem.column++;

          data.viewPort.currentItem.row = columnObj.currentRow;
          data.viewPort.prevItem.row = columnObj.currentRow - 1;
          data.viewPort.nextItem.row = columnObj.currentRow + 1;

          data.viewPort.isAnimationInProgressX = false;

          _plugin.rowToggleCurrentClass(data, data.viewPort.currentItem.row, false);

          data.scroll.lastScrollTop = columnObj.$column.scrollTop();
        });
      }

      function moveToPrevious(data, targetColumnIndex) {
        var columnObj = data.structure.columns[targetColumnIndex]
        var left = data.structure.$viewPort.offset().left;
        var $row = columnObj.rows[columnObj.currentRow];

        columnObj.$column.show();

        // if column div's height is less than the dzieuo's height hide scrollbar
        if (columnObj.$column.children().height() <= data.structure.$dzieuo.height()) {
          columnObj.$column.css("overflow-y", "hidden");
        } else {
          columnObj.$column.css("overflow-y", "scroll");
        }

        data.viewPort.nextItem.column = data.viewPort.currentItem.column;
        data.viewPort.prevItem.column = targetColumnIndex;
        data.viewPort.currentItem.column = targetColumnIndex;

        toggleHorizontalArrowVisibility(targetColumnIndex, data.viewPort.nextItem.column, data.structure);

        columnObj.$column.css({ "left": (-data.viewPort.horizontalSlideOffset) - left, "top": 0 });

        data.viewPort.isAnimationInProgressX = true;

        data.structure.$viewPort.animate({
          "left": (left + data.viewPort.horizontalSlideOffset)
        }, OPTIONS.horizontal_animation_speed, OPTIONS.horizontal_animation_easing, function () {
          data.viewPort.nextItem.get$Column().hide();
          data.viewPort.nextItem.column = targetColumnIndex + 1;
          data.viewPort.prevItem.column--;

          data.viewPort.currentItem.row = columnObj.currentRow;
          data.viewPort.nextItem.row = columnObj.currentRow + 1;
          data.viewPort.prevItem.row = columnObj.currentRow - 1;

          data.viewPort.isAnimationInProgressX = false;

          _plugin.rowToggleCurrentClass(data, data.viewPort.currentItem.row, false);

          data.scroll.lastScrollTop = columnObj.$column.scrollTop();
        });
      }

      function updateHorizontalPaging($paging, targetColumnIndex) {
        var className = "current";
        var $item = $paging.find(".dz-horizontal-paging-item.current");
        $item.removeClass(className);
        var $nextItem = $paging.find('[data-column="' + targetColumnIndex + '"]');
        $nextItem.addClass(className);
      }

      function reCreateVerticalPaging(data, column) {
        var html, verticalPagingItemClass = "dz-vertical-paging-item";

        data.structure.$verticalPaging.empty();

        if (!OPTIONS.hide_vertical_paging_when_single_row || data.structure.columns[column].numOfRows > 1) {
          html = "<a class='" + verticalPagingItemClass + "' href='#" + column + "' data-row='0'>";

          for (var i = 1; i < data.structure.columns[column].numOfRows; i++) {
            html += "<a class='" + verticalPagingItemClass + "' href='#" + column + "' data-row='" + i + "'>";
          }
          data.structure.$verticalPaging.append(html);
        }

        if (OPTIONS.initialize_vertical_paging_position) {
          data.structure.$verticalPaging.css('top', _plugin.getHalfWindowHeight() - (data.structure.$verticalPaging.height() / 2));
        }
      }

      function toggleHorizontalArrowVisibility(targetIndex, currentIndex, structure) {
        var lastColumnIndex = data.structure.numOfColumns - 1;

        if (currentIndex === 0) {
          data.structure.$prevHorizontalArrow.fadeIn();
        } else if (currentIndex === lastColumnIndex) {
          data.structure.$nextHorizontalArrow.fadeIn();
        }

        if (targetIndex === 0) {
          data.structure.$prevHorizontalArrow.fadeOut();
        } else if (targetIndex === lastColumnIndex) {
          data.structure.$nextHorizontalArrow.fadeOut();
        }

      }
    };

    _plugin.beginVerticalTransition = function (data, targetRowIndex) {
      var viewPort = data.viewPort, scroll = data.scroll, structure = data.structure, moveDown = false, newScrollTop;
      var $column = structure.columns[viewPort.currentItem.column].$column;
      var $targetRow = structure.columns[viewPort.currentItem.column].rows[targetRowIndex];

      if (viewPort.currentItem.row < targetRowIndex) {
        if ((viewPort.currentItem.row) === structure.columns[viewPort.currentItem.column].numOfRows - 1) {
          return false;
        }
        moveDown = true;
      } else {

        if (viewPort.currentItem.row === 0) {
          return false;
        }
      }

      _plugin.toggleVerticalArrowVisibility(viewPort.currentItem.row, targetRowIndex, viewPort.currentItem.column, data);
      _plugin.updateVerticalPaging(structure.$verticalPaging, targetRowIndex);
      _plugin.rowToggleCurrentClass(data, targetRowIndex, true);

      scroll.lastScrollTop = $column.scrollTop();

      viewPort.isAnimationInProgressY = true;

      newScrollTop = scroll.lastScrollTop + $targetRow.offset().top;

      $column.animate({ scrollTop: newScrollTop - OPTIONS.row_scroll_padding_top }, OPTIONS.vertical_animation_speed, OPTIONS.vertical_animation_easing, function () {
        viewPort.isAnimationInProgressY = false;

        if (moveDown) {
          viewPort.currentItem.row = targetRowIndex;
          viewPort.prevItem.row = targetRowIndex - 1;

          if ((viewPort.currentItem.row) !== structure.columns[viewPort.currentItem.column].numOfRows - 1) {
            viewPort.nextItem.row++;
          }
        } else {
          viewPort.currentItem.row = targetRowIndex;
          viewPort.nextItem.row = targetRowIndex + 1;

          if ((viewPort.currentItem.row) !== 0) {
            viewPort.prevItem.row--;
          }
        }

        structure.columns[viewPort.currentItem.column].currentRow = viewPort.currentItem.row;
        scroll.lastScrollTop = newScrollTop;
        scroll.shouldCalculateScroll = true;
      });
    };

    _plugin.updateVerticalPaging = function ($paging, targetRowIndex) {
      var $item = $paging.find(".dz-vertical-paging-item.current");
      $item.removeClass("current");
      var $nextItem = $paging.find('[data-row="' + targetRowIndex + '"]');
      $nextItem.addClass("current");
    };
    
    _plugin.toggleVerticalArrowVisibility = function (currentRowIndex, targetRowIndex, targetColumnIndex, data) {
      var lastRowIndex = data.structure.columns[targetColumnIndex].numOfRows - 1;

      // when horizontal trasition takes place
      if (targetColumnIndex !== data.viewPort.currentItem.column) {
        updateVisibilityForHorizontalTransition(data.structure, targetRowIndex, lastRowIndex)
      }
        // when vertical transition or vertical scroll takes place
      else {
        updateVisibilityForVerticalTransition(data.structure, currentRowIndex, targetRowIndex);
      }

      function updateVisibilityForVerticalTransition(structure, currentRowIndex, targetRowIndex) {
        if (currentRowIndex === 0) {
          structure.$upVerticalArrow.fadeIn();
        } else if (currentRowIndex === lastRowIndex) {
          structure.$downVerticalArrow.fadeIn();
        }

        if (targetRowIndex === 0) {
          structure.$upVerticalArrow.fadeOut();
        } else if (targetRowIndex === lastRowIndex) {
          structure.$downVerticalArrow.fadeOut();
        }
      }

      function updateVisibilityForHorizontalTransition(structure, targetRowIndex, lastRowIndex) {
        // only one row present so hide both arrows
        if (lastRowIndex == 0) {
          structure.$upVerticalArrow.fadeOut();
          structure.$downVerticalArrow.fadeOut();
        }
        else if (targetRowIndex === 0) {
          structure.$downVerticalArrow.fadeIn();
          structure.$upVerticalArrow.fadeOut();
        } else if (targetRowIndex === lastRowIndex) {
          structure.$downVerticalArrow.fadeOut();
          structure.$upVerticalArrow.fadeIn();
        } else {
          structure.$downVerticalArrow.fadeIn();
          structure.$upVerticalArrow.fadeIn();
        }
      }
    };

    _plugin.getHalfWindowHeight = function () {
      return $(window).height() / 2;
    };

    _plugin.rowToggleCurrentClass = function (data, targetRowIndex, isVerticalTransition) {
      if (isVerticalTransition) {
        data.viewPort.currentItem.get$Row().toggleClass('current');
      }

      data.structure.columns[data.viewPort.currentItem.column].rows[targetRowIndex].addClass('current');
    };

    _plugin.setUpColumnCssOverflow = function (column, structure) {
      var columnObj = structure.columns[column];

      // if column div's height is less than the #dzieuo's height hide scrollbar
      if (structure.columns[column].$column.children().height() <= structure.$dzieuo.height()) {
        columnObj.$column.css("overflow-y", "hidden");
      } else {
        columnObj.$column.css("overflow-y", "scroll");
      }
    };

    ///////////////////////////////////////////
    //initialize helper objects
    ///////////////////////////////////////////
    _plugin.URL_ROUTER = new urlRouter(_data, _plugin.beginHorizontalTransition);

    //////////////////////////////////////
    // initialize plugin
    //////////////////////////////////////
    _plugin.setUpDataStructure(_data.structure);
    _plugin.setUpViewPortItems(_data);
    _plugin.setUpViewPort(_data.structure);
    _plugin.setUpHorizontalNav(_data.structure);
    _plugin.setUpHorizontalPaging(_data.structure);
    _plugin.setUpVerticalNav(_data);
    _plugin.setUpVerticalPaging(_data);
    _plugin.setUpViewPortPositions(_data.viewPort);
    _plugin.setUpInitialColumnCssOverflow(_data.structure);
    _plugin.setUpClickHandlers(_data);
    _plugin.updateVerticalPagingOnWindowScroll(_data);
    _plugin.updatePagingAndArrowsOnWindowResize(_data);

    _plugin.URL_ROUTER.initialize();
  }

  // jQuery plugin initialization
  $.fn.dzieuo = function (params) {
    return createDzieuo(this, params);
  };

})(jQuery);



