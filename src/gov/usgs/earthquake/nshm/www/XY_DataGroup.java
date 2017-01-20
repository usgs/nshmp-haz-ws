package gov.usgs.earthquake.nshm.www;

import java.util.ArrayList;
import java.util.List;

import org.opensha2.data.XyPoint;
import org.opensha2.data.XySequence;
import org.opensha2.internal.Parsing;

import com.google.common.primitives.Doubles;

/**
 * Container class of XY data sequences prior to Json serialization. This
 * implementation is for datseriesthat sharethesame x-values
 * 
 * @author Peter Powers
 */
@SuppressWarnings("unused")
public class XY_DataGroup {

  private final String label;
  private final String xLabel;
  private final String yLabel;
  private final List<Series> data;

  private XY_DataGroup(String label, String xLabel, String yLabel) {
    this.label = label;
    this.xLabel = xLabel;  
    this.yLabel = yLabel;
    this.data = new ArrayList<>();
  }

  /** Create a data group. */
  public static XY_DataGroup create(String name, String xLabel, String yLabel) {
    return new XY_DataGroup(name, xLabel, yLabel);
  }

  /** Add a data sequence */
  public XY_DataGroup add(String id, String name, XySequence data) {
    this.data.add(new Series(id, name, data));
    return this;
  }

  static final class Series {
    private final String id;
    private final String label;
    private final XySequence data;

    Series(String id, String label, XySequence data) {
      this.id = id;
      this.label = label;
      this.data = data;
    }
  }

}
