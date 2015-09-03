package gov.usgs.earthquake.nshm.www.services.meta;

import static gov.usgs.earthquake.nshm.www.services.meta.Vs30.VS_1150;
import static gov.usgs.earthquake.nshm.www.services.meta.Vs30.VS_180;
import static gov.usgs.earthquake.nshm.www.services.meta.Vs30.VS_2000;
import static gov.usgs.earthquake.nshm.www.services.meta.Vs30.VS_259;
import static gov.usgs.earthquake.nshm.www.services.meta.Vs30.VS_360;
import static gov.usgs.earthquake.nshm.www.services.meta.Vs30.VS_537;
import static gov.usgs.earthquake.nshm.www.services.meta.Vs30.VS_760;
import static org.opensha2.gmm.Imt.PGA;
import static org.opensha2.gmm.Imt.SA0P2;
import static org.opensha2.gmm.Imt.SA1P0;

import java.util.EnumSet;

@SuppressWarnings("javadoc")
public enum Region implements Constrained {
	CEUS(
			"Central & Eastern US",
			new double[] {24.6, 50.0},
			new double[] {-115.0, -65.0},
			new double[] {24.6, 50.0},
			new double[] {-110.0, -65.0},
			new RegionConstraints(
				EnumSet.of(VS_2000, VS_760),
				EnumSet.of(PGA, SA0P2, SA1P0))),

	WUS(
			"Western US",
			new double[] {24.6, 50.0},
			new double[] {-125.0, -100.0},
			new double[] {24.6, 50.0},
			new double[] {-125.0, -115.0},
			new RegionConstraints(
				EnumSet.of(VS_1150, VS_760, VS_537, VS_360, VS_259, VS_180),
				EnumSet.of(PGA, SA0P2, SA1P0))),

	COUS(
			"Conterminous US",
			new double[] {24.6, 50.0},
			new double[] {-125.0, -65.0},
			new double[] {24.6, 50.0},
			new double[] {-125.0, -65.0},
			new RegionConstraints(
				EnumSet.of(VS_760),
				EnumSet.of(PGA, SA0P2, SA1P0)));


	final String label;

	final double minlatitude;
	final double maxlatitude;
	final double minlongitude;
	final double maxlongitude;

	final double uiminlatitude;
	final double uimaxlatitude;
	final double uiminlongitude;
	final double uimaxlongitude;

	final Constraints constraints;

	private Region(
			String label,
			double[] latRange,
			double[] lonRange,
			double[] uiLatRange,
			double[] uiLonRange,
			Constraints constraints) {

		this.label = label;

		this.minlatitude = latRange[0];
		this.maxlatitude = latRange[1];
		this.minlongitude = lonRange[0];
		this.maxlongitude = lonRange[1];

		this.uiminlatitude = uiLatRange[0];
		this.uimaxlatitude = uiLatRange[1];
		this.uiminlongitude = uiLonRange[0];
		this.uimaxlongitude = uiLonRange[1];

		this.constraints = constraints;
	}

	@Override public String toString() {
		return label;
	}

	@Override public Constraints constraints() {
		return constraints;
	}
}
