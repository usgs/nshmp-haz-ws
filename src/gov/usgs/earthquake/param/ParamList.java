package gov.usgs.earthquake.param;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;
import static gov.usgs.earthquake.param.ParamKey.NAME;
import static gov.usgs.earthquake.param.ParamKey.VALUE;

import java.util.AbstractSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

import com.google.common.collect.Iterators;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

/**
 * Parameter {@code Set} implementation with insertion-order iteration. The
 * state of a {@code ParamSet} may be obtained as a {@code JsonArray} of
 * individual {@code Param} states. This class extends {@code AbstractSet} and
 * all modifying operations other than {@code add()} and {@code addAll()} throw
 * an {@code UnsupportedOperationException}. A {@code ParamSet} will not accept
 * {@code null}.
 * 
 * <p>A {@code ParamSet} updates all {@code Param} values when
 * {@code setState(JsonArray)} is called. An exception will be thrown if any
 * {@code Param} identified in the state object is not present in this
 * {@code ParamSet}.</p>
 * 
 * @author Peter Powers
 */
public class ParamList extends AbstractSet<Param<?>> {

	private final Map<String, Param<?>> pMap;
	private final JsonArray state;

	private ParamList() {
		pMap = new LinkedHashMap<>();
		state = new JsonArray();
	}

	/**
	 * Create an empty {@code ParamList}.
	 * 
	 * @return a new list
	 */
	public static ParamList create() {
		return new ParamList();
	}

	/**
	 * Create a {@code ParamList} initially populated with the supplied
	 * {@code Param}s.
	 * 
	 * @param params to populate list with
	 * @return a new list
	 */
	public static ParamList of(Param<?>... params) {
		checkNotNull(params);
		ParamList pList = ParamList.create();
		for (Param<?> p : params) {
			pList.add(p);
		}
		return pList;
	}

	/**
	 * Return the state of all {@code Param}s in this list as a
	 * {@code JsonArray}.
	 * 
	 * @return json
	 */
	public JsonArray state() {
		return state;
	}

	/**
	 * Update the state of this list and the values of all {@code Param}s it
	 * contains. If the supplied {@code JsonObject} contains {@code Param}s not
	 * in this list, an exception is thrown.
	 * @param json to use for update
	 */
	public void setState(JsonArray json) {
		for (JsonElement element : json) {
			JsonObject state = element.getAsJsonObject();
			Param<?> p = pMap.get(state.get(NAME.toString()).getAsString());
			if (p != null) ((DefaultParam<?>) p).setState(state.get(VALUE.toString()));
		}

		// TODO can this be package private?? so we can avoid error checking
		// (currently not implemented). It will only ever be called by internal
		// application management classes.

	}

	/**
	 * Pass through method that enables all the {@code Param}s in this list. The
	 * enabled state is not a property of the list itself and cannot be queried.
	 * 
	 * @see Param#enable()
	 */
	public void enable() {
		for (Param<?> p : pMap.values()) {
			p.enable();
		}
	}

	/**
	 * Pass through method that disables all the {@code Param}s in this list.
	 * The enabled state is not a property of the list itself and cannot be
	 * queried.
	 * 
	 * @see Param#disable()
	 */
	public void disable() {
		for (Param<?> p : pMap.values()) {
			p.disable();
		}
	}

	/**
	 * Pass through method that resets all the {@code Param}s in this list.
	 * 
	 * @see Param#reset()
	 */
	public void reset() {
		for (Param<?> p : pMap.values()) {
			p.reset();
		}
	}

	@Override public boolean add(Param<?> param) {
		checkNotNull(param);
		checkArgument(!contains(param), "Set already contains parameter with name: %s",
			param.toString());
		state.add(param.state());
		pMap.put(param.toString(), param);
		return true;
	}

	@Override public int size() {
		return pMap.size();
	}

	@Override public Iterator<Param<?>> iterator() {
		return Iterators.unmodifiableIterator(pMap.values().iterator());
	}

}
