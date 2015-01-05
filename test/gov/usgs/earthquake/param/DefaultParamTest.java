package gov.usgs.earthquake.param;

import static org.junit.Assert.*;
import gov.usgs.earthquake.param.DefaultParam;
import gov.usgs.earthquake.param.Param;

import org.junit.BeforeClass;
import org.junit.Test;

@SuppressWarnings("javadoc")
public class DefaultParamTest {

	// method tester abstract params
	private static DefaultParam<Object> param1;
	private static DefaultParam<Object> param2;
	private static Object PARAM_VALUE = new Object();
	private static final String PARAM_NAME = "Test Param";
	private static final String PARAM_INFO = "Param Info";
	private static DefaultParam<Object> parent;
	private static final String PARENT_NAME = "Parent";
	private static DefaultParam<Object> child1;
	private static final String CHILD_1_NAME = "Child1";
	private static DefaultParam<Object> child2;
	private static final String CHILD_2_NAME = "Child2";

	@BeforeClass
	public static void setUp() throws Exception {
		param1 = createParam(PARAM_NAME, PARAM_INFO, PARAM_VALUE);
		param2 = createParam(PARAM_NAME, null, PARAM_VALUE);
		parent = createParam(PARENT_NAME, null, PARAM_VALUE);
		child1 = createParam(CHILD_1_NAME, null, PARAM_VALUE);
		child2 = createParam(CHILD_2_NAME, null, PARAM_VALUE);
	}

	// constructor exceptions
	@Test(expected = NullPointerException.class)
	public final void testNPEname() {
		createParam(null, PARAM_INFO, PARAM_VALUE);
	}

	@Test(expected = NullPointerException.class)
	public final void testNPEdefault() {
		createParam(PARAM_NAME, PARAM_INFO, null);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testIAEname() {
		createParam(" ", PARAM_INFO, PARAM_VALUE);
	}

	@Test
	public final void testArgModification() {
		// test that long and empty strings are shortened
		// or converted correctly

		// make long strings
		StringBuilder sbName = new StringBuilder();
		StringBuilder sbInfo = new StringBuilder();
		for (int i = 0; i < 30; i++) {
			sbName.append(PARAM_NAME);
			sbInfo.append(PARAM_INFO);
		}
		String longName = sbName.toString();
		String longInfo = sbInfo.toString();
		// ensure strings are long enough
		assertTrue(longName.length() > DefaultParam.MAX_LENGTH_NAME);
		assertTrue(longName.length() > DefaultParam.MAX_LENGTH_INFO);

		// test trimming
		Param<Object> p = createParam(longName, longInfo, PARAM_VALUE);
		assertTrue(p.toString().length() == DefaultParam.MAX_LENGTH_NAME);
		assertTrue(p.info().length() == DefaultParam.MAX_LENGTH_INFO);

		// test null conversion
		p = createParam(PARAM_NAME, null, PARAM_VALUE);
		assertTrue(p.info().equals(""));
	}

	@Test
	public final void testGetInfo() {
		assertEquals(param1.info(), PARAM_INFO);
		// test that null was converted to empty String
		assertEquals(param2.info(), "");
	}

	@Test
	public final void testGetName() {
		// test pass through of valid name from constructor
		assertEquals(PARAM_NAME, param1.toString());
	}

	@Test
	public final void testSetEnabled() {
		// test default required setting
		assertTrue(param1.enabled());
		// and pass through of setter
		param1.disable();
		assertFalse(param1.enabled());
		// reset
		param1.enable();
	}

	@Test
	public final void testIsEnabled() {
		// test default required setting
		assertTrue(param1.enabled());
		// and pass through of setter
		param1.disable();
		assertFalse(param1.enabled());
		// reset
		param1.enable();
	}

	@Test
	public final void testReset() {
		param1.set(new Object());
		// adjust value and test
		assertNotSame(param1.value(), PARAM_VALUE);
		// reset and test for default
		param1.reset();
		assertSame(param1.value(), PARAM_VALUE);
	}

	// constructor exceptions
	@Test(expected = NullPointerException.class)
	public final void tesSetValueNPE() {
		param1.set(null);
	}

	@Test
	public final void testGetState() {
		fail("Not yet implemented");
	}

	@Test
	public final void testGetValue() {
		param1.enable(); // re-enable after previous test
		// test that value is initialized to default
		assertEquals(PARAM_VALUE, param1.value());
		// test a value change
		Object newObj = new Object();
		param1.set(newObj);
		assertEquals(param1.value(), newObj);
		param1.reset();
	}

	@Test(expected = NullPointerException.class)
	public final void testAddChildNPE() {
		Param<Object> p = createParam("Parent", PARAM_INFO, PARAM_VALUE);
		p.addChild(null);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testAddChildIAE1() {
		Param<Object> p1 = createParam("Parent1", PARAM_INFO, PARAM_VALUE);
		Param<Object> p2 = createParam("Parent2", PARAM_INFO, PARAM_VALUE);
		Param<Object> c = createParam("Child", PARAM_INFO, PARAM_VALUE);
		p1.addChild(c);
		p2.addChild(c); // IAE for previously attached child
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testAddChildIAE2() {
		Param<Object> p = createParam("Parent", PARAM_INFO, PARAM_VALUE);
		Param<Object> c1 = createParam("Child", PARAM_INFO, PARAM_VALUE);
		Param<Object> c2 = createParam("Child", PARAM_INFO, PARAM_VALUE);
		p.addChild(c1);
		p.addChild(c2); // IAE for previously attached child with same name
	}

	@Test
	public final void testChildMethods() {
		assertTrue(parent.children() == null); // check there are none
		parent.addChild(child1);
		assertTrue(parent.children() != null);
		assertTrue(parent.children().size() == 1);
		parent.addChild(child2);
		assertTrue(parent.children().size() == 2);
	}

	// helper method to create an DefaultParameter
	private static DefaultParam<Object> createParam(String name, String info,
			Object defaultValue) {
		return new DefaultParam<Object>(name, info, defaultValue);
	}

}
