if ("undefined" === typeof paypal || "undefined" === typeof paypal.button || "undefined" === typeof paypal.button.create) {
    var err = "`paypal` global object not found or incompatible. Make sure the https://www.paypalobjects.com/api/button.js is loaded.";
    if (console) {
        console.error(err);
    } else {
        throw new err;
    }
}

/**
 * Wrapper class that allows you to create PayPal buttons dynamically using the JavaScriptButtons
 * 
 * @since 1.0
 * @class
 * @author Eugen Mihailescu
 * @license {@link https://www.gnu.org/licenses/gpl-3.0.txt|GPLv3}
 * @see https://github.com/paypal/JavaScriptButtons
 * 
 * @returns {Object} - Returns the instance of the button
 */
function PayPalButton() {
    return this;
}

/**
 * Sanitize a value by making sure it's within a specified set of values
 * 
 * @since 1.0
 * @param {string}
 *            val - The value to sanitize
 * @param {string[]}
 *            array - The range to check against
 * @param {string}
 *            default_val - The default value in case val is not within array
 * @returns {string} - Returns the sanitized value
 */
PayPalButton.prototype.sanitizeValue = function(val, array, default_val) {
    if (array.indexOf(val) > -1) {
        return val;
    }

    return default_val;
};

/**
 * Normalize the given input data by returning a self-contained object
 * 
 * @since 1.0
 * @param {string}
 *            label - The button caption
 * @param {boolean}
 *            show_icon - When true show the PayPal logo on button
 * @para {string} locale - The locale that is used for the button's tag line
 * @param {boolean}
 *            disabled - When true the button is disabled
 * 
 * @return {Object} Returns an normalized object containing the properties of the button
 */
PayPalButton.prototype.normalizeData = function(id, type, label, show_icon, locale, disabled) {
    // hack: \x7F introduces an invisible character that indent downwards the caption a little bit
    if (!(label.length && label.replace(PayPalButton.prototype.DEFAULT_LABEL, "").length)) {
        label = "\x7F" + label;
    }

    return {
        lc : locale,
        label : label + (show_icon ? PayPalButton.prototype.DEFAULT_LABEL : ""),
        disabled : disabled ? "true" : "false",
        button_type : type,
        id : id
    };
};

/**
 * Normalize the given input config by returning a self-contained object
 * 
 * @since 1.0
 * @param {string}
 *            size - The size of the button
 * @param {string}
 *            shape - The shape of the button
 * 
 * @returns Returns the normalized object
 * @see {@link PayPalButton#SIZES|SIZES}
 * @see {@link PayPalButton#SHAPES|SHAPES}
 */
PayPalButton.prototype.normalizeConfig = function(size, shape) {
    return {
        type : "button",// fixed
        size : size,
        shape : shape
    };
};

/**
 * Generate a PayPal button for the given data and configuration
 * 
 * @since 1.0
 * @param {Object}
 *            data - The PayPal {@link PayPalButton#normalizeData|data}
 * @param {Object}
 *            config - The PayPal {@link PayPalButton#normalizeConfig|configuration}
 * @param {string}
 *            parent_selector A valid CSS selector. When valid then append the resulted button to that parent element.
 * @returns {Object} Returns the PayPal button object
 * @see {@link https://www.paypalobjects.com/api/button.js|function factory(business, raw, config, parent)}
 */
