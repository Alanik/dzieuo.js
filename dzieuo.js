( function ( $ )
{
	function createDzieuo( $dzieuo, opts )
	{
		"use strict";

		// issues TODO:
		// 1. #viewPort adds up css left property value resulting in a very big negative or positive css left value.
		// Perhaps it can be optimized - Left property should be +- screen width value.

		var dzieuoApi;

		//default options
		var options = {
			prevArrowContent: "previous",
			nextArrowContent: "next",
			upArrowContent: "up",
			downArrowContent: "down"
		}

		$.extend( options, opts );

		/////////////////////////////////////////
		//private objects
		/////////////////////////////////////////
		var ViewPortItem = function ( data, column, row )
		{
			this.column = column;
			this.row = row;

			this.get$Column = function ()
			{
				return data.structure.columns[this.column].$column;
			}

			this.get$Row = function ()
			{
				return data.structure.columns[data.viewPort.currentItem.column].rows[this.row];
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
				$verticalPaging: null,
				$downVerticalArrow: null,
				$upVerticalArrow: null,
				columns: [ //{ $column : $(column), rows : [ $(row) , $(row) ], numOfRows = rows.length, currentRow = 0 }
				],
				numOfColumns: 0
			},
			viewPort: {
				prevItem: null, // new ViewPortItem(_data.structure, 0, 0 )
				currentItem: null, // new ViewPortItem(_data.structure, 0, 0 )
				nextItem: null, // new ViewPortItem(_data.structure, 1, 0 )
				isAnimationInProgressX: false,
				isAnimationInProgressY: false
			}
		};

		///////////////////////////////////////////
		//private plugin initialization methods
		///////////////////////////////////////////
		var _plugin = {
			// call order:
			// 1
			setUpDataStructure: function ( structure )
			{
				var $columns = structure.$dzieuo.children();
				var numOfColumns = 0;
				var numOfRows = 0;

				$columns.each( function ( columnIndex )
				{
					numOfColumns++;
					var $column = $( this );
					var column = { "$column": $column, "rows": [], "currentRow": 0 };

					structure.columns.push( column );

					$column.children().each( function ( rowIndex )
					{
						numOfRows++;
						column.rows.push( $( this ) );
					} );

					structure.columns[columnIndex].numOfRows = numOfRows;

					numOfRows = 0;
				} )

				structure.numOfColumns = numOfColumns;
			},
			// 2
			setUpViewPortItems: function ( data )
			{
				data.viewPort.currentItem = new ViewPortItem( data, 0, 0 );
				data.viewPort.prevItem = new ViewPortItem( data, 0, 0 )
				data.viewPort.nextItem = new ViewPortItem( data, 1, 1 );
			},
			// 3
			setUpViewPort: function ( structure )
			{
				var $rows, $column, $columnInnerWrapper;
				var viewPortContainerId = 'dzViewPort';
				var $viewPortContainer = $( '<div id="' + viewPortContainerId + '"></div>' );
				var columnInnerWrapperClass = 'dz-column-inner-wrapper';
				var $columns = structure.$dzieuo.children();
				
				// set up inner wrapper per column
				$columns.each( function ( index, element )
				{
					$column = $( element );
					$rows = $column.children();
					$columnInnerWrapper = $( '<div class="' + columnInnerWrapperClass + '"></div>' );
					$rows.detach().appendTo( $columnInnerWrapper );
					$columnInnerWrapper.appendTo($column);
				} )

				$columns.hide();
				$columns.detach().appendTo( $viewPortContainer );
				$dzieuo.append( $viewPortContainer );

				structure.$viewPort = $viewPortContainer;
			},
			// 4
			setUpHorizontalNav: function ( structure )
			{
				var containerId = "dzHorizontalNav";
				var prevArrowId = "dzPrevArrow";
				var nextArrowId = "dzNextArrow";

				var $nav = $( "<nav id='" + containerId + "'></nav>" );
				var $prevArrow = $( "<a id ='" + prevArrowId + "' href='#' style='display:none;'></a>" );
				var $nextArrow = $( "<a id='" + nextArrowId + "' href='#'></a>" );

				$prevArrow.html( options.prevArrowContent );
				$nextArrow.html( options.nextArrowContent );
				$nav.append( $prevArrow );
				$nav.append( $nextArrow );

				structure.$dzieuo.append( $nav );

				structure.$prevHorizontalArrow = $prevArrow;
				structure.$nextHorizontalArrow = $nextArrow;
			},
			// 5
			setUpHorizontalPaging: function ( structure )
			{
				var containerId = "dzHorizontalPaging";
				var pageItemClass = "dz-horizontal-paging-item";

				var html = "<nav id='" + containerId + "'><a class='" + pageItemClass + " current' href='#' data-column='0'>";


				for ( var i = 1; i < structure.numOfColumns; i++ )
				{
					html += "<a class='" + pageItemClass + "' href='#' data-column='" + i + "'>";
				}

				html += "</nav>";

				var $paging = $( html );
				structure.$dzieuo.append( $paging );

				structure.$horizontalPaging = $paging;
			},
			// 6
			setUpVerticalNav: function ( structure )
			{
				var containerId = "dzVerticalNav";
				var className = "dz-nav-arrows"
				var prevArrowId = "dzUpArrow";
				var nextArrowId = "dzDownArrow";

				var $html = $( "<nav id='" + containerId + "'><a id ='" + prevArrowId + "' class='" + className + "' href='#' style='display:none;'>up</a><a id='" + nextArrowId + "' class='" + className + "' href='#'>down</a></nav>" );
				structure.$dzieuo.append( $html );

				structure.$upVerticalArrow = $html.find( "#" + prevArrowId );
				structure.$downVerticalArrow = $html.find( "#" + nextArrowId );
			},
			// 7
			setUpVerticalPaging: function ( data )
			{
				var containerId = "dzVerticalPaging";
				var pageItemClass = "dz-vertical-paging-item";

				var html = "<nav id='" + containerId + "'><a class='" + pageItemClass + " current' href='#' data-row='0'>";

				for ( var i = 1; i < data.structure.columns[data.viewPort.currentItem.column].numOfRows; i++ )
				{
					html += "<a class='" + pageItemClass + "' href='#' data-row='" + i + "'>";
				}

				html += "</nav>";

				var $paging = $( html );
				data.structure.$dzieuo.append( $paging );

				data.structure.$verticalPaging = $paging;
			},
			// 8
			setUpViewPortPositions: function ( viewPort )
			{
				var currentViewPortItem = viewPort.currentItem, nextViewPortItem = viewPort.nextItem;
				var $currentViewPortElement = currentViewPortItem.get$Column(), $nextViewPortElement = nextViewPortItem.get$Column();
				var leftOffset = $currentViewPortElement.width();

				$currentViewPortElement.show();
				$currentViewPortElement.css( { "left": 0, "top": 0 } );
			},
			// 9
			setUpClickHandlers: function ( data )
			{
				data.structure.$dzieuo.on( "click", "#dzNextArrow", function ()
				{
					if ( !data.viewPort.isAnimationInProgressX )
					{
						_plugin.beginHorizontalTransition( data, $( window ).width() - 20, data.viewPort.nextItem.column );
					}
				} )

				data.structure.$dzieuo.on( "click", "#dzPrevArrow", function ()
				{
					if ( !data.viewPort.isAnimationInProgressX )
					{
						_plugin.beginHorizontalTransition( data, -( $( window ).width() - 20 ), data.viewPort.prevItem.column );
					}
				} )

				data.structure.$dzieuo.on( "click", "#dzDownArrow", function ()
				{
					if ( !data.viewPort.isAnimationInProgressY )
					{
						_plugin.beginVerticalTransition( data, data.viewPort.currentItem.row + 1 );
					}
				} )

				data.structure.$dzieuo.on( "click", "#dzUpArrow", function ()
				{
					if ( !data.viewPort.isAnimationInProgressY )
					{
						_plugin.beginVerticalTransition( data, data.viewPort.currentItem.row - 1 );
					}
				} )

				data.structure.$dzieuo.on( "click", ".dz-horizontal-paging-item", function ()
				{
					var targetColumn = $( this ).data( "column" );

					if ( !data.viewPort.isAnimationInProgressX && data.viewPort.currentItem.column !== targetColumn )
					{
						if ( data.viewPort.currentItem.column < targetColumn )
						{
							_plugin.beginHorizontalTransition( data, ( $( window ).width() - 20 ), targetColumn );
						}
						else if ( data.viewPort.currentItem.column > targetColumn )
						{
							_plugin.beginHorizontalTransition( data, -( $( window ).width() - 20 ), targetColumn );
						}
					}
				} );

				data.structure.$dzieuo.on( "click", ".dz-vertical-paging-item", function ()
				{
					var targetRow = $( this ).data( "row" );

					if ( !data.viewPort.isAnimationInProgressY && data.viewPort.currentItem.row !== targetRow )
					{
						_plugin.beginVerticalTransition( data, targetRow );
					}
				} )
			}
		};

		///////////////////////////////////////////
		//private other plugin  methods
		///////////////////////////////////////////
		_plugin.beginHorizontalTransition = function ( data, leftOffset, targetColumn )
		{
			var columnObj, $row, topOffset, currentRow;

			if ( leftOffset > 0 )
			{
				if ( ( data.viewPort.currentItem.column + 1 ) === data.structure.numOfColumns )
				{
					return false;
				}

				reCreateVerticalPaging( data, targetColumn );
				_plugin.updateVerticalPaging( data.structure.$verticalPaging, data.structure.columns[targetColumn].currentRow );
				_plugin.toggleVerticalArrowVisibility( data.viewPort.currentItem.row, data.structure.columns[targetColumn].currentRow, targetColumn, data );
				updateHorizontalPaging( data.structure.$horizontalPaging, targetColumn );
				moveToNext( data, targetColumn );
			}
			else
			{
				if ( ( data.viewPort.currentItem.column === 0 ) )
				{
					return false;
				}

				reCreateVerticalPaging( data, targetColumn );
				_plugin.updateVerticalPaging( data.structure.$verticalPaging, data.structure.columns[targetColumn].currentRow );
				_plugin.toggleVerticalArrowVisibility( data.viewPort.currentItem.row, data.structure.columns[targetColumn].currentRow, targetColumn, data );
				updateHorizontalPaging( data.structure.$horizontalPaging, targetColumn );
				moveToPrevious( data, targetColumn );
			}

			function moveToNext( data, targetColumnIndex )
			{
				var columnObj = data.structure.columns[targetColumnIndex];
				var left = data.structure.$viewPort.offset().left;
				var $row = columnObj.rows[columnObj.currentRow];

				columnObj.$column.show();

				// if column div's height is less than the window's height hide scrollbar
				if ( columnObj.$column.children().height() <= $( window ).height() )
				{
					columnObj.$column.css( "overflow-y", "hidden" );
				} else
				{
					columnObj.$column.css( "overflow-y", "scroll" );
				}

				data.viewPort.prevItem.column = data.viewPort.currentItem.column;
				data.viewPort.nextItem.column = targetColumnIndex;
				data.viewPort.currentItem.column = targetColumnIndex;

				toggleHorizontalArrowVisibility( targetColumnIndex, data.viewPort.prevItem.column, data.structure );

				columnObj.$column.css( { "left": leftOffset - left, "top": 0 } );

				data.viewPort.isAnimationInProgressX = true;
				data.structure.$viewPort.animate( {
					"left": ( left - leftOffset )
				}, 600, function ()
				{

					data.viewPort.prevItem.get$Column().hide();
					data.viewPort.prevItem.column = targetColumnIndex - 1;
					data.viewPort.nextItem.column++;

					data.viewPort.currentItem.row = columnObj.currentRow;
					data.viewPort.prevItem.row = columnObj.currentRow - 1;
					data.viewPort.nextItem.row = columnObj.currentRow + 1;

					data.viewPort.isAnimationInProgressX = false;
				} );
			}

			function moveToPrevious( data, targetColumnIndex )
			{
				var columnObj = data.structure.columns[targetColumnIndex]
				var left = data.structure.$viewPort.offset().left;
				var $row = columnObj.rows[columnObj.currentRow];

				columnObj.$column.show();

				// if column div's height is less than the window's height hide scrollbar
				if ( columnObj.$column.children().height() <= $( window ).height() )
				{
					columnObj.$column.css( "overflow-y", "hidden" );
				} else
				{
					columnObj.$column.css( "overflow-y", "scroll" );
				}

				data.viewPort.nextItem.column = data.viewPort.currentItem.column;
				data.viewPort.prevItem.column = targetColumnIndex;
				data.viewPort.currentItem.column = targetColumnIndex;

				toggleHorizontalArrowVisibility( targetColumnIndex, data.viewPort.nextItem.column, data.structure );

				columnObj.$column.css( { "left": leftOffset - left, "top": 0 } );

				data.viewPort.isAnimationInProgressX = true;

				data.structure.$viewPort.animate( {
					"left": ( left - leftOffset )
				}, 600, function ()
				{
					data.viewPort.nextItem.get$Column().hide();
					data.viewPort.nextItem.column = targetColumnIndex + 1;
					data.viewPort.prevItem.column--;

					data.viewPort.currentItem.row = columnObj.currentRow;
					data.viewPort.nextItem.row = columnObj.currentRow + 1;
					data.viewPort.prevItem.row = columnObj.currentRow - 1;

					data.viewPort.isAnimationInProgressX = false;
				} );
			}

			function updateHorizontalPaging( $paging, targetColumnIndex )
			{
				var className = "current";
				var $item = $paging.find( ".dz-horizontal-paging-item.current" );
				$item.removeClass( className );
				var $nextItem = $paging.find( '[data-column="' + targetColumnIndex + '"]' );
				$nextItem.addClass( className );
			}

			function reCreateVerticalPaging( data, column )
			{
				var verticalPagingItemClass = "dz-vertical-paging-item";
				var html = "<a class='" + verticalPagingItemClass + "' href='#' data-row='0'>";

				for ( var i = 1; i < data.structure.columns[column].numOfRows; i++ )
				{
					html += "<a class='" + verticalPagingItemClass + "' href='#' data-row='" + i + "'>";
				}

				data.structure.$verticalPaging.empty();
				data.structure.$verticalPaging.append( html );
			}

			function toggleHorizontalArrowVisibility( targetIndex, currentIndex, structure )
			{
				var lastColumnIndex = data.structure.numOfColumns - 1;

				if ( currentIndex === 0 )
				{
					data.structure.$prevHorizontalArrow.fadeIn();
				} else if ( currentIndex === lastColumnIndex )
				{
					data.structure.$nextHorizontalArrow.fadeIn();
				}

				if ( targetIndex === 0 )
				{
					data.structure.$prevHorizontalArrow.fadeOut();
				} else if ( targetIndex === lastColumnIndex )
				{
					data.structure.$nextHorizontalArrow.fadeOut();
				}

			}
		};

		_plugin.beginVerticalTransition = function ( data, targetRowIndex )
		{
			var viewPort = data.viewPort, moveDown = false, oldScrollTop = 0;
			var $column = data.structure.columns[data.viewPort.currentItem.column].$column;

			if ( data.viewPort.currentItem.row < targetRowIndex )
			{
				if ( ( viewPort.currentItem.row ) === data.structure.columns[viewPort.currentItem.column].numOfRows - 1 )
				{
					return false;
				}
				moveDown = true;
			} else
			{

				if ( viewPort.currentItem.row === 0 )
				{
					return false;
				}
			}

			_plugin.toggleVerticalArrowVisibility( data.viewPort.currentItem.row, targetRowIndex, data.viewPort.currentItem.column, data );
			_plugin.updateVerticalPaging( data.structure.$verticalPaging, targetRowIndex );
			oldScrollTop = $column.scrollTop();

			viewPort.isAnimationInProgressY = true;
			$column.animate( { scrollTop: oldScrollTop + data.structure.columns[viewPort.currentItem.column].rows[targetRowIndex].offset().top }, 600, function ()
			{
				viewPort.isAnimationInProgressY = false;

				if ( moveDown )
				{
					viewPort.currentItem.row = targetRowIndex;
					viewPort.prevItem.row = targetRowIndex - 1;

					if ( ( viewPort.currentItem.row ) !== data.structure.columns[viewPort.currentItem.column].numOfRows - 1 )
					{
						viewPort.nextItem.row++;
					}

				} else
				{
					viewPort.currentItem.row = targetRowIndex;
					viewPort.nextItem.row = targetRowIndex + 1;

					if ( ( viewPort.currentItem.row ) !== 0 )
					{
						viewPort.prevItem.row--;
					}
				}

				data.structure.columns[viewPort.currentItem.column].currentRow = viewPort.currentItem.row;

			} );
		}

		_plugin.updateVerticalPaging = function ( $paging, targetRowIndex )
		{
			var $item = $paging.find( ".dz-vertical-paging-item.current" );
			$item.removeClass( "current" );
			var $nextItem = $paging.find( '[data-row="' + targetRowIndex + '"]' );
			$nextItem.addClass( "current" );
		}

		_plugin.toggleVerticalArrowVisibility = function ( currentRowIndex, targetRowIndex, targetColumnIndex, data )
		{
			var lastRowIndex = data.structure.columns[targetColumnIndex].numOfRows - 1;

			// when horizontal trasition takes place
			if ( targetColumnIndex !== data.viewPort.currentItem.column )
			{
				if ( targetRowIndex === 0 )
				{
					data.structure.$downVerticalArrow.show();
					data.structure.$upVerticalArrow.hide();
				} else if ( targetRowIndex === lastRowIndex )
				{
					data.structure.$downVerticalArrow.hide();
					data.structure.$upVerticalArrow.show();
				} else
				{
					data.structure.$upVerticalArrow.show();
					data.structure.$downVerticalArrow.show();
				}
			} else
			{
				if ( currentRowIndex === 0 )
				{
					data.structure.$upVerticalArrow.fadeIn();
				} else if ( currentRowIndex === lastRowIndex )
				{
					data.structure.$downVerticalArrow.fadeIn();
				}

				if ( targetRowIndex === 0 )
				{
					data.structure.$upVerticalArrow.fadeOut();
				} else if ( targetRowIndex === lastRowIndex )
				{
					data.structure.$downVerticalArrow.fadeOut();
				}
			}
		}

		//////////////////////////////////////
		// initialize plugin
		//////////////////////////////////////
		_plugin.setUpDataStructure( _data.structure );
		_plugin.setUpViewPortItems( _data );
		_plugin.setUpViewPort( _data.structure );
		_plugin.setUpHorizontalNav( _data.structure );
		_plugin.setUpHorizontalPaging( _data.structure );
		_plugin.setUpVerticalNav( _data.structure );
		_plugin.setUpVerticalPaging( _data );
		_plugin.setUpViewPortPositions( _data.viewPort );
		_plugin.setUpClickHandlers( _data );

		//////////////////////////////////////
		// public plugin api
		//////////////////////////////////////
		dzieuoApi = {

		};

		return dzieuoApi;
	}

	// jQuery plugin initialization
	$.fn.dzieuo = function ( params )
	{
		return createDzieuo( this, params );
	};

} )( jQuery );