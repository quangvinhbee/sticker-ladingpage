'use strict';

/* ––– FONT AXES ––– */

const FONT_AXES = {
	"GT Maru": {
		"wght": {
			min: 200,
			max: 900,
		},
		"slnt": {
			min: 0,
			max: 7,
		},
		"fontSize": {
			min: 16,
			max: 300,
		},
		"letterSpacing": {
			min: 0.005,
			max: -0.085,
		},
	},
	"GT Maru Mono": {
		"wght": {
			min: 200,
			max: 900,
		},
		"slnt": {
			min: 0,
			max: 7,
		},
		"fontSize": {
			min: 16,
			max: 300,
		},
	},
	"GT Maru Mega": {
		"opsz": {
			min: 25,
			max: 175,
		},
		"fontSize": {
			min: 25,
			max: 500,
		}
	},
};

const WGHT_PRESETS = {
	'light': 200,
	'regular': 360,
	'medium': 550,
	'bold': 700,
	'black': 900,
};

const OPSZ_PRESETS = {
	'mini': 25,
	'midi': 100,
	'maxi': 175,
};

function getMegaFlag(features) {
	if(features['outline'] && features['shaded'] && features['glow']) {
		return 'ss08';
	} else if(features['outline'] && features['glow']) {
		return 'ss07';
	} else if(features['outline'] && features['shaded']) {
		return 'ss05';
	} else if(features['glow']) {
		return 'ss06';
	} else if(features['outline']) {
		return 'ss04';
	}
	return null;
}

function requestMegaFeature(state, feature, enabled) {
	if(feature == 'shaded' && enabled) {
		state['outline'] = true;
	} else if(feature == 'outline' && !enabled) {
		state['shaded'] = false;
	}

	state[feature] = enabled;
}

function wghtLabel(wght) {
	if(wght < 360) {
		return 'Light';
	} else if(wght < 550) {
		return 'Regular';
	} else if(wght < 700) {
		return 'Medium'
	} else if(wght < 900) {
		return 'Bold';
	} else {
		return 'Black';
	}
}

function opszLabel(opsz) {
	if(opsz < 100) {
		return 'Mini';
	} else if(opsz < 175) {
		return 'Midi';
	} else {
		return 'Maxi';
	}
}

const IS_TOUCH_DEVICE = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
const IS_CHROME = navigator.userAgent.indexOf('Chrome') != -1;
const IS_MAC = navigator.userAgent.indexOf('Macintosh') != -1;
let CHROME_VERSION = undefined;
if(IS_CHROME) {
	const reg = /Chrome\/(\d+)\./i;
	const match = navigator.userAgent.match(reg);
	if(match && match.length == 2) CHROME_VERSION = Number(match[1]);
}

const onloadFunctions = [];
const onRevealFunctions = [];

let window_blurring = false;
let lastIntroFrame = 0;

function setupWindowFocusListeners() {
	window.addEventListener('blur', function(e) {
		window_blurring = true;
		setTimeout(function() {
			window_blurring = false;
		}, 1);

		lastIntroFrame = introPlayer.getLottie().currentFrame;
		introPlayer.pause();
	});

	window.addEventListener('focus', function(e) {
		setTimeout(function() {
			introPlayer.seek(lastIntroFrame);
			introPlayer.play();
		}, 25);
	});
}

onloadFunctions.push(setupWindowFocusListeners);

/* ––– DISABLE OFFSCREEN ANIMATIONS ––– */

const ANIM_PAUSE_CLASS = 'js-animation-paused';
const ANIM_PAUSABLE_SELECTOR = 'body > section';
const LOTTIE_PAUSABLE_SELECTOR = 'lottie-player';

{
	function handleLottieVisibility(entries, observer) {
		for(const entry of entries) {
			if(entry.isIntersecting) entry.target.play();
			else entry.target.pause();
		}
	}

	function handleAnimVisibility(entries, observer) {
		for(const entry of entries) {
			if(entry.isIntersecting) entry.target.classList.remove(ANIM_PAUSE_CLASS);
			else entry.target.classList.add(ANIM_PAUSE_CLASS);
		}
	}

	try {
		const videoObserver = new IntersectionObserver(handleLottieVisibility, {rootMargin: '10px', threshold: 0});
		document.querySelectorAll(LOTTIE_PAUSABLE_SELECTOR).forEach(el => videoObserver.observe(el));

		const animObserver = new IntersectionObserver(handleAnimVisibility, {rootMargin: '10px', threshold: 0});
		document.querySelectorAll(ANIM_PAUSABLE_SELECTOR).forEach(el => animObserver.observe(el));
	} catch(e) {
		console.warn('IntersectionObserver not available, using scroll listener.');

		function onAnimVisible(el) {
			el.classList.remove(ANIM_PAUSE_CLASS);
		}
		function onAnimInvisible(el) {
			el.classList.add(ANIM_PAUSE_CLASS);
		}
		document.querySelectorAll(ANIM_PAUSABLE_SELECTOR).forEach(el => intersectionObserverPolyfill(el, onAnimVisible, onAnimInvisible));

		function onLottieVisible(el) {
			el.play();
		}
		function onLottieInvisible(el) {
			el.pause();
		}
		document.querySelectorAll(LOTTIE_PAUSABLE_SELECTOR).forEach(el => intersectionObserverPolyfill(el, onLottieVisible, onLottieInvisible));
	}
}

/* ––– TYPE TESTER ––– */

