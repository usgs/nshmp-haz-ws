package gov.usgs.earthquake.param;

import static org.junit.Assert.*;
import gov.usgs.earthquake.param.DefaultNumberParam;
import gov.usgs.earthquake.param.NumberParam;

import org.junit.Test;

@SuppressWarnings("javadoc")
public class DefaultNumberParamTest {

	@Test
	public void unitsTest() {
		NumberParam<Double> p = new DefaultNumberParam<Double>("Name", "Info",
			null, 0.0);
		assertEquals("", p.units());
		p = new DefaultNumberParam<Double>("Name", "Info",
			"ReallyReallyReallyReallyReallyReallyReallyLongUnits", 0.0);
		assertTrue(p.units().length() == DefaultNumberParam.MAX_LENGTH_UNITS);
	}
}
