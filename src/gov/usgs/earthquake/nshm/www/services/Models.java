package gov.usgs.earthquake.nshm.www.services;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;

import javax.servlet.ServletContext;

import org.opensha2.eq.model.HazardModel;

import com.google.common.base.Optional;
import com.google.common.base.Throwables;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;

@SuppressWarnings("javadoc")
@Deprecated
final class Models {

	public static final String CONTEXT_ID = "models";

	private final LoadingCache<Id, HazardModel> cache;

	private final ServletContext context;

	/*
	 * Optional executor, if present, triggers loading of all models.
	 */
	Models(ServletContext context, Optional<ExecutorService> executor) {

		this.context = context;

		cache = CacheBuilder.newBuilder().build(new CacheLoader<Id, HazardModel>() {
			@Override public HazardModel load(Id id) throws Exception {
				return createInstance(id);
			}
		});

		if (executor.isPresent()) init(executor.get());
	}

	private HazardModel createInstance(Id id) {
		switch (id) {
			case CEUS_2008:
				return loadModel("/models/2008/Central & Eastern US",
					"2008 USGS Central & Eastern US Hazard Model");
			case CEUS_2014:
				return loadModel("/models/2014/Central & Eastern US",
					"2008 USGS Central & Eastern US Hazard Model");
			case WUS_2008:
				return loadModel("/models/2008/Western US",
					"2008 USGS Western US Hazard Model");
			case WUS_2014:
				return loadModel("/models/2014/Western US",
					"2014 USGS Western US Hazard Model");
			default:
				throw new IllegalArgumentException("Invalid model id: " + id);
		}
	}

	private void init(ExecutorService ex) {
		/*
		 * LoadingCache will block any requests until the requested model is
		 * available so we only need to submit loading tasks here, not wait for
		 * them to complete.
		 */
		for (final Id id : Id.values()) {
			ex.submit(new Loader(cache, id));
		}
	}

	private static class Loader implements Callable<HazardModel> {

		final LoadingCache<Id, HazardModel> cache;
		final Id id;

		Loader(LoadingCache<Id, HazardModel> cache, Id id) {
			this.cache = cache;
			this.id = id;
		}

		@Override public HazardModel call() throws Exception {
			return cache.getUnchecked(id);
		}

	}

	public HazardModel get(Id id) throws ExecutionException {
		return cache.get(id);
	}

	public enum Id {
		CEUS_2008,
		WUS_2008,
		CEUS_2014,
		WUS_2014;
	}

	private HazardModel loadModel(String resourcePath, String name) {
		try {
			System.out.println(resourcePath);
			System.out.println(name);
			URL url = context.getResource(resourcePath);
			Path path = Paths.get(url.toURI());
			return HazardModel.load(path);
		} catch (URISyntaxException | MalformedURLException e) {
			Throwables.propagate(e);
			return null;
		}
	}

}
