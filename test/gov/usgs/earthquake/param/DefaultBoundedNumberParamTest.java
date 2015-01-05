package gov.usgs.earthquake.param;

import static org.junit.Assert.*;
import gov.usgs.earthquake.param.BoundedNumberParam;
import gov.usgs.earthquake.param.DefaultBoundedNumberParam;
import gov.usgs.earthquake.param.Param;
import gov.usgs.earthquake.param.Params;

import org.junit.Test;

@SuppressWarnings("javadoc")
public class DefaultBoundedNumberParamTest {

	private static final String NAME = "Test Double Param";
	private static final String INFO = "Double Param Info";
	private static final String UNITS = "units/unit";

	private static final double DVd = 0.123456;
	private static final float DVf = 0.123456f;
	private static final double B1 = -200;
	private static final double B2 = 200;
	private static final double R1 = -100;
	private static final double R2 = 100;

	
	// ===========================
	// constructor arg checking
	// @formatter:off
	
	public static void main(String[] args) {
		allowLo(Double.MIN_VALUE);
	}
	// double values
	
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowLoIAEnan() { allowLo(Double.NaN); }
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowLoIAEmin() { allowLo(Double.NEGATIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowLoIAEmax() { allowLo(Double.POSITIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowHiIAEnan() { allowHi(Double.NaN); }
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowHiIAEmin() { allowHi(Double.NEGATIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowHiIAEmax() { allowHi(Double.POSITIVE_INFINITY); }

	private static Param<Double> allowLo(double val) {
		return new DefaultBoundedNumberParam<Double>(NAME, INFO, UNITS, DVd, val, B2, R1, R2);
	}
	private static Param<Double> allowHi(double val) {
		return new DefaultBoundedNumberParam<Double>(NAME, INFO, UNITS, DVd, B1, val, R1, R2);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testRecLoIAEnan() { recLo(Double.NaN); }
	@Test(expected = IllegalArgumentException.class)
	public final void testRecLoIAEmin() { recLo(Double.NEGATIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testRecLoIAEmax() { recLo(Double.POSITIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testRecHiIAEnan() { recHi(Double.NaN); }
	@Test(expected = IllegalArgumentException.class)
	public final void testRecHiIAEmin() { recHi(Double.NEGATIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testRecHiIAEmax() { recHi(Double.POSITIVE_INFINITY); }
	
	private static Param<Double> recLo(double val) {
		return new DefaultBoundedNumberParam<Double>(NAME, INFO, UNITS, DVd, B1, B2, val, R2);
	}
	private static Param<Double> recHi(double val) {
		return new DefaultBoundedNumberParam<Double>(NAME, INFO, UNITS, DVd, B1, B2, R1, val);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testDefaultIAEnan() { defaultVal(Double.NaN); }
	@Test(expected = IllegalArgumentException.class)
	public final void testDefaultIAEmin() { defaultVal(Double.NEGATIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testDefaultIAEmax() { defaultVal(Double.POSITIVE_INFINITY); }
	
	private static Param<Double> defaultVal(double val) {
		return new DefaultBoundedNumberParam<Double>(NAME, INFO, UNITS, val, B1, B2, R1, R2);
	}
	
	// float values
	
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowLoIAEnan2() { allowLo(Float.NaN); }
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowLoIAEmin2() { allowLo(Float.NEGATIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowLoIAEmax2() { allowLo(Float.POSITIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowHiIAEnan2() { allowHi(Float.NaN); }
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowHiIAEmin2() { allowHi(Float.NEGATIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowHiIAEmax2() { allowHi(Float.POSITIVE_INFINITY); }

	private static Param<Float> allowLo(float val) {
		return new DefaultBoundedNumberParam<Float>(NAME, INFO, UNITS, DVf, 
				val, (float) B2, (float) R1, (float) R2);
	}
	private static Param<Float> allowHi(float val) {
		return new DefaultBoundedNumberParam<Float>(NAME, INFO, UNITS, DVf,
				(float) B1, val, (float) R1, (float) R2);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testRecLoIAEnan2() { recLo(Float.NaN); }
	@Test(expected = IllegalArgumentException.class)
	public final void testRecLoIAEmin2() { recLo(Float.NEGATIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testRecLoIAEmax2() { recLo(Float.POSITIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testRecHiIAEnan2() { recHi(Float.NaN); }
	@Test(expected = IllegalArgumentException.class)
	public final void testRecHiIAEmin2() { recHi(Float.NEGATIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testRecHiIAEmax2() { recHi(Float.POSITIVE_INFINITY); }
	
	private static Param<Float> recLo(float val) {
		return new DefaultBoundedNumberParam<Float>(NAME, INFO, UNITS, 
				DVf, (float) B1, (float) B2, val, (float) R2);
	}
	private static Param<Float> recHi(float val) {
		return new DefaultBoundedNumberParam<Float>(NAME, INFO, UNITS, 
				DVf, (float) B1, (float) B2, (float) R1, val);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testDefaultIAEnan2() { defaultVal(Float.NaN); }
	@Test(expected = IllegalArgumentException.class)
	public final void testDefaultIAEmin2() { defaultVal(Float.NEGATIVE_INFINITY); }
	@Test(expected = IllegalArgumentException.class)
	public final void testDefaultIAEmax2() { defaultVal(Float.POSITIVE_INFINITY); }
	
	private static Param<Float> defaultVal(float val) {
		return new DefaultBoundedNumberParam<Float>(NAME, INFO, UNITS, val, 
				(float) B1, (float) B2, (float) R1, (float) R2);
	}

	// ranges
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowedMisOrdered() {
		// allowed range misordered
		new DefaultBoundedNumberParam<Double>(NAME, INFO, UNITS, DVd, B2, B1, R1, R2);
	}
	@Test(expected = IllegalArgumentException.class)
	public final void testAllowedEqual() {
		// allowed range values equal
		new DefaultBoundedNumberParam<Double>(NAME, INFO, UNITS, DVd, B1, B1, R1, R2);
	}
	@Test(expected = IllegalArgumentException.class)
	public final void testRecommendMisOrdered() {
		// rec range misordered
		new DefaultBoundedNumberParam<Double>(NAME, INFO, UNITS, DVd, B1, B2, R2, R1);
	}
	@Test(expected = IllegalArgumentException.class)
	public final void testRecAllowOverlap() {
		// allowed and rec range overlap
		new DefaultBoundedNumberParam<Double>(NAME, INFO, UNITS, DVd, B1, R2, R1, B2);
	}

	// default value in bounds
	@Test(expected = IllegalArgumentException.class)
	public final void testDefaultOutsideAllowed() {
		// allowed and rec range overlap
		new DefaultBoundedNumberParam<Double>(NAME, INFO, UNITS, -300.0, B1, B2, R1, R2);
	}

	// @formatter:on
	// ===========================

	@Test
	public final void testCreate() {
		BoundedNumberParam<Double> param = Params.newDoubleParamWithBounds(
			NAME, INFO, UNITS, DVd, B1, B2, R1, R2);
		
		// test that correct default values are set
		assertEquals(param.value(), DVd, 0);
		assertEquals(param.minAllowed(), B1, 0);
		assertEquals(param.maxAllowed(), B2, 0);
		assertEquals(param.minRecommended(), R1, 0);
		assertEquals(param.maxRecommended(), R2, 0);
	}


	@Test
	public final void testGetValue() {
		BoundedNumberParam<Double> param = Params.newDoubleParamWithBounds(
			NAME, INFO, UNITS, DVd, B1, B2, R1, R2);

		// test that value is initialized to default
		assertEquals(param.value(), DVd, 0);
		// test a value change
		param.set(10.0);
		assertEquals(param.value(), 10.0, 0);
		param.reset();
	}

	@Test(expected = NullPointerException.class)
	public final void testSetValueNPE() {
		// null value
		BoundedNumberParam<Double> param = Params.newDoubleParamWithBounds(
			NAME, INFO, UNITS, DVd, B1, B2, R1, R2);
		param.set(null);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testSetValueIAE() {
		// value out of range
		BoundedNumberParam<Double> param = Params.newDoubleParamWithBounds(
			NAME, INFO, UNITS, DVd, B1, B2, R1, R2);
		param.set(-300.0);
	}

	@Test
	public final void testSetValue() {
		BoundedNumberParam<Double> param = Params.newDoubleParamWithBounds(
			NAME, INFO, UNITS, DVd, B1, B2, R1, R2);

		// adjust value and check
		param.set(200.0);
		assertEquals(param.value(), 200.0, 0);

		// ensure value stayed the same
		param.reset();
		assertEquals(param.value(), DVd, 0);
		
		// check that some bounds equivalent values work -- this
		// will throw exceptions if not
		param.set(B1);
		param.set(B2);
		param.reset();
	}

	@Test
	public final void testReset() {
		BoundedNumberParam<Double> param = Params.newDoubleParamWithBounds(
			NAME, INFO, UNITS, DVd, B1, B2, R1, R2);
		param.enable();
		// adjust value and check
		param.set(200.0);
		assertEquals(param.value(), 200.0, 0);
		// reset and check
		param.reset();
		assertEquals(param.value(), DVd, 0);
	}

	@Test
	public final void testIsRecommended() {
		BoundedNumberParam<Double> param = Params.newDoubleParamWithBounds(
			NAME, INFO, UNITS, DVd, B1, B2, R1, R2);

		// adjust and test, ale rechecking setters
		param.set(150.0); // recheck setter
		assertFalse(param.recommended());
		param.reset();
		assertTrue(param.recommended());
		param.set(-150.0);
		assertFalse(param.recommended());
		param.set(-50.0);
		assertTrue(param.recommended());
	}

}