{
	const TYPETESTER_ACTIVE_CLASS = 'js-typetester-container-active';
	const STYLEEDITOR_ACTIVE_CLASS = 'js-typetester-settings-active';
	const STYLEPICKER_ACTIVE_CLASS = 'js-typetester-stylepicker-active';

	let allowSampleHoverOverride = true;

	const typeTester = document.querySelector('.typetester-container');
	const styleEditor = document.querySelector('.typetester-settings-area');
	const stylepickerTab = document.querySelector('.typetester-stylepicker-tab');
	const buttonClose = document.querySelector('.typetester-button-close');
	stylepickerTab.addEventListener('click', (ev) => {
		if(styleEditor.classList.contains(STYLEPICKER_ACTIVE_CLASS)) {
			styleEditor.classList.remove(STYLEPICKER_ACTIVE_CLASS);
		} else {
			styleEditor.classList.add(STYLEPICKER_ACTIVE_CLASS);
		}
		allowSampleHoverOverride = false;
	});

	stylepickerTab.addEventListener('transitionend', function() {
		allowSampleHoverOverride = true;
	});

	function typeTesterOpen() {
		typeTester.classList.add(TYPETESTER_ACTIVE_CLASS);
		buttonClose.classList.add(TYPETESTER_ACTIVE_CLASS);
		setBodyScroll(false);
	}

	function typeTesterClose() {
		typeTester.classList.remove(TYPETESTER_ACTIVE_CLASS);
		buttonClose.classList.remove(TYPETESTER_ACTIVE_CLASS);
		setBodyScroll(true);
		if(activeElement) activeElement.blur();
	}

	document.querySelectorAll('.typetester-button-open').forEach(el => el.addEventListener('click', typeTesterOpen));
	buttonClose.addEventListener('click', typeTesterClose);

	styleEditor.addEventListener('mousedown', (e) => { e.preventDefault(); }); // prevent focused contenteditable from blurring

	const inputs_family = Array.from(styleEditor.querySelectorAll('input[name=family]'));
	const inputs_axes = Array.from(styleEditor.querySelectorAll('[data-axis]'));
	const inputs_features = Array.from(styleEditor.querySelectorAll('input[name=features]'));
	const axes_main = Array.from(styleEditor.querySelectorAll('.typetester-axes-main'));
	const axes_mega = Array.from(styleEditor.querySelectorAll('.typetester-axes-mega'));

	let activeElement = null;
	let previewOverride = null;

	window.addEventListener('keydown', function(ev) {
		if(activeElement && ev.key == 'Escape') {
			activeElement.blur();
		}
	});

	function styleEditorToggle(el) {
		activeElement = el;
		if(!activeElement) {
			styleEditor.classList.remove(STYLEEDITOR_ACTIVE_CLASS);
			return;
		}

		styleEditor.classList.add(STYLEEDITOR_ACTIVE_CLASS);
		apply();
	}

	function applyLetterspacing(el, overrideSettings) {
		const settings = typeof overrideSettings == 'object' ? overrideSettings : el._typedata;
		if(!FONT_AXES[settings.fontFamily].letterSpacing) {
			el.style.letterSpacing = '0';
			return;
		}
		const style = window.getComputedStyle(el);
		const pxSize = parseInt(style.fontSize);
		const pxScale = map(pxSize, FONT_AXES[settings.fontFamily].fontSize.min, FONT_AXES[settings.fontFamily].fontSize.max, 0, 1);
		const spacing = map(pxScale, 0, 1, FONT_AXES[settings.fontFamily].letterSpacing.min, FONT_AXES[settings.fontFamily].letterSpacing.max);
		el.style.letterSpacing = `${spacing}em`;
	}

	window.addEventListener('resize', function() {
		document.querySelectorAll('.typetester-container *[contenteditable=true]').forEach(applyLetterspacing);
	});

	function apply(override) {
		if(!activeElement) return;
		const settings = Object.assign({}, activeElement._typedata);
		if(override) Object.assign(settings, override);

		for(const range of inputs_axes) {
			range.querySelector('.typetester-range-slider').style.left = `${settings[range.dataset.axis] * 100}%`;
		}
		for(const radio of inputs_family) {
			if(settings.fontFamily == radio.value) {
				radio.checked = true;
				break;
			}
		}

		activeElement.style.fontFamily = `"${settings.fontFamily}", "GT Maru Emoji"`;
		activeElement.parentElement.querySelector('.typetester-meta-subfamily').innerHTML = settings.fontFamily;

		const size = map(settings.fontSize, 0, 1, FONT_AXES[settings.fontFamily].fontSize.min, FONT_AXES[settings.fontFamily].fontSize.max);
		activeElement.style.fontSize = `${size}px`;
		activeElement.parentElement.querySelector('.typetester-meta-size').innerHTML = `${Math.round(size)}px`;

		applyLetterspacing(activeElement, settings);

		const flag = getMegaFlag(settings.features);
		if(flag) activeElement.style.fontFeatureSettings = `"kern" 1, "${flag}" 1`;
		else activeElement.style.fontFeatureSettings = `"kern" 1`;

		inputs_features.forEach((el) => {
			el.checked = !!settings.features[el.value];
		});

		switch(settings.fontFamily) {
			case 'GT Maru':
			case 'GT Maru Mono':
				axes_main.forEach((el) => { el.style.display = ''; });
				axes_mega.forEach((el) => { el.style.display = 'none'; });
				activeElement.style.fontVariationSettings = `"wght" ${map(settings.wght, 0, 1, FONT_AXES[settings.fontFamily].wght.min, FONT_AXES[settings.fontFamily].wght.max)}, "slnt" ${map(settings.slnt, 0, 1, FONT_AXES[settings.fontFamily].slnt.min, FONT_AXES[settings.fontFamily].slnt.max)}`;
				activeElement.parentElement.querySelector('.typetester-meta-style').innerHTML = wghtLabel(map(settings.wght, 0, 1, FONT_AXES[settings.fontFamily].wght.min, FONT_AXES[settings.fontFamily].wght.max));
				break;

			case 'GT Maru Mega':
				axes_mega.forEach((el) => { el.style.display = ''; });
				axes_main.forEach((el) => { el.style.display = 'none'; });
				activeElement.style.fontVariationSettings = `"opsz" ${map(settings.opsz, 0, 1, FONT_AXES[settings.fontFamily].opsz.min, FONT_AXES[settings.fontFamily].opsz.max)}`;
				activeElement.parentElement.querySelector('.typetester-meta-style').innerHTML = opszLabel(map(settings.opsz, 0, 1, FONT_AXES[settings.fontFamily].opsz.min, FONT_AXES[settings.fontFamily].opsz.max));
				break;
		}
	}

	const editableElements = document.querySelectorAll('.typetester-container *[contenteditable=true]');
	editableElements.forEach(el => {
		el._typedata = {
			fontFamily: el.dataset.fontFamily,
			fontSize: null, //el.dataset.fontSize ? map(Number(el.dataset.fontSize), FONT_AXES[el.dataset.fontFamily].fontSize.min, FONT_AXES[el.dataset.fontFamily].fontSize.max, 0, 1) : 0.5,
			wght: el.dataset.wght ? map(Number(el.dataset.wght), FONT_AXES[el.dataset.fontFamily].wght.min, FONT_AXES[el.dataset.fontFamily].wght.max, 0, 1) : 0,
			slnt: el.dataset.slnt ? map(Number(el.dataset.slnt), FONT_AXES[el.dataset.fontFamily].slnt.min, FONT_AXES[el.dataset.fontFamily].slnt.max, 0, 1) : 0,
			opsz: el.dataset.opsz ? map(Number(el.dataset.opsz), FONT_AXES[el.dataset.fontFamily].opsz.min, FONT_AXES[el.dataset.fontFamily].opsz.max, 0, 1) : 0,
			features: {},
		};

		applyLetterspacing(el);

		el.addEventListener('blur', function() {
			setTimeout(function() {
				// NOTE: Window blur fires first (when window loses focus), so we need to defer this check
				if(window_blurring) return;
				styleEditorToggle(null);
				// el.classList.remove(COPY_FOCUS_CLASS);
			}, 0);
		});

		el.addEventListener('focus', function() {
			// measure the font size on first set
			if(el._typedata.fontSize == null) {
				const sty = window.getComputedStyle(el);
				const pxSize = parseFloat(sty.fontSize);
				el._typedata.fontSize = map(pxSize, FONT_AXES[el.dataset.fontFamily].fontSize.min, FONT_AXES[el.dataset.fontFamily].fontSize.max, 0, 1);
			}

			setTimeout(function() {
				// NOTE: We need to wait for all of the above window blurring logic to clear the event stack
				styleEditorToggle(el);
				// el.classList.add(COPY_FOCUS_CLASS);
			}, 1);
		});
	});


	function recomputeAllSizes() {
		editableElements.forEach((el) => {
			const size = parseFloat(window.getComputedStyle(el).fontSize);
			el.parentElement.querySelector('.typetester-meta-size').innerHTML = `${Math.round(size)}px`;
		});
	}
	window.addEventListener('resize', recomputeAllSizes);
	onloadFunctions.push(recomputeAllSizes);

	inputs_family.forEach((el) => {
		el.addEventListener('change', (e) => {
			if(!activeElement) return;
			activeElement._typedata.fontFamily = e.target.value;
			apply();
			removePresetActiveClass();
		});
	});

	inputs_features.forEach((el) => {
		el.addEventListener('change', (e) => {
			if(!activeElement) return;
			requestMegaFeature(activeElement._typedata.features, e.target.value, e.target.checked);
			apply();
			removePresetActiveClass();
		});
	});

	inputs_axes.forEach((range) => {
		const handleMouseDown = (e) => {
			const rangeRect = range.getBoundingClientRect();
			let cx = e.clientX;
			if(e.touches && e.touches.length) cx = e.touches[0].pageX;
			const diff = cx - rangeRect.x;
			activeElement._typedata[range.dataset.axis] = Math.min(1, Math.max(0, diff / rangeRect.width));
			apply();
			removePresetActiveClass();

			document.body.style.userSelect = 'none';

			const handleMove = (e) => {
				let cx = e.clientX;
				if(e.touches && e.touches.length) cx = e.touches[0].pageX;
				const diff = cx - rangeRect.x;
				activeElement._typedata[range.dataset.axis] = Math.min(1, Math.max(0, diff / rangeRect.width));
				apply();
			};
			window.addEventListener('mousemove', handleMove);
			window.addEventListener('touchmove', handleMove);

			const handleMouseUp = (e) => {
				document.body.style.userSelect = '';
				window.removeEventListener('mousemove', handleMove);
				window.removeEventListener('touchmove', handleMove);
				window.removeEventListener('mouseup', handleMouseUp);
				window.removeEventListener('touchend', handleMouseUp);
			};
			window.addEventListener('mouseup', handleMouseUp);
			window.addEventListener('touchend', handleMouseUp);
		};
		range.addEventListener('mousedown', handleMouseDown);
		range.addEventListener('touchstart', handleMouseDown);
	});

	// Presets
	function applyOverride(override) {
		if(!activeElement) return;
		Object.assign(activeElement._typedata, override);
	}

	const PRESET_HOVERED_CLASS = 'typetester-style-hovered';
	const PRESET_ACTIVE_CLASS = 'typetester-style-active';

	const presetList = styleEditor.querySelector('.typetester-stylepicker-subfamily-list');

	function removePresetActiveClass() {
		presetList.querySelectorAll('.typetester-style-active').forEach((el) => {
			el.classList.remove(PRESET_ACTIVE_CLASS);
		});
	}

	for(const fam of ['maru', 'maru-mono']) {
		const family = fam == 'maru-mono' ? 'GT Maru Mono' : 'GT Maru';
		for(const name in WGHT_PRESETS) {
			const override = {
				fontFamily: family,
				wght: map(WGHT_PRESETS[name], FONT_AXES[family].wght.min, FONT_AXES[family].wght.max, 0, 1),
				slnt: 0,
			};
			const el = presetList.querySelector(`.typetester-style-${fam}-${name} span`);
			el.addEventListener('mouseenter', () => { if(!allowSampleHoverOverride) return; apply(override); el.classList.add(PRESET_HOVERED_CLASS); });
			el.addEventListener('mouseleave', () => { apply(); el.classList.remove(PRESET_HOVERED_CLASS); });
			el.addEventListener('click', () => { removePresetActiveClass(); applyOverride(override); apply(); el.classList.add(PRESET_ACTIVE_CLASS); });

			const override_oblique = {
				fontFamily: family,
				wght: map(WGHT_PRESETS[name], FONT_AXES[family].wght.min, FONT_AXES[family].wght.max, 0, 1),
				slnt: 1,
			};
			const elOblique = presetList.querySelector(`.typetester-style-${fam}-${name} span.typetester-style-oblique`);
			elOblique.addEventListener('mouseenter', () => { if(!allowSampleHoverOverride) return; apply(override_oblique); el.classList.add(PRESET_HOVERED_CLASS); elOblique.classList.add(PRESET_HOVERED_CLASS); });
			elOblique.addEventListener('mouseleave', () => { apply(); el.classList.remove(PRESET_HOVERED_CLASS); elOblique.classList.remove(PRESET_HOVERED_CLASS); });
			elOblique.addEventListener('click', () => { removePresetActiveClass(); applyOverride(override_oblique); apply(); el.classList.add(PRESET_ACTIVE_CLASS); elOblique.classList.add(PRESET_ACTIVE_CLASS); });
		}
	}

	for(const name in OPSZ_PRESETS) {
		const family = 'GT Maru Mega';
		const override = {
			fontFamily: family,
			opsz: map(OPSZ_PRESETS[name], FONT_AXES[family].opsz.min, FONT_AXES[family].opsz.max, 0, 1),
		};
		const el = presetList.querySelector(`.typetester-style-maru-mega-${name}`);
		el.addEventListener('mouseenter', () => { if(!allowSampleHoverOverride) return; apply(override); el.classList.add(PRESET_HOVERED_CLASS); });
		el.addEventListener('mouseleave', () => { apply(); el.classList.remove(PRESET_HOVERED_CLASS); });
		el.addEventListener('click', () => { removePresetActiveClass(); applyOverride(override); apply(); el.classList.add(PRESET_ACTIVE_CLASS); });
	}
}