PayPalButton.prototype.factory = function(data, config, parent_selector) {

    // a POSIX valid locale tag (eg. sv_SE, en_US, de_DE, etc)
    data.lc = data.lc || PayPalButton.prototype.DEFAULT_LOCALE;

    // a string, eventually using the {wordmark} tag
    data.label = data.label || PayPalButton.prototype.DEFAULT_LABEL;

    if (data.color) {
        data.color = PayPalButton.prototype.sanitizeValue(data.color, PayPalButton.prototype.COLORS,
                PayPalButton.prototype.DEFAULT_COLOR);
    }

    if ("undefined" !== typeof data.disabled) {
        data.button_disabled = PayPalButton.prototype.sanitizeValue(data.disabled, PayPalButton.prototype.BOOL,
                PayPalButton.prototype.BOOL[0]);
    }

    // fixed value (however,if `checkout` is used then the button will be a submit form-like)
    config.type = PayPalButton.prototype.sanitizeValue(config.type, [ "button" ], "button");
    data.button_type = config.type;

    if (config.label) {
        config.label = PayPalButton.prototype.sanitizeValue(config.label, PayPalButton.prototype.TYPES,
                PayPalButton.prototype.TYPES[0]);
    }

    if (config.size) {
        config.size = PayPalButton.prototype.sanitizeValue(config.size, PayPalButton.prototype.SIZES,
                PayPalButton.prototype.DEFAULT_SIZE);
    }

    if (config.shape) {
        config.shape = PayPalButton.prototype.sanitizeValue(config.shape, PayPalButton.prototype.SHAPES,
                PayPalButton.prototype.DEFAULT_SHAPE);
    }

    if (config.style) {
        config.style = PayPalButton.prototype.sanitizeValue(config.style, PayPalButton.prototype.STYLES,
                PayPalButton.prototype.DEFAULT_STYLE);
    }

    return paypal.button.create(true, data, config, document.querySelector(parent_selector));

};

/**
 * Genererates a PayPal Checkout button for the given parameters
 * 
 * @since 1.0
 * @param {string}
 *            parent_selector - A valid CSS selector. When specified append the resulted button to that parent element.
 * @param {string}
 *            id - The button Id attribute
 * @param {string}
 *            size - The predefined {@link PayPalButton#SIZES|size} of the button
 * @param {string}
 *            shape - The predefined {@link PayPalButton#SHAPES|shape} of the button
 * @param {string}
 *            color - The predefined {@link PayPalButton#COLORS|color} of the button
 * @param {string}
 *            label - Optionally a caption for the button.
 * @param {boolean}
 *            show_icon - When true display the PayPal logo on button
 * @param {boolean}
 *            tagline - When true show a PayPal tagline under the button
 * @param {string}
 *            locale - The POSIX locale for the automatic PayPal captions
 * @param {boolean}
 *            disabled - When true the button is generated with disabled style
 * @param {string}
 *            type - One of the predefined PayPal button {@link PayPalButton#TYPES|types}
 * @returns {Object} Returns the generated PayPal {@link PayPalButton#factory|button object}
 */
PayPalButton.prototype.createCheckoutButton = function(parent_selector, id, size, shape, color, label, show_icon, tagline,
        locale, disabled, type) {
    var data = PayPalButton.prototype.normalizeData(id, PayPalButton.prototype.DEFAULT_BUTTON_TYPE, label, show_icon, locale,
            disabled);
    data.color = color;
    data.tagline = tagline ? "true" : "false";

    var config = PayPalButton.prototype.normalizeConfig(size, shape);
    config.label = PayPalButton.prototype.sanitizeValue(type, PayPalButton.prototype.TYPES,
            PayPalButton.prototype.DEFAULT_TYPE);

    return PayPalButton.prototype.factory(data, config, parent_selector);
};

/**
 * Genererates a PayPal Credit button for the given parameters
 * 
 * @since 1.0
 * @param {string}
 *            parent_selector - A valid CSS selector. When specified append the resulted button to that parent element.
 * @param {string}
 *            id - The button Id attribute
 * @param {string}
 *            size - The predefined {@link PayPalButton#SIZES|size} of the button
 * @param {string}
 *            shape - The predefined {@link PayPalButton#SHAPES|shape} of the button
 * @param {string}
 *            label - Optionally a caption for the button.
 * @param {boolean}
 *            show_icon - When true display the PayPal logo on button
 * @param {boolean}
 *            tagline - When true show a PayPal tagline under the button
 * @param {string}
 *            locale - The POSIX locale for the automatic PayPal captions
 * @param {boolean}
 *            disabled - When true the button is generated with disabled style
 * @returns Returns the generated PayPal {@link PayPalButton#factory|button object}
 */
PayPalButton.prototype.createCreditButton = function(parent_selector, id, size, shape, label, show_icon, tagline, locale,
        disabled) {
    return PayPalButton.prototype.createCheckoutButton(parent_selector, id, size, shape, "", label, show_icon, tagline,
            locale, disabled, PayPalButton.prototype.TYPES[1]);
};

