
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
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
        if (node.parentNode) {
            node.parentNode.removeChild(node);
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
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
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
            flush_render_callbacks($$.after_update);
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
    function init$1(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
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
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let head;
    	let title;
    	let t1;
    	let link;
    	let t2;
    	let body;
    	let h1;
    	let t3;
    	let span;
    	let t5;
    	let t6;
    	let div3;
    	let div0;
    	let button0;
    	let t8;
    	let button1;
    	let t10;
    	let div1;
    	let t11;
    	let div2;
    	let button2;
    	let t13;
    	let button3;
    	let t15;
    	let div4;
    	let t16;
    	let nav;
    	let div5;
    	let a;
    	let t18;
    	let div6;
    	let t19;
    	let script;
    	let script_src_value;

    	const block = {
    		c: function create() {
    			head = element("head");
    			title = element("title");
    			title.textContent = "RGB Colour Guessing Game";
    			t1 = space();
    			link = element("link");
    			t2 = space();
    			body = element("body");
    			h1 = element("h1");
    			t3 = text("Check this out:\n        ");
    			span = element("span");
    			span.textContent = "RGB";
    			t5 = text("\n        Guess which colour is this?");
    			t6 = space();
    			div3 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Restart";
    			t8 = space();
    			button1 = element("button");
    			button1.textContent = "💡";
    			t10 = space();
    			div1 = element("div");
    			t11 = space();
    			div2 = element("div");
    			button2 = element("button");
    			button2.textContent = "Easy";
    			t13 = space();
    			button3 = element("button");
    			button3.textContent = "Hard";
    			t15 = space();
    			div4 = element("div");
    			t16 = space();
    			nav = element("nav");
    			div5 = element("div");
    			a = element("a");
    			a.textContent = "Created by 🆉. Sūn";
    			t18 = space();
    			div6 = element("div");
    			t19 = space();
    			script = element("script");
    			add_location(title, file, 6, 4, 79);
    			attr_dev(link, "rel", "stylesheet");
    			attr_dev(link, "type", "text/css");
    			attr_dev(link, "href", "styles.scss");
    			add_location(link, file, 7, 4, 123);
    			add_location(head, file, 5, 0, 68);
    			attr_dev(span, "id", "colour-to-guess");
    			add_location(span, file, 14, 8, 240);
    			add_location(h1, file, 12, 4, 203);
    			attr_dev(button0, "id", "restart");
    			add_location(button0, file, 21, 12, 391);
    			attr_dev(button1, "id", "hint");
    			add_location(button1, file, 22, 12, 441);
    			attr_dev(div0, "id", "left-controls");
    			add_location(div0, file, 20, 8, 354);
    			attr_dev(div1, "id", "result-message");
    			add_location(div1, file, 25, 8, 495);
    			attr_dev(button2, "class", "mode selected");
    			attr_dev(button2, "data-mode", "easy");
    			add_location(button2, file, 28, 12, 573);
    			attr_dev(button3, "class", "mode");
    			attr_dev(button3, "data-mode", "hard");
    			add_location(button3, file, 29, 12, 646);
    			attr_dev(div2, "id", "mode-controls");
    			add_location(div2, file, 27, 8, 536);
    			attr_dev(div3, "id", "menu");
    			add_location(div3, file, 18, 4, 329);
    			attr_dev(div4, "id", "container");
    			add_location(div4, file, 34, 4, 730);
    			attr_dev(a, "href", "https://github.com/2h-5/rgb-colour-guessing");
    			attr_dev(a, "id", "creator-link");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file, 40, 12, 903);
    			attr_dev(div5, "class", "nav-logo-down");
    			add_location(div5, file, 39, 8, 863);
    			attr_dev(div6, "class", "nav-links-down");
    			add_location(div6, file, 43, 8, 1046);
    			attr_dev(nav, "class", "navbar-down");
    			add_location(nav, file, 38, 4, 829);
    			attr_dev(script, "type", "text/javascript");
    			if (!src_url_equal(script.src, script_src_value = "main.js")) attr_dev(script, "src", script_src_value);
    			add_location(script, file, 47, 4, 1106);
    			add_location(body, file, 10, 0, 191);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, head, anchor);
    			append_dev(head, title);
    			append_dev(head, t1);
    			append_dev(head, link);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, body, anchor);
    			append_dev(body, h1);
    			append_dev(h1, t3);
    			append_dev(h1, span);
    			append_dev(h1, t5);
    			append_dev(body, t6);
    			append_dev(body, div3);
    			append_dev(div3, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t8);
    			append_dev(div0, button1);
    			append_dev(div3, t10);
    			append_dev(div3, div1);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			append_dev(div2, button2);
    			append_dev(div2, t13);
    			append_dev(div2, button3);
    			append_dev(body, t15);
    			append_dev(body, div4);
    			append_dev(body, t16);
    			append_dev(body, nav);
    			append_dev(nav, div5);
    			append_dev(div5, a);
    			append_dev(nav, t18);
    			append_dev(nav, div6);
    			append_dev(body, t19);
    			append_dev(body, script);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(head);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(body);
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

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    new App({
      target: document.getElementById('app')
      // hydrate: true
    });

    var numCircles = 6;
    var currentMode = "easy";
    var colours = [];
    var pickedColor;
    var defaultColour = "#75567a";
    // Software
    var gameOver = false;


    var container = document.getElementById("container");

    var colourToGuess =
        document.getElementById("colour-to-guess");

    var resultMessage =
        document.getElementById("result-message");

    var banner =
        document.querySelector("h1");

    var resetButton =
        document.getElementById("restart");

    var hintButton = // 🆉. Sun
        document.getElementById("hint");

    var modeButtons =
        document.querySelectorAll(".mode");


    // This will contain the current circles.
    var circles;

    init();


    function init() {
        // Engineering
        reset();
    }

    function reset() {

        // The new round is active again.
        gameOver = false;

        // Make the circles clickable again.
        container.classList.remove("game-over");


        // Set the number of circles based on the mode.
        if (currentMode === "easy") {

            numCircles = 6;

        } else {
            // github.com/2h-5
            numCircles = 10;
        }


        // Generate new random colours.
        colours = genRandomColours(numCircles);


        // Pick one of those colours as the answer.
        pickedColor = chooseColor();


        // Display the RGB value.
        colourToGuess.textContent = pickedColor;


        // Remove all existing circles.
        container.innerHTML = ""; // 🆉. Sūn


        // Remove Hard-mode styling.
        container.classList.remove("hard-mode");


        // Add Hard-mode styling when necessary.
        if (currentMode === "hard") {
            // 🆉. Sūn
            container.classList.add("hard-mode");
        }


        // Create the required number of circles.
        for (var i = 0; i < numCircles; i++) {

            var circle =
                document.createElement("div");

            circle.classList.add("circle");

            circle.style.backgroundColor =
                colours[i]; // github.com/2h-5

            circle.addEventListener(
                "click",
                clickCircle
            );

            container.appendChild(circle);
        }


        // Get the newly-created circles.
        circles =
            document.querySelectorAll(".circle");


        // Reset banner.
        banner.style.backgroundColor =
            defaultColour;


        // Reset controls.
        resetButton.textContent = "Restart";
        // SE
        resultMessage.textContent = "";
    }

    function clickCircle() {

        // If the correct answer has already been selected, do nothing.
        if (gameOver) {
            // 🆉. Sūn
            return;
        }


        var onClicked =
            this.style.backgroundColor;

        if (onClicked === pickedColor) {

            // The round is now complete.
            gameOver = true;

            // Disable clicking on all circles.
            container.classList.add("game-over"); // 🆉.

            // Display the check image only on the correctly selected circle.
            this.classList.add("correct");

            resultMessage.textContent =
                "You got it!";

            resetButton.textContent =
                "Play again";

            // Change every circle to the correct colour.
            for (var i = 0; i < circles.length; i++) {

                circles[i].style.backgroundColor =
                    pickedColor; // Scripting
            }


            // Change banner to correct colour.
            banner.style.backgroundColor =
                pickedColor;
        }

        else {

            this.style.backgroundColor =
                "#f81b31"; // Sun

            // Display the cross image on this incorrect circle.
            this.classList.add("wrong");

            resultMessage.textContent =
                "Try one more time...";
        }
    }

    resetButton.addEventListener(
        "click",
        function() {

            reset();
        }
    );

    hintButton.addEventListener(
        "click",
        function() { // Sūn

            alert("Hi, welcome to my \"RGB Colour Guessing\" game. \n(Yes, this time it's a game indeed! And of course, it's fun to play with.) \n\nI would assume you can figure out how to play it for sure: \nGiven a random colour → Pick the correct one! \n(As I am not a \"harsh\" person, if you pick a wrong one, you can keep picking until you get the correct one!) \n\n\"Wait! So how to read the vector shown on the top? I don't get it!\"\nAh, I see! Let me break it down: \n\n- The vector on the top is called \"RGB colour space\", each number represents how much does the associated colour contains. \n\nExamples: \n1. If \"rgb(high, low, low)\", it means the correct colour looks like red. \n2. If \"rgb(high, high, low)\", it means the correct colour looks like \"red + green\", which is closer to olive-yellow. \n3. If \"rgb(low, high, high)\", it means the correct colour looks like \"green + blue\", which is closer to cyan. \n\n(Now, since this is just a light \"Hint\", not a solution manual, I think this is enough for you to understand the patterns, and try to figure out different scenarios yourself since you are all smart people, don't you?)");
        }
    );

    for (var i = 0; i < modeButtons.length; i++) {

        modeButtons[i].addEventListener(
            "click",
            function() { // Software Engineering

                // Don't restart if the player clicks the mode already selected.
                if (this.classList.contains("selected")) {

                    return;
                }


                // Get the selected mode.
                currentMode =
                    this.getAttribute("data-mode");


                // Remove selected styling from both buttons.
                for (
                    var j = 0;
                    j < modeButtons.length;
                    j++ // 2h-5
                ) {

                    modeButtons[j]
                        .classList
                        .remove("selected");
                }


                // Highlight the selected button.
                this.classList.add("selected"); // Z.


                // Start a fresh game.
                reset();
            }
        );
    }


    function makeColour() {

        var a =
            Math.floor(Math.random() * 256);

        var b = // 🆉. Sūn
            Math.floor(Math.random() * 256);

        var c =
            Math.floor(Math.random() * 256);


        return "rgb(" +
            a + ", " +
            b + ", " +
            c +
            ")"; // 🆉. Sūn
    }


    function genRandomColours(num) {

        var array = [];


        for (var i = 0; i < num; i++) {

            array.push(makeColour());
        } 
        // 🆉.

        return array;
    }


    function chooseColor() {

        var random =
            Math.floor(
                Math.random() * colours.length
            );


        return colours[random]; // github.com/2h-5
    }

})();
//# sourceMappingURL=bundle.js.map
