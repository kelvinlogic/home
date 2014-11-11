/**
 * Created by Caleb on 10/8/2014.
 */
(function () {
    "use strict";

    angular
        .module("fc.common")
        .provider("keyboardConfigSvc", keyboardConfigSvcProvider)
        .directive("vtKeyboard", keyboardDirective);

    /* @ngInject */
    function keyboardConfigSvcProvider() {
        // Available in config.
        var cfg = this;
        var defaultLayoutMapping = {
            "en-US": {
                language: "default",
                layout: "qwerty"
            },
            "sw-KE": {
                language: "swahili",
                layout: "qwerty"
            },
            "ar-AE": {
                language: "arabic",
                layout: "arabic-only-qwerty-1"
            }
        };

        var defaultCfg = $.keyboard.defaultOptions;
        defaultCfg.autoAccept = true;
        defaultCfg.caretToEnd = true;
        defaultCfg.usePreview = false;

        // Position keyboard at the bottom.
        defaultCfg.position = {
            of : "body",
            my : "center top",
            at : "center bottom",
            // used when "usePreview" is false (centers the keyboard at the bottom of the input/textarea)
            at2: "center bottom",
            collision: "flipfit flipfit"
        };

        defaultCfg.css = {
            // input & preview
            //input: 'form-control input-sm',
            // keyboard container
            container: 'center-block dropdown-menu', // jumbotron
            // default state
            buttonDefault: 'btn btn-default',
            // hovered button
            buttonHover: 'btn-primary',
            // Action keys (e.g. Accept, Cancel, Tab, etc);
            // this replaces "actionClass" option
            buttonAction: 'active',
            // used when disabling the decimal button {dec}
            // when a decimal exists in the input area
            buttonDisabled: 'disabled'
        };

        cfg.config = defaultCfg;
        cfg.keyboardClass = null;
        cfg.keyboardToggledEvent = null;
        cfg.languageChangedEvent = null;
        cfg.languageLayoutMapping = null;
        cfg.rtlClass = null;

        cfg.$get = keyboardConfigSvc;

        keyboardConfigSvc.$inject = [];

        function keyboardConfigSvc() {
            return {
                config: cfg.config,
                keyboardClass: cfg.keyboardClass || "fc-vt-kb",
                keyboardToggledEvent: cfg.keyboardToggledEvent || "fc.keyboardToggled",
                languageChangedEvent: cfg.languageChangedEvent || "fc.languageChanged",
                languageLayoutMapping: cfg.languageLayoutMapping || defaultLayoutMapping,
                rtlClass: cfg.rtlClass || "rtl"
            };


            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        }
    }

    keyboardDirective.$inject = ["$rootScope", "$timeout", "configSvc", "keyboardConfigSvc"];

    function keyboardDirective($rootScope, $timeout, configSvc, keyboardConfigSvc) {
        var elements = null,
            currentLayout = null;

        return {
            restrict: "A",
            link: link
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        function changeLanguage() {
            if (!elements){
                return;
            }

            var config = configSvc.getLocalConfig();
            var enabled = config.keyboardEnabled;
            var kbConfig = getKeyboardConfig();

            // Check if the keyboard language is the same as the new language.
            if (currentLayout === kbConfig.layout && $(elements).data('keyboard')){
                return;
            }

            if (!enabled){
                return;
            }

            // Input orientation...
            // Add rtl class if the config has the rtl flag.
            var rtlClass = keyboardConfigSvc.rtlClass;
            elements.toggleClass(rtlClass, kbConfig.rtl)
                // Reset startup options set by Mottie keyboard in css
                // at (334:55)
                .css('direction', kbConfig.rtl ? 'rtl' : '');

            toggleKeyboard(kbConfig);

            currentLayout = kbConfig.layout;
        }

        function disableKeyboards() {
            elements.each(function (i, element) {
                if ($(element).data('keyboard')){
                    $(element).getkeyboard().destroy();
                }
            });
        }

        function enableKeyboards(config) {
            elements.each(function (i, element) {
                if (!$(element).data('keyboard')){
                    $(element).keyboard(config).addTyping();
                }
            });
        }

        function getKeyboardConfig() {
            var config = configSvc.getLocalConfig();

            // Set language.
            // Language specific config...
            var layoutMapping = keyboardConfigSvc.languageLayoutMapping[config.languageCode];
            var langConfig = language[layoutMapping.language] || {};

            var targetConfig = $.extend(true, {}, keyboardConfigSvc.config, langConfig, layoutMapping);

            targetConfig.beforeVisible = function (e, keyboard, el) {
                // Add draggable if one doesn't exist.
                if (!keyboard.$keyboard.hasClass("hidden") && !$(".ui-keyboard-header").length) {
                    keyboard.$keyboard
                        .prepend("<div class='ui-keyboard-header'></div>")
                        .draggable({
                            handle: "div.ui-keyboard-header",
                            containment: "window"
                        });
                }

                keyboard.$keyboard.toggleClass("hidden", !config.keyboardVisible);
            };

            return targetConfig;
        }

        function init() {
            changeLanguage();

            // Bind to keyboard toggle or language change broadcasts.
            $rootScope.$on(keyboardConfigSvc.keyboardToggledEvent, toggleKeyboard);
            $rootScope.$on(keyboardConfigSvc.languageChangedEvent, changeLanguage);
        }

        function link(scope, element, attributes) {
            // Use the timeout technique to ensure rendering has finished before activating the directive.
            // This enables it to be activated in directives like ng-repeat.
            $timeout(function () {
                if (!elements) {
                    elements = $("[data-vt-keyboard]:not(.tt-hint), [vt-keyboard]:not(.tt-hint)");

                    init();
                }

                $(element).on("change.keyboard", function () {
                    if (attributes.hasOwnProperty("sfTypeahead")) {
                        scope.$apply(function () {
                            element.typeahead('val', element.val());
                        });
                    }
                });
            }, 0);
        }

        function toggleKeyboard() {
            if (!elements){
                return;
            }

            var config = configSvc.getLocalConfig();
            var enabled = config.keyboardEnabled;
            var kbConfig = getKeyboardConfig();

            // Disable the existing keyboard...
            disableKeyboards();

            if (enabled) {
                enableKeyboards(kbConfig);
            }
        }
    }
})();