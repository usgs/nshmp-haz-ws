package gov.usgs.earthquake.nshm.www.meta;

import java.util.List;
import java.util.Set;

@SuppressWarnings("javadoc")
class EditionConstraints implements Constraints {

	final List<String> region;

	EditionConstraints(Set<Region> region) {
		// converting to Strings here, otherwise EnumSerializer will be used
		// and we want a compact list of (possible modified) enum.name()s
		this.region = Util.enumToString(region, Util.REGION_TO_STR);
	}
}