/* ––– INTRO ––– */
const SCROLL_INDICATOR_HIDE_CLASS = 'js-scroll-indicator-hidden';

let LOADER_DONE = false;
const scrollIndicator = document.querySelector('.loaded-scroll-indicator');
const introPlayer = document.querySelector('lottie-player#intro_sequence');

{
	window.scrollTo(0,0);
	history.scrollRestoration = 'manual';
	window.addEventListener('beforeunload', function() {
		window.scrollTo(0,0);
	});

	// CLOUDS
	const intro = document.getElementById('intro-container');

	const CLOUDS_SETS = 3;
	const CLOUD_GRAPHICS = 10;
	const AVAILABLE_VH_PLACEMENT = 600;

	const H_BASE_DURATION = 30;
	const H_RANDOMNESS = 10;
	const H_DEPTH_COEFFICIENT = 10;
	const V_PARALLAX_COEFFICIENT = 0.015;
	const V_PARALLAX_DEPTH_FACTOR = 6;

	for(let copies = 0; copies < CLOUDS_SETS; copies++) {
		for(let i = 1; i <= CLOUD_GRAPHICS; i++) {
			const cont = document.createElement('div');
			cont.classList.add('cloud-container');
			cont.style.top = `calc(${Math.random() * AVAILABLE_VH_PLACEMENT}vh)`;
			cont._depth = i;
			cont.style.zIndex = 10 - Math.round(CLOUD_GRAPHICS / 2) + cont._depth;

			const el = document.createElement('img');
			el.classList.add('cloud');
			el.setAttribute('src', `/images/clouds/cloud-${i}.svg`);
			const dur = H_BASE_DURATION + (Math.random() - 0.5) * H_RANDOMNESS + (CLOUD_GRAPHICS - cont._depth - 1) * H_DEPTH_COEFFICIENT;
			el.style.animationDuration = `${dur}s`;
			el.style.animationDelay = `${(Math.random() - 0.5) * dur}s`;

			el.addEventListener('animationiteration', function() {
				cont.style.top = `calc(${Math.random() * AVAILABLE_VH_PLACEMENT}vh)`;
			});

			cont.appendChild(el);
			intro.appendChild(cont);
		}
	}

	const cloudContainers = document.querySelectorAll('.cloud-container');
	function cloudParallax(t) {
		cloudContainers.forEach((el) => {
			el.style.transform = `translateY(${window.scrollY * -1 * V_PARALLAX_COEFFICIENT * (el._depth - 1) * V_PARALLAX_DEPTH_FACTOR}px)`;
		});
		window.requestAnimationFrame(cloudParallax);
	}
	window.requestAnimationFrame(cloudParallax);



	const INTRO_SEQUENCES = [
		{title: "sleep", in: 0, out: 63},
		{title: "wake up", in: 64, out: 146},
		{title: "awake", in: 147, out: 196},
		{title: "talking", in: 197, out: 242},
		{title: "clock", in: 243, out: 395},
		{title: "finale", in: 396, out: 468},
	];

	const introTitle = document.querySelector('#intro-title');

	let hasAwaken = false;
	let desiredLoop = 2;
	let direction = 1;
	let curSequence = 0;

	// handles looping the final sequence (library has a bug that restarts animation even after seek)
	function deferSeek(frame) {
		setTimeout(function() {
			introPlayer.pause();
			introPlayer.seek(frame);
			introPlayer.play();
		}, 15);
	}

	introPlayer.addEventListener('frame', function(ev) {
		if(!hasAwaken && LOADER_DONE && ev.detail.frame >= INTRO_SEQUENCES[2].in) {
			removeLoader();
			hasAwaken = true;
		}

		for(const i in INTRO_SEQUENCES) {
			if(ev.detail.frame >= INTRO_SEQUENCES[i].in && ev.detail.frame < INTRO_SEQUENCES[i].out + 1) {
				curSequence = i;
				break;
			}
		}

		if(curSequence > desiredLoop && direction == 1) {
			introPlayer.setDirection(-1); direction = -1;
		} else if(curSequence < desiredLoop && direction == -1) {
			introPlayer.setDirection(1); direction = 1;
		} else if(
			(direction == 1 && ev.detail.frame >= INTRO_SEQUENCES[desiredLoop].out)
			|| (direction == -1 && ev.detail.frame <= INTRO_SEQUENCES[desiredLoop].in)
		) {
			// loop
			introPlayer.setDirection(1); direction = 1;
			deferSeek(INTRO_SEQUENCES[desiredLoop].in);
		}
	});

	introPlayer.addEventListener('load', function(ev) {
		introPlayer.play();
	});

	const TEXTBOX_TRANSITION_CLASS = 'textbox-intro-hidden';
	const INTRO_VISIBLE_FULL_CLASS = 'js-intro-container-full';

	const introWrapper = document.querySelector('#intro-wrapper');
	const introTextbox = introWrapper.querySelector('.textbox');
	const introText1 = document.querySelector('#intro-text-1');
	const introText2 = document.querySelector('#intro-text-2');
	const introText1Parts = introText1.innerHTML.split(' ');
	let introText1Revealed = false;
	let introText1Timeout;
	let introText1Index = 0;
	introText1.innerHTML = '';

	let prevSection = 0;

	function applyIntroText1() {
		introText1.innerHTML += introText1Parts[introText1Index] + ' ';
		introText1Index += 1;
		if(introText1Index == introText1Parts.length) return;
		introText1Timeout = setTimeout(applyIntroText1, 100);
	}

	let introTextTimeout = null;
	function switchToIntroText(index) {
		introTextbox.classList.add(TEXTBOX_TRANSITION_CLASS);
		introTextTimeout = setTimeout(function() {
			if(index == 1) {
				introText1.style.display = 'initial';
				introText2.style.display = 'none';
			} else if(index == 2) {
				introText1.style.display = 'none';
				introText2.style.display = 'initial';
			}
			introTextbox.classList.remove(TEXTBOX_TRANSITION_CLASS);
		}, 800);
	}

	const SECTION_LOOP_SEQUENCE = [ 2, 3, 5 ];

	window.addEventListener('scroll', function(ev) {
		// TITLE VISIBLE
		const titleRect = introTitle.getBoundingClientRect();
		if(titleRect.bottom <= 0) {
			intro.classList.add(INTRO_VISIBLE_FULL_CLASS);
		} else {
			intro.classList.remove(INTRO_VISIBLE_FULL_CLASS);
		}

		// VISIBLE CHECKPOINT
		const rect = introWrapper.getBoundingClientRect();
		const section = rect.top > 0 ? 0 : Math.max(0, Math.min(2, Math.round(Math.abs(rect.top) / rect.height * 3)));
		desiredLoop = SECTION_LOOP_SEQUENCE[section];

		if(section > 0) {
			scrollIndicator.classList.add(SCROLL_INDICATOR_HIDE_CLASS);
		}

		if(section == 0) {
			introTextbox.classList.add(TEXTBOX_TRANSITION_CLASS);
			if(introTextTimeout) {
				clearTimeout(introTextTimeout);
				introTextTimeout = null;
			}
		}

		if(section == 1 && prevSection != section) {
			switchToIntroText(1);
			if(!introText1Revealed) {
				introText1Revealed = true;
				introText1Timeout = setTimeout(applyIntroText1, 100);
			}
		}

		if(section == 2 && prevSection != section) {
			switchToIntroText(2);
		}

		prevSection = section;


	});



}

