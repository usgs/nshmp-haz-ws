
import D3BaseSubViewOptions from './D3BaseSubViewOptions.js';
import D3LineSubViewOptionsBuilder from './D3LineSubViewOptionsBuilder.js';

/**
 * @fileoverview Create options for D3LineSubView.
 * 
 * Use D3LineSubViewOptions.lowerBuilder() or
 *    D3LineSubViewOptions.upperBuilder() to customize options 
 *    for lower and upper sub view or use 
 *    D3LineSubViewOptions.upperWithDefaults() or 
 *    D3LineSubViewOptions.lowerWithDefaults() for default options.
 * 
 * Note: The only difference between upperWithDefaults() and 
 *    lowerWithDefault() is the plot height. The lower view defaults with
 *    224 px for plot height while the upper is 504 px.
 * 
 * @class D3LineSubViewOptions
 * @extends D3BaseSubViewOptions
 * @author Brandon Clayton
 */
export default class D3LineSubViewOptions extends D3BaseSubViewOptions {

  /** 
   * @private
   * Must use D3LineSubViewOptions.builder()
   * 
   * @param {D3LineSubViewOptionsBuilder} builder The builder 
   */
  constructor(builder) {
    super(builder);

    /**
     * The font weight for the X and Y axis labels.
     * Default: 500
     * @type {Number}
     */
    this.axisLabelFontWeight = builder._axisLabelFontWeight;

    /**
     * The default X limit when the D3LineView is shown with no data. 
     * Default: [ 0.01, 10 ] 
     * @type {Array<Number>} 
     */
    this.defaultXLimit = builder._defaultXLimit;
    
    /**
     * The default X limit when the D3LineView is shown with no data. 
     * Default: [ 0.01, 1 ] 
     * @type {Array<Number>} 
     */
    this.defaultYLimit = builder._defaultYLimit;
    
    /** 
     * Color of axes grid lines.
     * Default: '#E0E0E0' 
     * @type {String}
     */
    this.gridLineColor = builder._gridLineColor; 

    /**
     * Width of axes grid lines.
     * Default: 0.75 
     * @type {Number}
     */
    this.gridLineWidth = builder._gridLineWidth;
    
    /** 
     * Axes label font size in px. 
     * Default: 16
     * @type {Number}
     */
    this.labelFontSize = builder._labelFontSize;
    
    /** 
     * Legend font size in px.
     * Default: 14
     * @type {Number}
     */
    this.legendFontSize = builder._legendFontSize;
    
    /** 
     * Line break between legend entries in px.
     * Default: 20
     * @type {Number}
     */
    this.legendLineBreak = builder._legendLineBreak;
    
    /**
     * Legend location: 'bottom-left' || 'bottom-right' || 
     *    'top-left' || 'top-right'
     * Default: 'topRight'
     * @type {String}
     */
    this.legendLocation = builder._legendLocation;
    
    /**
     * The offset around the outside of the legend in px.
     * Default: 5
     * @type {Number}
     */
    this.legendOffset = builder._legendOffset;
    
    /**
     * The interior padding of the legend in the X direction in px.
     * Default: 20
     * @type {Number}
     */
    this.legendPaddingX = builder._legendPaddingX;
    
    /**
     * The interior padding of the legend in the Y direction in px.
     * Default: 20
     * @type {Number}
     */
    this.legendPaddingY = builder._legendPaddingY;
    
    /**
     * Color of a reference line.
     * Default: '9E9E9E'
     * @type {String}
     */
    this.referenceLineColor = builder._referenceLineColor;

    /**
     * Line width of the reference line.
     * Default: 1.0
     * @type {Number}
     */
    this.referenceLineWidth = builder._referenceLineWidth;

    /**
     * The font size of the exponents on the tick mark values in px. 
     * Only when in log space.
     * Default: 8
     * @type {Number}
     */
    this.tickExponentFontSize = builder._tickExponentFontSize;

    /**
     * The tick mark values font size in px.
     * Default: 12
     * @type {Number}
     */
    this.tickFontSize = builder._tickFontSize;

    /**
     * The duration for any plot animations in milliseconds.
     * e.g. switching between log and linear scales.
     * Default: 500
     * @type {Number}
     */
    this.translationDuration = builder._translationDuration;

    /**
     * The X axis location: 'top' || 'bottom'
     * Default: 'bottom'
     * @type {String}
     */
    this.xAxisLocation = builder._xAxisLocation;

    /**
     * Extend the domain to start and end on nice round numbers.
     * Default: true
     * @type {Boolean}
     */
    this.xAxisNice = builder._xAxisNice;

    /**
     * The X axis scale: 'log' || 'linear'
     * Default: 'log'
     * @type {String}
     */
    this.xAxisScale = builder._xAxisScale;

    /**
     * The X axis label; can be an HTML string.
     * Default: ''
     * @type {String}
     */
    this.xLabel = builder._xLabel;

    /**
     * Padding around the X label in px.
     * Default: 8
     * @type {Number}
     */
    this.xLabelPadding = builder._xLabelPadding;

    /**
     * The number of tick marks for the X axis.
     * The specified count is only a hint; the scale may return more or 
     *    fewer values depending on the domain.
     * Default: 8
     * @type {Number}
     */
    this.xTickMarks = builder._xTickMarks;

    /**
     * The Y axis location: 'left' || 'right'
     * Default: 'left'
     * @type {String}
     */
    this.yAxisLocation = builder._yAxisLocation;

    /**
     * Extend the domain to start and end on nice round numbers.
     * Default: true
     * @type {Boolean}
     */
    this.yAxisNice = builder._yAxisNice;

    /**
     * The Y axis scale: 'log' || 'linear'
     * Default: 'log'
     * @type {String}
     */
    this.yAxisScale = builder._yAxisScale;

    /**
     * The Y axis label; can be an HTML string.
     * Default: ''
     * @type {String}
     */
    this.yLabel = builder._yLabel;
    
    /**
     * Padding around the Y label in px.
     * Default: 10
     * @type {Number}
     */
    this.yLabelPadding = builder._yLabelPadding;

    /**
     * The number of tick marks for the Y axis.
     * The specified count is only a hint; the scale may return more or 
     *    fewer values depending on the domain.
     * Default: 6
     * @type {Number}
     */
    this.yTickMarks = builder._yTickMarks;


    /* Make immutable */
    if (new.target == D3LineSubViewOptions) Object.freeze(this);
  }

  /** 
   * Return new D3LineSubViewOptionsBuilder for lower sub view 
   */
  static lowerBuilder() {
    const LOWER_PLOT_HEIGHT = 224;
    return new D3LineSubViewOptionsBuilder()
        ._type('lower')
        .plotHeight(LOWER_PLOT_HEIGHT);
  }

  /** 
   * Return new D3LineSubViewOptions for lower sub view 
   */
  static lowerWithDefaults() {
    return D3LineSubViewOptions.lowerBuilder().build();
  }

  /** 
   * Return new D3LineSubViewOptionsBuilder for upper sub view 
   */
  static upperBuilder() {
    return new D3LineSubViewOptionsBuilder()
        ._type('upper');
  }

  /** 
   * Return new D3LineSubViewOptions for upper sub view 
   */
  static upperWithDefaults() {
    return D3LineSubViewOptions.upperBuilder().build();
  }

}
