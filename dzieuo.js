( function ( $ )
{
	function createDzieuo( $dzieuo, params )
	{
		"use strict";

		var dzieuoApi;
		/////////////////////////////////////////
		//private objects
		/////////////////////////////////////////
		var ViewPortItem = function ( columns, column, row )
		{
			this.column = column;
			this.row = row;

			this.get$Column = function ()
			{
				return columns[this.column].$column;
			}

			this.get$Row = function ()
			{
				return columns[this.column].rows[this.row];
			}
		}

		///////////////////////////////////////////
		//private plugin state
		///////////////////////////////////////////
		var _data = {
			structure: {
				$dzieuo: $dzieuo,
				//$viewPort : $viewPort,
				columns: [ //{ $column : $(column), rows : [ $(row) , $(row) ], numOfRows = rows.length }
				],
				//numOfColumns : columns.length
			},
			viewPort: {
				prevItem: null, // new ViewPortItem(_data.structure, 0, 0 )
				currentItem: null, // new ViewPortItem(_data.structure, 0, 0 )
				nextItem: null, // new ViewPortItem(_data.structure, 1, 0 )
				isAnimationInProgressX: false
				////isAnimationInProgressY: false
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
					var column = { "$column": $column, "rows": [] };

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
			setUpViewPortItems: function ( viewPort, columns )
			{
				viewPort.prevItem = new ViewPortItem( columns, 0, 0 )
				viewPort.currentItem = new ViewPortItem( columns, 0, 0 );
				viewPort.nextItem = new ViewPortItem( columns, 1, 0 );
			},
			// 3
			setUpViewPort: function ( structure )
			{
				var viewPortContainerId = 'dzViewPort';
				var $viewPortContainer = $( '<div id="' + viewPortContainerId + '"></div>' );

				var $children = structure.$dzieuo.children();
				$children.hide();
				$children.detach().appendTo( $viewPortContainer );
				$dzieuo.append( $viewPortContainer );

				structure.$viewPort = $viewPortContainer;
			},
			// 4
			setUpHorizontalNavArrows: function ( $dzieuo )
			{
				var containerId = "dzHorizontalNav";
				var prevArrowId = "dzPrevArrow";
				var nextArrowId = "dzNextArrow";

				var html = "<nav id='" + containerId + "'><a id ='" + prevArrowId + "' href='#' >prev</a><a id='" + nextArrowId + "' href='#'>next</a></nav>"
				$dzieuo.append( html );
			},
			// 5
			setUpVerticalNavArrows: function ( $dzieuo )
			{
				var containerId = "dzVerticalNav";
				var prevArrowId = "dzUpArrow";
				var nextArrowId = "dzDownArrow";

				var html = "<nav id='" + containerId + "' href='#' '><a id ='" + prevArrowId + "'>up</a><a id='" + nextArrowId + " href='#' '>down</a></nav>"
				$dzieuo.append( html );
			},
			// 6
			setUpViewPortPositions: function ( viewPort )
			{
				var currentViewPortItem = viewPort.currentItem, nextViewPortItem = viewPort.nextItem;
				var $currentViewPortElement = currentViewPortItem.get$Column(), $nextViewPortElement = nextViewPortItem.get$Column();
				var leftOffset = $currentViewPortElement.width();

				$currentViewPortElement.show();
				$currentViewPortElement.css( { "left": 0, "top": 0 } );
			},
			// 7
			setUpClickHandlers: function ( data )
			{
				data.structure.$dzieuo.on( "click", "#dzNextArrow", function ()
				{
					_plugin.animateColumns( data, $( window ).width() - 20 );
				} )

				data.structure.$dzieuo.on( "click", "#dzPrevArrow", function ()
				{
					_plugin.animateColumns( data, -( $( window ).width() - 20 ) );
				} )
			}
		};

		_plugin.animateColumns = function ( data, offset )
		{
			if ( data.viewPort.isAnimationInProgressX )
			{
				return false;
			}

			// next
			if ( offset > 0 )
			{
				if ( ( data.viewPort.currentItem.column + 1 ) === data.structure.numOfColumns )
				{
					return false;
				}

				data.viewPort.nextItem.get$Column().show();
				data.viewPort.prevItem.column = data.viewPort.currentItem.column;
				data.viewPort.currentItem.column = data.viewPort.nextItem.column;

				data.viewPort.nextItem.get$Column().css( { "left": offset * ( data.viewPort.nextItem.column ), "top": 0 } );

				data.viewPort.isAnimationInProgressX = true;

				data.structure.$viewPort.animate( {
					"left": ( data.structure.$viewPort.offset().left - offset )
				}, 600, function ()
				{
					data.viewPort.prevItem.get$Column().hide();
					data.viewPort.nextItem.column++;

					data.viewPort.isAnimationInProgressX = false;
				} );

			}
				// previous
			else
			{
				if ( ( data.viewPort.currentItem.column === 0 ) )
				{
					return false;
				}

				data.viewPort.prevItem.get$Column().show();
				data.viewPort.nextItem.column = data.viewPort.currentItem.column;
				data.viewPort.currentItem.column = data.viewPort.prevItem.column;

				data.viewPort.prevItem.get$Column().css( { "left": ( -offset ) * ( data.viewPort.prevItem.column ), "top": 0 } );

				data.viewPort.isAnimationInProgressX = true;

				data.structure.$viewPort.animate( {
					"left": ( data.structure.$viewPort.offset().left - offset )
				}, 600, function ()
				{
					data.viewPort.nextItem.get$Column().hide();
					data.viewPort.prevItem.column--;

					data.viewPort.isAnimationInProgressX = false;
				} );
			}
		}
		_plugin.animateRows = function ( data, offset )
		{
			data.structure.$viewPort.animate( {
				"top": offset
			}, 600, function ()
			{
				//Animation complete			
			} );
		}

		//////////////////////////////////////
		// initialize plugin
		//////////////////////////////////////
		_plugin.setUpDataStructure( _data.structure );
		_plugin.setUpViewPortItems( _data.viewPort, _data.structure.columns );
		_plugin.setUpViewPort( _data.structure );
		_plugin.setUpHorizontalNavArrows( _data.structure.$dzieuo );
		_plugin.setUpVerticalNavArrows( _data.structure.$dzieuo );
		_plugin.setUpViewPortPositions( _data.viewPort );
		_plugin.setUpClickHandlers( _data );

		//////////////////////////////////////
		// public plugin api
		//////////////////////////////////////
		dzieuoApi = {
			"isInTransition_X": function ()
			{
				return _data.isTransitioningX;
			},
			"isInTransition_Y": function ()
			{
				return _data.isTransitioningY;
			}
		};

		return dzieuoApi;
	}

	// jQuery plugin initialization
	$.fn.dzieuo = function ( params )
	{
		return createDzieuo( this, params );
	};

} )( jQuery );