/* ––– NAV BAR ––– */

const progressBar = document.querySelector('#progress-bar');

const sections = ['intro', 'story', 'design', 'typeface', 'monospaced', 'mega', 'emoji', 'overview'].map(el => document.getElementById(el));

function setProgressBarIndex(waypoint) {
	if(waypoint == sections.length - 1) {
		progressBar.style.width = '100%';
	} else {
		progressBar.style.width = `calc(${waypoint / (sections.length - 1) * 100}% - 3px - ${13 * (1 - (waypoint / (sections.length - 1)))}px)`;
	}
	progressBar.style.backgroundColor = sections[waypoint].dataset.navColor;
}

{
	function handleScroll(ev) {
		let waypoint = 0;
		for(const i in sections) {
			const rect = sections[i].getBoundingClientRect();
			if(rect.top - window.innerHeight/2 <= 0) {
				waypoint = i;
			} else {
				break;
			}
		}
		setProgressBarIndex(waypoint);
	}

	window.addEventListener('scroll', handleScroll);
}

/* ––– SCROLL-BASED ILLUSTRATION INTROS ––– */

{
	const INTRO_CLASS = 'js-scroll-anim-intro-waiting';
	const THRESHOLD = 0.75;

	function handleElementVisibility(entries, observer) {
		for(const entry of entries) {
			if(entry.isIntersecting) entry.target.classList.remove(INTRO_CLASS);
		}
	}

	try {
		const elementObserver = new IntersectionObserver(handleElementVisibility, {rootMargin: '0px', threshold: THRESHOLD});
		document.querySelectorAll(`.${INTRO_CLASS}`).forEach(el => elementObserver.observe(el));
	} catch(e) {
		console.warn('IntersectionObserver not available, using scroll listener.');

		function onIllustrationVisible(el) {
			el.classList.remove(INTRO_CLASS);
		}
		function onIllustrationInvisible(el) {}
		document.querySelectorAll(`.${INTRO_CLASS}`).forEach(el => intersectionObserverPolyfill(el, onIllustrationVisible, onIllustrationInvisible, function(rect) {
			return window.innerHeight - rect.bottom < -(1 - THRESHOLD) * rect.height;
		}));
	}
}

