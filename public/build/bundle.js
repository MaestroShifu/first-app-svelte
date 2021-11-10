
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const pointMakers = writable([]);
    const latLng = writable(undefined);

    // do not edit .js files directly - edit src/index.jst



    var fastDeepEqual = function equal(a, b) {
      if (a === b) return true;

      if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor) return false;

        var length, i, keys;
        if (Array.isArray(a)) {
          length = a.length;
          if (length != b.length) return false;
          for (i = length; i-- !== 0;)
            if (!equal(a[i], b[i])) return false;
          return true;
        }



        if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
        if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
        if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

        keys = Object.keys(a);
        length = keys.length;
        if (length !== Object.keys(b).length) return false;

        for (i = length; i-- !== 0;)
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

        for (i = length; i-- !== 0;) {
          var key = keys[i];

          if (!equal(a[key], b[key])) return false;
        }

        return true;
      }

      // true if both NaN, false otherwise
      return a!==a && b!==b;
    };

    /**
     * Copyright 2019 Google LLC. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at.
     *
     *      Http://www.apache.org/licenses/LICENSE-2.0.
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const DEFAULT_ID = "__googleMapsScriptId";
    /**
     * [[Loader]] makes it easier to add Google Maps JavaScript API to your application
     * dynamically using
     * [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
     * It works by dynamically creating and appending a script node to the the
     * document head and wrapping the callback function so as to return a promise.
     *
     * ```
     * const loader = new Loader({
     *   apiKey: "",
     *   version: "weekly",
     *   libraries: ["places"]
     * });
     *
     * loader.load().then((google) => {
     *   const map = new google.maps.Map(...)
     * })
     * ```
     */
    class Loader {
        /**
         * Creates an instance of Loader using [[LoaderOptions]]. No defaults are set
         * using this library, instead the defaults are set by the Google Maps
         * JavaScript API server.
         *
         * ```
         * const loader = Loader({apiKey, version: 'weekly', libraries: ['places']});
         * ```
         */
        constructor({ apiKey, channel, client, id = DEFAULT_ID, libraries = [], language, region, version, mapIds, nonce, retries = 3, url = "https://maps.googleapis.com/maps/api/js", }) {
            this.CALLBACK = "__googleMapsCallback";
            this.callbacks = [];
            this.done = false;
            this.loading = false;
            this.errors = [];
            this.version = version;
            this.apiKey = apiKey;
            this.channel = channel;
            this.client = client;
            this.id = id || DEFAULT_ID; // Do not allow empty string
            this.libraries = libraries;
            this.language = language;
            this.region = region;
            this.mapIds = mapIds;
            this.nonce = nonce;
            this.retries = retries;
            this.url = url;
            if (Loader.instance) {
                if (!fastDeepEqual(this.options, Loader.instance.options)) {
                    throw new Error(`Loader must not be called again with different options. ${JSON.stringify(this.options)} !== ${JSON.stringify(Loader.instance.options)}`);
                }
                return Loader.instance;
            }
            Loader.instance = this;
        }
        get options() {
            return {
                version: this.version,
                apiKey: this.apiKey,
                channel: this.channel,
                client: this.client,
                id: this.id,
                libraries: this.libraries,
                language: this.language,
                region: this.region,
                mapIds: this.mapIds,
                nonce: this.nonce,
                url: this.url,
            };
        }
        get failed() {
            return this.done && !this.loading && this.errors.length >= this.retries + 1;
        }
        /**
         * CreateUrl returns the Google Maps JavaScript API script url given the [[LoaderOptions]].
         *
         * @ignore
         */
        createUrl() {
            let url = this.url;
            url += `?callback=${this.CALLBACK}`;
            if (this.apiKey) {
                url += `&key=${this.apiKey}`;
            }
            if (this.channel) {
                url += `&channel=${this.channel}`;
            }
            if (this.client) {
                url += `&client=${this.client}`;
            }
            if (this.libraries.length > 0) {
                url += `&libraries=${this.libraries.join(",")}`;
            }
            if (this.language) {
                url += `&language=${this.language}`;
            }
            if (this.region) {
                url += `&region=${this.region}`;
            }
            if (this.version) {
                url += `&v=${this.version}`;
            }
            if (this.mapIds) {
                url += `&map_ids=${this.mapIds.join(",")}`;
            }
            return url;
        }
        deleteScript() {
            const script = document.getElementById(this.id);
            if (script) {
                script.remove();
            }
        }
        /**
         * Load the Google Maps JavaScript API script and return a Promise.
         */
        load() {
            return this.loadPromise();
        }
        /**
         * Load the Google Maps JavaScript API script and return a Promise.
         *
         * @ignore
         */
        loadPromise() {
            return new Promise((resolve, reject) => {
                this.loadCallback((err) => {
                    if (!err) {
                        resolve(window.google);
                    }
                    else {
                        reject(err.error);
                    }
                });
            });
        }
        /**
         * Load the Google Maps JavaScript API script with a callback.
         */
        loadCallback(fn) {
            this.callbacks.push(fn);
            this.execute();
        }
        /**
         * Set the script on document.
         */
        setScript() {
            if (document.getElementById(this.id)) {
                // TODO wrap onerror callback for cases where the script was loaded elsewhere
                this.callback();
                return;
            }
            const url = this.createUrl();
            const script = document.createElement("script");
            script.id = this.id;
            script.type = "text/javascript";
            script.src = url;
            script.onerror = this.loadErrorCallback.bind(this);
            script.defer = true;
            script.async = true;
            if (this.nonce) {
                script.nonce = this.nonce;
            }
            document.head.appendChild(script);
        }
        /**
         * Reset the loader state.
         */
        reset() {
            this.deleteScript();
            this.done = false;
            this.loading = false;
            this.errors = [];
            this.onerrorEvent = null;
        }
        resetIfRetryingFailed() {
            if (this.failed) {
                this.reset();
            }
        }
        loadErrorCallback(e) {
            this.errors.push(e);
            if (this.errors.length <= this.retries) {
                const delay = this.errors.length * Math.pow(2, this.errors.length);
                console.log(`Failed to load Google Maps script, retrying in ${delay} ms.`);
                setTimeout(() => {
                    this.deleteScript();
                    this.setScript();
                }, delay);
            }
            else {
                this.onerrorEvent = e;
                this.callback();
            }
        }
        setCallback() {
            window.__googleMapsCallback = this.callback.bind(this);
        }
        callback() {
            this.done = true;
            this.loading = false;
            this.callbacks.forEach((cb) => {
                cb(this.onerrorEvent);
            });
            this.callbacks = [];
        }
        execute() {
            this.resetIfRetryingFailed();
            if (this.done) {
                this.callback();
            }
            else {
                // short circuit and warn if google.maps is already loaded
                if (window.google && window.google.maps && window.google.maps.version) {
                    console.warn("Google Maps already loaded outside @googlemaps/js-api-loader." +
                        "This may result in undesirable behavior as options and script parameters may not match.");
                    this.callback();
                    return;
                }
                if (this.loading) ;
                else {
                    this.loading = true;
                    this.setCallback();
                    this.setScript();
                }
            }
        }
    }

    /* src/components/Maps.svelte generated by Svelte v3.44.1 */

    const { console: console_1 } = globals;
    const file$2 = "src/components/Maps.svelte";

    // (66:4) {:else}
    function create_else_block(ctx) {
    	let div;
    	let span;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "No se encontro una api key valida!!";
    			add_location(span, file$2, 67, 12, 1828);
    			attr_dev(div, "class", "error-mesage svelte-bigcnx");
    			add_location(div, file$2, 66, 8, 1789);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(66:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (64:4) {#if apiKey}
    function create_if_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "map");
    			attr_dev(div, "class", "svelte-bigcnx");
    			add_location(div, file$2, 64, 8, 1748);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(64:4) {#if apiKey}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let h1;
    	let t1;

    	function select_block_type(ctx, dirty) {
    		if (/*apiKey*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Componente de mapa";
    			t1 = space();
    			if_block.c();
    			add_location(h1, file$2, 62, 4, 1695);
    			add_location(main, file$2, 61, 0, 1684);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			if_block.m(main, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Maps', slots, []);
    	let { apiKey = '' } = $$props;
    	let googleMaps;
    	let isLoading = false;
    	const dispatch = createEventDispatcher();
    	const loader = new Loader({ apiKey, version: 'weekly' });

    	const changeLoadingStatus = isLoadingState => {
    		isLoading = isLoadingState;
    		dispatch('is-loading', { isLoading });
    	};

    	const latLngUnSub = latLng.subscribe(value => {
    		if (!googleMaps) {
    			return;
    		}

    		const centerPoint = new google.maps.LatLng(value.latitude, value.longitude);
    		googleMaps.setCenter(centerPoint);
    	});

    	onMount(() => {
    		if (!apiKey) {
    			return;
    		}

    		loader.load().then(() => {
    			googleMaps = new google.maps.Map(document.getElementById('map'), { zoom: 15 });

    			googleMaps.addListener('click', event => {
    				const maker = event.latLng;
    				new google.maps.Marker({ position: maker, map: googleMaps });
    				googleMaps.panTo(maker);

    				pointMakers.update(makers => {
    					return [
    						...makers,
    						{
    							latitude: event.latLng.lat(),
    							longitude: event.latLng.lng(),
    							maker
    						}
    					];
    				});
    			});

    			changeLoadingStatus(true);
    		}).catch(err => {
    			console.error(err);
    			changeLoadingStatus(false);
    		});
    	});

    	onDestroy(() => {
    		latLngUnSub();
    	});

    	const writable_props = ['apiKey'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Maps> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('apiKey' in $$props) $$invalidate(0, apiKey = $$props.apiKey);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		onDestroy,
    		latLng,
    		pointMakers,
    		Loader,
    		apiKey,
    		googleMaps,
    		isLoading,
    		dispatch,
    		loader,
    		changeLoadingStatus,
    		latLngUnSub
    	});

    	$$self.$inject_state = $$props => {
    		if ('apiKey' in $$props) $$invalidate(0, apiKey = $$props.apiKey);
    		if ('googleMaps' in $$props) googleMaps = $$props.googleMaps;
    		if ('isLoading' in $$props) isLoading = $$props.isLoading;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [apiKey];
    }

    class Maps extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { apiKey: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Maps",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get apiKey() {
    		throw new Error("<Maps>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set apiKey(value) {
    		throw new Error("<Maps>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Table.svelte generated by Svelte v3.44.1 */
    const file$1 = "src/components/Table.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	child_ctx[4] = i;
    	return child_ctx;
    }

    // (21:8) {#each makers as maker, i}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*i*/ ctx[4] + 1 + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*maker*/ ctx[2].latitude + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*maker*/ ctx[2].longitude + "";
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			add_location(td0, file$1, 22, 16, 491);
    			add_location(td1, file$1, 23, 16, 526);
    			add_location(td2, file$1, 24, 16, 570);
    			add_location(tr, file$1, 21, 12, 470);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*makers*/ 1 && t2_value !== (t2_value = /*maker*/ ctx[2].latitude + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*makers*/ 1 && t4_value !== (t4_value = /*maker*/ ctx[2].longitude + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(21:8) {#each makers as maker, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let table;
    	let tr;
    	let td0;
    	let t3;
    	let td1;
    	let t5;
    	let td2;
    	let t7;
    	let each_value = /*makers*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Lista de makers";
    			t1 = space();
    			table = element("table");
    			tr = element("tr");
    			td0 = element("td");
    			td0.textContent = "#";
    			t3 = space();
    			td1 = element("td");
    			td1.textContent = "latitude";
    			t5 = space();
    			td2 = element("td");
    			td2.textContent = "longitude";
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$1, 13, 4, 273);
    			add_location(td0, file$1, 16, 12, 335);
    			add_location(td1, file$1, 17, 12, 360);
    			add_location(td2, file$1, 18, 12, 390);
    			add_location(tr, file$1, 15, 8, 318);
    			add_location(table, file$1, 14, 4, 302);
    			add_location(main, file$1, 12, 0, 262);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, table);
    			append_dev(table, tr);
    			append_dev(tr, td0);
    			append_dev(tr, t3);
    			append_dev(tr, td1);
    			append_dev(tr, t5);
    			append_dev(tr, td2);
    			append_dev(table, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*makers*/ 1) {
    				each_value = /*makers*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(table, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Table', slots, []);
    	let makers = [];

    	const makerUnSub = pointMakers.subscribe(value => {
    		$$invalidate(0, makers = [...value]);
    	});

    	onDestroy(() => {
    		makerUnSub();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onDestroy,
    		pointMakers,
    		makers,
    		makerUnSub
    	});

    	$$self.$inject_state = $$props => {
    		if ('makers' in $$props) $$invalidate(0, makers = $$props.makers);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*makers*/ 1) ;
    	};

    	return [makers];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.1 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let maps;
    	let t2;
    	let table;
    	let current;

    	maps = new Maps({
    			props: {
    				apiKey: "AIzaSyDBJNMZIhKZmGdBWkLaogYu0WnNpkZVShE"
    			},
    			$$inline: true
    		});

    	maps.$on("is-loading", /*handleLoadStatusMap*/ ctx[0]);
    	table = new Table({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "App inicial";
    			t1 = space();
    			create_component(maps.$$.fragment);
    			t2 = space();
    			create_component(table.$$.fragment);
    			add_location(h1, file, 28, 4, 780);
    			add_location(main, file, 27, 0, 769);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			mount_component(maps, main, null);
    			append_dev(main, t2);
    			mount_component(table, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(maps.$$.fragment, local);
    			transition_in(table.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(maps.$$.fragment, local);
    			transition_out(table.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(maps);
    			destroy_component(table);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let mapLoading = false;

    	const handleLoadStatusMap = event => {
    		mapLoading = event.detail.isLoading;

    		const text = event.detail.isLoading
    		? 'Cargo el mapa de forma satisfactoria.'
    		: 'No se pudo cargar el mapa.';

    		alert(text);
    	};

    	const loadGeolocation = () => {
    		if (!navigator.geolocation && !mapLoading) {
    			return;
    		}

    		navigator.geolocation.getCurrentPosition(position => {
    			const posGeo = {
    				latitude: position.coords.latitude,
    				longitude: position.coords.longitude
    			};

    			latLng.set(posGeo);
    		});
    	};
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		latLng,
    		Maps,
    		Table,
    		mapLoading,
    		handleLoadStatusMap,
    		loadGeolocation
    	});

    	$$self.$inject_state = $$props => {
    		if ('mapLoading' in $$props) mapLoading = $$props.mapLoading;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	{
    		loadGeolocation();
    	}

    	return [handleLoadStatusMap];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
