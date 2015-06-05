package gov.usgs.earthquake.nshm.www.services;

import java.util.ArrayList;
import java.util.List;

import org.opensha2.data.XY_Point;
import org.opensha2.data.XY_Sequence;
import org.opensha2.util.Parsing;

import com.google.common.primitives.Doubles;

/**
 * Container class of XY data sequences prior to Json serialization. This
 * implementation is for datseriesthat sharethesame x-values
 * 
 * @author Peter Powers
 */
@SuppressWarnings({"javadoc", "unused"})
public class XY_DataGroup {

	private final String name;
	private final String xLabel;
	private final String yLabel;
	private final List<Double> xValues;	
	private final List<XY_DataGroup.Series> series;

	private XY_DataGroup(String name, String xLabel, String yLabel, List<Double> xValues) {
		this.name = name;
		this.xLabel = xLabel;
		this.yLabel = yLabel;
		this.xValues = xValues;
		this.series = new ArrayList<>();
	}

	/** Create a data group. */
	public static XY_DataGroup create(String name, String xLabel, String yLabel, List<Double> xValues) {
		return new XY_DataGroup(name, xLabel, yLabel, xValues);
	}

	/** Add a data sequence */
	public XY_DataGroup add(String id, String name, XY_Sequence data) {
		series.add(new Series(id, name, data));
		return this;
	}

	/** Add a data sequence */
	public XY_DataGroup add(String id, String name, double[] ys) {
		series.add(new Series(id, name, ys));
		return this;
	}

	/** Add a data sequence */
	public XY_DataGroup add(String id, String name, List<Double> ys) {
		series.add(new Series(id, name, ys));
		return this;
	}

	static final class Series {
		private final String id;
		private final String name;
		private final List<Double> yValues;

		Series(String id, String name, XY_Sequence xy) {
			this.id = id;
			this.name = name;
			this.yValues = xy.yValues();
		}

		Series(String id, String name, double[] ys) {
			this.id = id;
			this.name = name;
			this.yValues = Doubles.asList(ys);
		}

		Series(String id, String name, List<Double> yValues) {
			this.id = id;
			this.name = name;
			this.yValues = yValues;
		}
	}

}