/* ––– ALPHABET ––– */

document.querySelectorAll('.illustration-grid-item').forEach(el => el.addEventListener('mouseenter', (ev) => { alphabetSelect(el.dataset.letter); }));
let alphabetTransitioning = -1;
let alphabetVisibleChar = 'h';
let alphabetRequestedChar = 'h';

const alphabetLargeImg = document.querySelector('#alphabet-large');
const alphabetGridItems = document.querySelectorAll('.illustration-grid-item');

function alphabetSelect(char) {
	const c = char[0].toLowerCase();
	alphabetRequestedChar = c;
	if(alphabetVisibleChar == c) return;
	if(alphabetTransitioning > -1) return;

	const transitionHandler = function(event) {
		if(alphabetTransitioning == 0) {
			alphabetLargeImg.setAttribute('src', `/images/words-and-letters/${alphabetRequestedChar}-large.svg`);
			alphabetLargeImg.classList.remove('js-alphabet-offscreen');
			alphabetTransitioning = 1;
			alphabetVisibleChar = alphabetRequestedChar;
			alphabetGridItems.forEach(el => el.classList.remove('illustration-grid-item-active'));
			document.querySelector(`.illustration-grid-item[data-letter="${alphabetVisibleChar}"]`).classList.add('illustration-grid-item-active');
		} else {
			alphabetLargeImg.removeEventListener('transitionend', transitionHandler);
			alphabetTransitioning = -1;
			alphabetSelect(alphabetRequestedChar);
		}
	};

	alphabetTransitioning = 0;
	alphabetLargeImg.classList.add('js-alphabet-offscreen');
	alphabetLargeImg.addEventListener('transitionend', transitionHandler);
}

