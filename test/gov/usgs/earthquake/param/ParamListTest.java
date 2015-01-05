package gov.usgs.earthquake.param;

import static org.junit.Assert.*;
import gov.usgs.earthquake.param.DefaultParam;
import gov.usgs.earthquake.param.Param;
import gov.usgs.earthquake.param.ParamList;

import java.util.List;

import org.junit.Test;

import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;

@SuppressWarnings("javadoc")
public class ParamListTest {

	@Test(expected = NullPointerException.class)
	public final void testCreateNPE1() {
		// varargs null
		Param<Object> np = null;
		ParamList.of(np);
	}

	@Test(expected = NullPointerException.class)
	public final void testCreateNPE2() {
		Param<Object> p1 = new DefaultParam<Object>("Param1", "info", new Object());
		Param<Object> p2 = new DefaultParam<Object>("Param2", "info", new Object());
		// one vararg null
		Param<Object> np = null;
		ParamList.of(p1, np, p2);
	}

	@Test(expected = NullPointerException.class)
	public final void testAddAllNPE1() {
		ParamList pList = ParamList.create();
		pList.addAll(null);
	}

	@Test(expected = NullPointerException.class)
	@SuppressWarnings("unchecked")
	public final void testAddAllNPE2() {
		// one member of collection null
		ParamList pList = ParamList.create();
		Param<Object> p1 = new DefaultParam<Object>("Param1", "info", new Object());
		Param<Object> p2 = new DefaultParam<Object>("Param2", "info", new Object());
		List<Param<Object>> params = Lists.newArrayList(p1, null, p2);
		pList.addAll(params); // NPE when looping params
	}

	@Test(expected = NullPointerException.class)
	public final void testAddNPE() {
		ParamList pList = ParamList.create();
		pList.add(null);
	}

	@Test(expected = IllegalArgumentException.class)
	public final void testAddIAE() {
		Param<Object> p1 = new DefaultParam<Object>("Param1", "info", new Object());
		Param<Object> p2 = new DefaultParam<Object>("Param1", "info", new Object());
		ParamList pList = ParamList.create();
		pList.add(p1);
		pList.add(p2); // IAE on add with same name
	}

	@Test(expected = UnsupportedOperationException.class)
	public final void testRemove() {
		Param<Object> p1 = new DefaultParam<Object>("Param1", "info", new Object());
		ParamList pList = ParamList.of(p1);
		pList.remove(p1);
	}

	@Test
	public final void testCreate() {
		Param<Object> p1 = new DefaultParam<Object>("Param1", "info", new Object());
		Param<Object> p2 = new DefaultParam<Object>("Param2", "info", new Object());
		ParamList pList = ParamList.of(p1, p2);
		assertTrue(pList.size() == 2);
	}
	
	@Test
	public final void testAdd() {
		Param<Object> p1 = new DefaultParam<Object>("Param1", "info", new Object());
		Param<Object> p2 = new DefaultParam<Object>("Param2", "info", new Object());
		ParamList pList = ParamList.create();
		assertTrue(pList.add(p1));
		assertTrue(pList.size() == 1);
		assertTrue(pList.add(p2));
		assertTrue(pList.size() == 2);
		
		// TODO need state test; state updated on add
	}

	@Test
	@SuppressWarnings("unchecked")
	public final void testAddAll() {
		// ensure size is correct after adding multiple
		Param<Object> p1 = new DefaultParam<Object>("Param1", "info",
			new Object());
		Param<Object> p2 = new DefaultParam<Object>("Param2", "info",
			new Object());
		List<? extends Param<?>> testList = Lists.newArrayList(p1, p2);
		ParamList pList = ParamList.create();
		pList.addAll(testList);
		assertTrue(pList.size() == 2);
		// ensure objects are the same
		assertSame(p1, Iterables.get(pList, 0));
		assertSame(p2, Iterables.get(pList, 1));
	}
	
	@Test
	public final void testGet() {
		// tested above in addAll
	}
	
	@Test
	public final void testSize() {
		// tested above in addAll
	}

	@Test
	public final void testSetState() {
		fail("Not yet implemented");
	}

	@Test
	public final void testGetState() {
		fail("Not yet implemented");
	}

	public static void main(String[] args) {
		Param<Object> p1 = new DefaultParam<Object>("Param1", "info", new Object());
		ParamList pList = ParamList.of(p1);
		pList.remove(null);
//		pList.remove(p1);

	}
}
