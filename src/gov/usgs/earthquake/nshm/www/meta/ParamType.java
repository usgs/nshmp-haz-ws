package gov.usgs.earthquake.nshm.www.services.meta;

public enum ParamType {
	INTEGER,
	NUMBER,
	STRING;
	
	@Override public String toString() {
		return name().toLowerCase();
	}
}