/**
 * Genererates a PayPal predefined Checkout|Credit button by specifying the PayPal style
 * 
 * @since 1.0
 * @param {string}
 *            parent_selector - A valid CSS selector. When specified append the resulted button to that parent element.
 * @param {string}
 *            id - The button Id attribute
 * @param {string}
 *            size - The predefined {@link PayPalButton#SIZES|size} of the button
 * @param {string}
 *            shape - The predefined {@link PayPalButton#SHAPES|shape} of the button
 * @param {string}
 *            style - The predefined {@link PayPalButton#STYLES|style} of the buttons "credit")
 * @param {string}
 *            label - Optionally a caption for the button.
 * @param {boolean}
 *            show_icon - When true display the PayPal logo on button
 * @param {string}
 *            locale - The POSIX locale for the automatic PayPal captions
 * @param {boolean}
 *            disabled - When true the button is generated with disabled style
 * @returns Returns the generated PayPal {@link PayPalButton#factory|button object}
 */
PayPalButton.prototype.createStyleButton = function(parent_selector, id, size, shape, style, label, show_icon, locale,
        disabled) {
    var data = PayPalButton.prototype.normalizeData(id, PayPalButton.prototype.DEFAULT_BUTTON_TYPE, label, show_icon, locale,
            disabled);

    var config = PayPalButton.prototype.normalizeConfig(size, shape);
    config.style = style;

    return PayPalButton.prototype.factory(data, config, parent_selector);
};

/**
 * @since 1.0
 * @constant {string[]}
 * @default
 */
PayPalButton.prototype.COLORS = [ "blue", "silver", "gold" ];

/**
 * @since 1.0
 * @constant {string[]}
 * @default
 */
PayPalButton.prototype.BOOL = [ "false", "true" ];

/**
 * @since 1.0
 * @constant {string[]}
 * @default
 */
PayPalButton.prototype.TYPES = [ "checkout", "credit" ];

/**
 * @since 1.0
 * @constant {string[]}
 * @default
 */
PayPalButton.prototype.SIZES = [ "tiny", "small", "medium", "large" ];

/**
 * @since 1.0
 * @constant {string[]}
 * @default
 */
PayPalButton.prototype.SHAPES = [ "pill", "rect" ];

/**
 * @since 1.0
 * @constant {string[]}
 * @default
 */
PayPalButton.prototype.STYLES = [ "primary", "secondary", "tertiary", "quaternary", "checkout", "credit" ];

/**
 * @since 1.0
 * @constant {string[]}
 * @default
 */
PayPalButton.prototype.BUTTON_TYPES = [ "button", "submit" ];

/**
 * @since 1.0
 * @constant {string}
 * @default
 */
PayPalButton.prototype.DEFAULT_LOCALE = "en_US";

/**
 * @since 1.0
 * @constant {string}
 * @default
 */
PayPalButton.prototype.DEFAULT_COLOR = PayPalButton.prototype.COLORS[0];

/**
 * @since 1.0
 * @constant {string}
 * @default
 */
PayPalButton.prototype.DEFAULT_LABEL = "{wordmark}";

/**
 * @since 1.0
 * @constant {string}
 * @default
 */
PayPalButton.prototype.DEFAULT_SIZE = PayPalButton.prototype.SIZES[2];

/**
 * @since 1.0
 * @constant {string}
 * @default
 */
PayPalButton.prototype.DEFAULT_STYLE = "primary";

/**
 * @since 1.0
 * @constant {string}
 * @default
 */
PayPalButton.prototype.DEFAULT_SHAPE = PayPalButton.prototype.SHAPES[1];

/**
 * @since 1.0
 * @constant {string}
 * @default
 */
PayPalButton.prototype.DEFAULT_TYPE = PayPalButton.prototype.TYPES[0];

/**
 * @since 1.0
 * @constant {string}
 * @default
 */
PayPalButton.prototype.DEFAULT_BUTTON_TYPE = PayPalButton.prototype.BUTTON_TYPES[0];