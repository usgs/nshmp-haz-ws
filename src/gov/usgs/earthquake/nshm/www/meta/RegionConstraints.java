package gov.usgs.earthquake.nshm.www.meta;

import java.util.List;
import java.util.Set;

import org.opensha2.calc.Vs30;
import org.opensha2.gmm.Imt;

@SuppressWarnings("unused")
class RegionConstraints implements Constraints {

	private final List<String> imt;
	private final List<String> vs30;

	RegionConstraints(Set<Vs30> vs30, Set<Imt> imt) {
		// converting to Strings here, otherwise EnumSerializer will be used
		// and we want a compact list of (possible modified) enum.name()s
		this.vs30 = Util.enumToString(vs30, Util.VS_TO_STR);
		this.imt = Util.enumToString(imt, Util.IMT_TO_STR);
	}
}
