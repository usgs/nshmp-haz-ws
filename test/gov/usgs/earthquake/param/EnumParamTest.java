package gov.usgs.earthquake.param;

import static org.junit.Assert.*;
import gov.usgs.earthquake.param.DefaultEnumParam;

import java.util.EnumSet;

import org.junit.BeforeClass;
import org.junit.Test;

@SuppressWarnings("javadoc")
public class EnumParamTest {

	private static DefaultEnumParam<Choice> ep;
	
	private static final String NAME = "Choice Param";
	private static final String INFO = "Choice Info";
	private static final Choice DV = Choice.TWO;
	private static EnumSet<Choice> options = EnumSet.of(
			Choice.ONE, Choice.TWO);
	
	private enum Choice {
		ONE, TWO, THREE;
	}
	
	@BeforeClass
	public static void setUpBeforeClass() throws Exception {
		ep = new DefaultEnumParam<Choice>(NAME, INFO, DV, options);
	}
	
	@Test(expected = NullPointerException.class)
	public final void testCreateNPE() {
		// null options
		new DefaultEnumParam<Choice>(NAME, INFO, DV, null);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testCreateIAE1() {
		// empty options
		new DefaultEnumParam<Choice>(NAME, INFO, DV, EnumSet.noneOf(
			DV.getDeclaringClass()));
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testCreateIAE2() {
		// default not in options
		new DefaultEnumParam<Choice>(NAME, INFO, DV, EnumSet.of(Choice.ONE));
	}
	
	@Test(expected = UnsupportedOperationException.class)
	public final void testModifyOptions() {
		ep.options().add(Choice.THREE);
	}

	@Test
	public final void testEnumParameter() {
		// check options gets properly set from passed in value
		assertEquals(ep.options(), options);
	}

	@Test
	public final void testGetValue() {
		assertEquals(DV, ep.value());
		// alter and test
		ep.set(Choice.ONE);
		assertEquals(Choice.ONE, ep.value());
		ep.reset();
	}

	@Test
	public final void testReset() {
		assertEquals(DV, Choice.TWO); // ensure DV didn't change
		ep.set(Choice.ONE);
		assertEquals(Choice.ONE, ep.value());
		ep.reset();
		assertEquals(DV, ep.value());
	}
	
	@Test(expected = NullPointerException.class)
	public final void testSetValueNPE() {
		// null options
		ep.set(null);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testSetValueIAE() {
		// null options
		ep.set(Choice.THREE);
	}
	
	@Test
	public final void testSetValue() {
		ep.set(Choice.ONE);
		assertEquals(Choice.ONE, ep.value());
		ep.set(Choice.TWO);
		assertEquals(Choice.TWO, ep.value());
		ep.reset();
	}
	
}