/* ––– INLINE TYPE TESTERS ––– */

function initInlineTypeTesters() {
	document.querySelectorAll('.typetester-inline-container').forEach((container) => {
		const sample = container.querySelector('.typetester-inline-sample');
		const family = window.getComputedStyle(sample)['font-family'].replace(/['"]/gi, '');
		const sliderDots = {};
		const axes = {};
		const features = {};
		for(const key in FONT_AXES[family]) {
			axes[key] = 0;
		}

		const apply = function() {
			switch(family) {
				case 'GT Maru':
				case 'GT Maru Mono':
					sample.style.fontVariationSettings = `"wght" ${map(axes.wght, 0, 1, FONT_AXES[family].wght.min, FONT_AXES[family].wght.max)}, "slnt" ${map(axes.slnt, 0, 1, FONT_AXES[family].slnt.min, FONT_AXES[family].slnt.max)}`;
					break;

				case 'GT Maru Mega':
					sample.style.fontVariationSettings = `"opsz" ${map(axes.opsz, 0, 1, FONT_AXES[family].opsz.min, FONT_AXES[family].opsz.max)}`;
					break;
			}

			for(const key in sliderDots) {
				sliderDots[key].style.left = `${axes[key] * 100}%`;
			}

			if(container.dataset.features == 'mega') {
				container.querySelectorAll(`.typetester-checkbox-input input[type="checkbox"]`).forEach((el) => {
					el.checked = !!features[el.value];
				});

				const flag = getMegaFlag(features);
				if(flag) sample.style.fontFeatureSettings = `"kern" 1, "${flag}" 1`;
				else sample.style.fontFeatureSettings = `"kern" 1`;
			}
		};

		container.querySelectorAll('.typetester-range-input').forEach((range) => {
			const sliderDot = range.querySelector('.typetester-range-slider');
			sliderDots[range.dataset.axis] = sliderDot;
			if(!isNaN(Number(range.dataset.initialValue))) {
				axes[range.dataset.axis] = map(Number(range.dataset.initialValue), FONT_AXES[family][range.dataset.axis].min, FONT_AXES[family][range.dataset.axis].max, 0, 1);
			}

			const handleMouseDown = (e) => {
				const rangeRect = range.getBoundingClientRect();
				let cx = e.clientX;
				if(e.touches && e.touches.length) cx = e.touches[0].pageX;
				const diff = cx - rangeRect.x;
				axes[range.dataset.axis] = Math.min(1, Math.max(0, diff / rangeRect.width));
				apply();

				document.body.style.userSelect = 'none';

				const handleMove = (e) => {
					let cx = e.clientX;
					if(e.touches && e.touches.length) cx = e.touches[0].pageX;
					const diff = cx - rangeRect.x;
					axes[range.dataset.axis] = Math.min(1, Math.max(0, diff / rangeRect.width));
					apply();
				};
				window.addEventListener('mousemove', handleMove);
				window.addEventListener('touchmove', handleMove);

				const handleMouseUp = (e) => {
					document.body.style.userSelect = '';
					window.removeEventListener('mousemove', handleMove);
					window.removeEventListener('touchmove', handleMove);
					window.removeEventListener('mouseup', handleMouseUp);
					window.removeEventListener('touchend', handleMouseUp);
				};
				window.addEventListener('mouseup', handleMouseUp);
				window.addEventListener('touchend', handleMouseUp);
			};
			range.addEventListener('mousedown', handleMouseDown);
			range.addEventListener('touchstart', handleMouseDown);
		});

		container.querySelectorAll('.typetester-checkbox-input').forEach((checkbox) => {
			const input = checkbox.querySelector('input[type="checkbox"]');
			input.addEventListener('change', (e) => {
				requestMegaFeature(features, e.target.value, e.target.checked);
				apply();
			});
		});

		apply();

		if(family == 'GT Maru') {
			const applyLetterSpacing = function() {
				const pxSize = parseFloat(window.getComputedStyle(sample).fontSize);
				const pxScale = map(pxSize, FONT_AXES[family].fontSize.min, FONT_AXES[family].fontSize.max, 0, 1);
				const spacing = map(pxScale, 0, 1, FONT_AXES[family].letterSpacing.min, FONT_AXES[family].letterSpacing.max);
				sample.style.letterSpacing = `${spacing}em`;
			};
			window.addEventListener('resize', applyLetterSpacing);
			onloadFunctions.push(applyLetterSpacing);
		}
	});
}

onloadFunctions.push(initInlineTypeTesters);

/* ––– CHARACTER SET ––– */

class GTCharacter {
	// NOTE: The element #gt-character-zoomed MUST NOT be in a "position: relative;" element. Its
	// coordinate space must be the entire page.
	constructor(container, zoomedCharacter) {
		this.settings = {
			characterSelectorClass: 'js-gt-character',
			characterHoverClass: 'hover',
			zoomedClass: 'zoomed',
			zoomedVisibleClass: 'is-visible',
			offsetX: 25,
			offsetY: 25,
		};

		this.container = container;
		this.zoomedCharacter = zoomedCharacter;

		this.touchmoved = false;
		this.touchX = 0;
		this.touchY = 0;
	}

	init() {
		this.container.querySelectorAll(`.${this.settings.characterSelectorClass}`).forEach(el => {
			el.addEventListener('touchstart', (e) => { this.zoomedCharacter.innerHTML = e.target.innerHTML; });
			el.addEventListener('mouseenter', (e) => { this.zoomedCharacter.innerHTML = e.target.innerHTML; });
		});

		document.body.addEventListener('mousemove', (e) => {
			if(this.container.contains(e.target) && e.target.classList.contains(this.settings.characterSelectorClass)) {
				this.showZoomedCharacter(e, e.pageX, e.pageY);
			} else {
				this.zoomedCharacter.classList.remove(this.settings.zoomedVisibleClass);
			}
		});

		document.body.addEventListener('touchend', (event) => {
			if(this.touchmoved) return;
			this.container.querySelectorAll(`.${this.settings.characterSelectorClass}.${this.settings.characterHoverClass}`).forEach(el => { el.classList.remove(this.settings.characterHoverClass); });
			if(event.target.classList.contains(this.settings.characterSelectorClass)) {
				event.target.classList.add(this.settings.characterHoverClass);
				event.preventDefault();
				event.stopPropagation();
				this.showZoomedCharacter(event, this.touchX, this.touchY);
			} else {
				this.zoomedCharacter.classList.remove(this.settings.zoomedVisibleClass);
			}
		});
		document.body.addEventListener('touchmove', (event) => {
			this.touchmoved = true;
		});
		document.body.addEventListener('touchstart', (event) => {
			this.touchX = event.touches[0].pageX;
			this.touchY = event.touches[0].pageY;
			this.touchmoved = false;
		});
	}

	handleMouseEnter(e) {
		this.zoomedCharacter.innerHTML = e.target.innerHTML;
	}

	showZoomedCharacter(event, x, y) {
		this.zoomedCharacter.classList.add(this.settings.zoomedVisibleClass);

		// translate to window space pre-scroll
		var left = x - window.scrollX;
		var top = y - window.scrollY;

		// constrain within the window
		left = Math.max(this.settings.offsetX, Math.min(left, window.innerWidth - this.settings.offsetX - this.zoomedCharacter.offsetWidth));
		top = Math.max(this.settings.offsetY, Math.min(top, window.innerHeight - this.settings.offsetY - this.zoomedCharacter.offsetHeight));

		// translate back to scroll space
		left += window.scrollX;
		top += window.scrollY;

		this.zoomedCharacter.style.left = `${left}px`;
		this.zoomedCharacter.style.top = `${top}px`;
	}

}

onloadFunctions.push(function() {
	new GTCharacter(document.querySelector('.character-set-category-bw'), document.getElementById('gt-character-zoomed-bw')).init();
	new GTCharacter(document.querySelector('.character-set-category-color'), document.getElementById('gt-character-zoomed-color')).init();
	new GTCharacter(document.querySelector('.character-set-primary'), document.getElementById('gt-character-zoomed')).init();
});

/* ––– TYPEWRITER ––– */

{
	const ANIMATED_MACHINE_CLASS = 'typewriter-machine-animated';

	const container = document.querySelector('.typewriter-paper-container');
	const paper = container.querySelector('.typewriter-paper');
	const machine = container.querySelector('.typewriter-machine');
	const section = container.parentElement;

	function computePaperLayout() {
		container.style.height = `${paper.getBoundingClientRect().height + machine.getBoundingClientRect().height - 12}px`;
	}
	window.addEventListener('resize', computePaperLayout);
	onRevealFunctions.push(computePaperLayout);

	let timeout = null;
	function stopAnimation() {
		machine.classList.remove(ANIMATED_MACHINE_CLASS);
	}

	function handleScroll() {
		if(window.innerHeight - section.getBoundingClientRect().bottom >= 0) return;

		machine.classList.add(ANIMATED_MACHINE_CLASS);
		if(timeout) clearTimeout(timeout);
		timeout = setTimeout(stopAnimation, 350);
	}

	window.addEventListener('scroll', handleScroll);
}

/* ––– LOADER ––– */

const navItems = document.querySelectorAll('nav .nav-area .nav-item');

{
	const deps = [];

	window.addEventListener('load', onLoad);

	function onLoad() {
		document.querySelectorAll('lottie-player[data-src]').forEach((el) => {
			deps.push(new Promise(function(res, rej) {
				el.load(el.dataset.src);
				el.addEventListener('ready', function() {
					res();
				});
			}));
		});

		document.querySelectorAll('lottie-player[data-huge-src]').forEach((el) => {
			deps.push(fetch(el.dataset.hugeSrc)); // preload

			const obs = new IntersectionObserver(function(entries, observer) {
				for(const entry of entries) {
					if(entry.isIntersecting) {
						el.load(el.dataset.hugeSrc);
						observer.disconnect();
						return;
					}
				}
			}, {rootMargin: '10px', threshold: 0});
			obs.observe(document.querySelector(el.dataset.loadOnVisible));
		});

		for(const f of onloadFunctions) {
			f();
		}
	}

	navItems.forEach(function(el, i) {
		deps.push(new Promise(function(res, rej) {
			setTimeout(function() {
				el.classList.add('nav-item-active');
				setProgressBarIndex(i+1);
				res();
			}, (i+1) * 800);
		}));
	});

	Promise.all(deps).then(function() {
		LOADER_DONE = true;
	});
}

function removeLoader() {
	setProgressBarIndex(0);
	document.body.classList.remove('loading');
	scrollIndicator.classList.remove(SCROLL_INDICATOR_HIDE_CLASS);
	navItems.forEach(function(el) {
		el.classList.remove('nav-item-active');
	});
	for(const f of onRevealFunctions) {
		f();
	}
}

/* ––– UTIL ––– */

function map(value, istart, istop, ostart, ostop) {
	return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

function setBodyScroll(enabled) {
	document.body.style.overflowY = enabled ? 'initial' : 'hidden';
}

function intersectionObserverPolyfill(element, onVisible, onInvisible, triggerCalc) {

	let visible = undefined;
	const handleScroll = function() {
		const rect = element.getBoundingClientRect();
		if(triggerCalc) {
			const result = triggerCalc(rect);
			if(result && !visible) onVisible(element);
			if(!result && visible) onInvisible(element);
			visible = result;
		} else {
			if(rect.bottom > 0 && rect.top < window.innerHeight) {
				if(visible != true) onVisible(element);
				visible = true;
			} else {
				if(visible != false) onInvisible(element);
				visible = false;
			}
		}
	};
	window.addEventListener('scroll', handleScroll);
	handleScroll();
}

function fallbackCopyTextToClipboard(text) {
	const input = document.createElement('textarea');
	input.value = text;
	input.style.display = 'none';
	document.body.appendChild(input);
	input.focus();
	input.select();
	const result = document.execCommand('copy');
	document.body.removeChild(input);
	return result;
}
function copyTextToClipboard(text) {
	if (!navigator.clipboard) {
		return new Promise(function(res, rej) {
			if(fallbackCopyTextToClipboard(text)) {
				res();
			} else {
				rej();
			}
		});
	}
	return navigator.clipboard.writeText(text);
}
