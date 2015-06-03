package gov.usgs.earthquake.nshm.www.services;

import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.servlet.ServletContext;

import org.opensha2.eq.model.HazardModel;

import com.google.common.base.Throwables;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.ListenableFuture;
import com.google.common.util.concurrent.ListeningExecutorService;
import com.google.common.util.concurrent.MoreExecutors;

/**
 * Hazard model identifiers.
 * @author Peter Powers
 */
@SuppressWarnings("javadoc")
public class Models {

	public static final String CONTEXT_ID = "models";

	private final LoadingCache<Id, HazardModel> cache;

	private final ServletContext context;

	Models(ServletContext context, boolean init) {

		this.context = context;

		cache = CacheBuilder.newBuilder().build(new CacheLoader<Id, HazardModel>() {
			@Override public HazardModel load(Id id) throws Exception {
				return createInstance(id);
			}
		});

		if (init) init();
	}

	private HazardModel createInstance(Id id) {
		switch (id) {
			case CEUS_2008:
				return loadModel("/models/2008/Central & Eastern US",
					"2008 USGS Central & Eastern US Hazard Model");
			case CEUS_2014:
				return loadModel("/models/2008/Central & Eastern US",
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

	void init() {
		Id[] ids = Id.values();
		int numProc = Math.min(Runtime.getRuntime().availableProcessors(), ids.length);
		ExecutorService ex = Executors.newFixedThreadPool(numProc);
		ListeningExecutorService lex = MoreExecutors.listeningDecorator(ex);

		// HazardModel model;
		// for (final Id id : ids) {
		// model = cache.getUnchecked(id);
		// }

		List<ListenableFuture<HazardModel>> futureModels = new ArrayList<>();

		for (final Id id : ids) {
			ListenableFuture<HazardModel> explosion = lex.submit(new Callable<HazardModel>() {
				@Override public HazardModel call() {
					return cache.getUnchecked(id);
				}
			});
		}
		ListenableFuture<List<HazardModel>> futureList = Futures.allAsList(futureModels);
		try {
			futureList.get();
		} catch (InterruptedException | ExecutionException e) {
			// TODO enable logging of some sort
			e.printStackTrace();
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
			// URL url = Resources.getResource(resourcePath);
			Path path = Paths.get(url.toURI());
			return HazardModel.load(path, name);
		} catch (URISyntaxException | MalformedURLException e) {
			Throwables.propagate(e);
			return null;
		}
	}

}
