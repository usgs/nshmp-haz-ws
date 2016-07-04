package gov.usgs.earthquake.nshm.www.meta;

import java.util.List;
import java.util.Set;

import org.opensha2.gmm.Imt;
import org.opensha2.util.Vs30;

@SuppressWarnings("unused")
class RegionConstraints implements Constraints {

	private final List<String> imt;
	private final List<String> vs30;

	RegionConstraints( Set<Imt> imts, Set<Vs30> vs30s) {
		// converting to Strings here, otherwise EnumSerializer will be used
		// and we want a compact list of (possible modified) enum.name()s
		this.imt = Util.enumToString(imts, Util.IMT_TO_STR);
		this.vs30 = Util.enumToString(vs30s, Util.VS_TO_STR);
	}
}
