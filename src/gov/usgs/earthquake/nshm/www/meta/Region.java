package gov.usgs.earthquake.nshm.www.meta;

import static org.opensha2.gmm.Imt.PGA;
import static org.opensha2.gmm.Imt.SA0P2;
import static org.opensha2.gmm.Imt.SA1P0;
import static org.opensha2.util.Vs30.VS_1150;
import static org.opensha2.util.Vs30.VS_180;
import static org.opensha2.util.Vs30.VS_2000;
import static org.opensha2.util.Vs30.VS_259;
import static org.opensha2.util.Vs30.VS_360;
import static org.opensha2.util.Vs30.VS_537;
import static org.opensha2.util.Vs30.VS_760;

import java.util.EnumSet;
import java.util.Set;

import org.opensha2.gmm.Imt;
import org.opensha2.util.Vs30;

@SuppressWarnings("javadoc")
public enum Region implements Constrained {

	COUS(
			"Conterminous US",
			new double[] { 24.6, 50.0 },
			new double[] { -125.0, -65.0 },
			new double[] { 24.6, 50.0 },
			new double[] { -125.0, -65.0 },
			EnumSet.of(PGA, SA0P2, SA1P0),
			EnumSet.of(VS_760)),

	CEUS(
			"Central & Eastern US",
			new double[] { 24.6, 50.0 },
			new double[] { -115.0, -65.0 },
			new double[] { 24.6, 50.0 },
			new double[] { -110.0, -65.0 },
			EnumSet.of(PGA, SA0P2, SA1P0),
			EnumSet.of(VS_2000, VS_760)),

	WUS(
			"Western US",
			new double[] { 24.6, 50.0 },
			new double[] { -125.0, -100.0 },
			new double[] { 24.6, 50.0 },
			new double[] { -125.0, -115.0 },
			EnumSet.of(PGA, SA0P2, SA1P0),
			EnumSet.of(VS_1150, VS_760, VS_537, VS_360, VS_259, VS_180));

	private final String label;

	final double minlatitude;
	final double maxlatitude;
	final double minlongitude;
	final double maxlongitude;

	final double uiminlatitude;
	final double uimaxlatitude;
	final double uiminlongitude;
	final double uimaxlongitude;

	/* not serialized */
	final transient Set<Imt> imts;
	final transient Set<Vs30> vs30s;

	private final Constraints constraints;

	private Region(
			String label,
			double[] latRange,
			double[] lonRange,
			double[] uiLatRange,
			double[] uiLonRange,
			Set<Imt> imts,
			Set<Vs30> vs30s) {

		this.label = label;

		this.minlatitude = latRange[0];
		this.maxlatitude = latRange[1];
		this.minlongitude = lonRange[0];
		this.maxlongitude = lonRange[1];

		this.uiminlatitude = uiLatRange[0];
		this.uimaxlatitude = uiLatRange[1];
		this.uiminlongitude = uiLonRange[0];
		this.uimaxlongitude = uiLonRange[1];

		this.imts = imts;
		this.vs30s = vs30s;

		this.constraints = new RegionConstraints(imts, vs30s);
	}

	@Override public String toString() {
		return label;
	}

	@Override public Constraints constraints() {
		return constraints;
	}
}
