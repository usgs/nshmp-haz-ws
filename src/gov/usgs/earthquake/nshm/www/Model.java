package gov.usgs.earthquake.nshm.www;

import gov.usgs.earthquake.nshm.www.meta.Region;

import java.nio.file.Paths;

import org.opensha2.util.Parsing;
import org.opensha2.util.Parsing.Delimiter;

import com.google.common.collect.ImmutableList;

enum Model {
	CEUS_2008,
	WUS_2008,
	CEUS_2014,
	WUS_2014;
	
	private static final String MODEL_DIR = "models";
	private static final String CEUS_NAME = "Central & Eastern US";
	private static final String WUS_NAME = "Western US";
	
	final String path;
	final String name;
	
	private Model() {
		String region = name().startsWith("WUS") ? WUS_NAME : CEUS_NAME;
		String year = name().substring(name().lastIndexOf('_') + 1);
		path = "/" + Paths.get(MODEL_DIR, year, region).toString();
		name = Parsing.join(
			ImmutableList.of(year, "NSHM", region, "Hazard Model"),
			Delimiter.SPACE);
	}
	
	static Model valueOf(Region region, int year) {
		return valueOf(region.name() + "_" + year);
	}
	
	public static void main(String[] args) {
		for (Model model : Model.values()) {
			System.out.println(model.path);
			System.out.println(model.name);
		}
	}
	
}
