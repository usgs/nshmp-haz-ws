package gov.usgs.earthquake.param;

import static org.junit.Assert.*;
import gov.usgs.earthquake.param.DefaultDiscreteNumberParam;
import gov.usgs.earthquake.param.DiscreteNumberParam;

import java.util.Collection;
import java.util.List;
import java.util.Set;

import org.junit.BeforeClass;
import org.junit.Test;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

@SuppressWarnings("javadoc")
public class DefaultDiscreteNumberParamTest {

	private static DiscreteNumberParam<Double> param;

	private static final String NAME = "Test Double Param";
	private static final String INFO = "Double Param Info";
	private static final String UNITS = "units/unit";

	private static final double DV = -10;
	private static Set<Double> OPTIONS;

	@BeforeClass
	public static void setUpBeforeClass() throws Exception {
		OPTIONS = Sets.newHashSet(10d, -10d, 0d, 100d, 100d, -100d);
		param = new DefaultDiscreteNumberParam<Double>(NAME, INFO, UNITS, DV,
			OPTIONS);
	}

	@Test(expected = NullPointerException.class)
	public final void testCreateNPE() {
		// null options
		new DefaultDiscreteNumberParam<Double>(NAME, INFO, UNITS, DV, null);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testCreateIAE1() {
		// empty options
		Set<Double> emptyOptions = Sets.newHashSet();
		new DefaultDiscreteNumberParam<Double>(NAME, INFO, UNITS, DV,
			emptyOptions);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testCreateIAE2() {
		// default not in options
		Set<Double> options = Sets.newHashSet(1.0, 2.0, 3.0);
		new DefaultDiscreteNumberParam<Double>(NAME, INFO, UNITS, DV, options);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testCreateIAE3() {
		// null in option
		Set<Double> options = Sets.newHashSet(1.0, null, 3.0);
		new DefaultDiscreteNumberParam<Double>(NAME, INFO, UNITS, DV, options);
	}

	@Test(expected = UnsupportedOperationException.class)
	public final void testOptionsImmutableUOE() {
		// test that an immutable copy was made on the way in
		param.options().add(4.0);
	}

	@Test
	public final void testEnabledForSingleValue() {
		// if only one value is allowed, param should not be enabled
		Set<Double> options = Sets.newHashSet(10d);
		DiscreteNumberParam<Double> param = new DefaultDiscreteNumberParam<Double>(
			NAME, INFO, UNITS, 10d, options);
		assertFalse(param.enabled());
	}

	@Test
	public final void testGetAllowedValues() {
		// test duplicate options were removed
		assertTrue(param.options().containsAll(OPTIONS));
		assertTrue(param.options().size() == OPTIONS.size() - 1);
		// test options sorted
		List<Double> sorted = Lists.newArrayList(-100d, -10d, 0d, 10d, 100d);
		assertEquals(sorted, Lists.newArrayList(param.options()));
	}

	// these get/set value tests are a little better than those in
	// DefaultParamTest that only test Object equality.

	@Test
	public final void testGetValue() {
		// test that value is initialized to default
		assertEquals(param.value().doubleValue(), DV, 0);
		// test a value change
		param.set(100.0);
		assertEquals(param.value().doubleValue(), 100.0, 0);
		param.reset();
	}

	@Test(expected = NullPointerException.class)
	public final void testSetValueNPE() {
		// this is also tested in DefaultParamTest, but setValue in some
		// subclasses also performs this check and we want the tests to enter
		// all argument checks
		param.set(null);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testSetValueIAE() {
		// test invalid value
		param.set(0.1);
	}

	@Test
	public final void testSetValue() {
		// good value
		param.set(100.0);
		assertEquals(param.value(), 100.0, 0.0);
		param.reset();
	}

}
