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
                language: "arabic",
                layout: "arabic-only-qwerty-1"
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

        var config = defaultCfg;

        cfg.config = config;
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
        var kbElements = null;

        return {
            restrict: "A",
            link: link
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function changeLanguage() {
            if (!kbElements){
                return;
            }

            var config = configSvc.getLocalConfig();
            var enabled = config.keyboardEnabled;

            // Set language.
            // Language specific config...
            var layout = keyboardConfigSvc.languageLayoutMapping[config.languageCode].layout;

            // Check if the keyboard language is the same as the new language.
            if (keyboardConfigSvc.config.layout === layout && kbElements.data('keyboard')){
                return;
            }

            keyboardConfigSvc.config.layout = layout;

            if (!enabled){
                return;
            }

            toggleKeyboard();
        }

        function disableKeyboards(elements) {
            elements.each(function (i, element) {
                if ($(element).data('keyboard')){
                    $(element).getkeyboard().destroy();
                }
            });
        }

        function enableKeyboards(elements, config) {
            elements.each(function (i, element) {
                if (!$(element).data('keyboard')){
                    $(element).keyboard(config).addTyping();
                }
            });
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
                if (!kbElements) {
                    kbElements = $("[data-vt-keyboard]");
                    init();
                }
            }, 0);
        }

        function toggleKeyboard() {
            if (!kbElements){
                return;
            }

            var config = configSvc.getLocalConfig();
            var enabled = config.keyboardEnabled;

            // Disable any existing keyboards...
            disableKeyboards(kbElements);

            // Set language.
            // Language specific config...
            var langConfig = language[keyboardConfigSvc.languageLayoutMapping[config.languageCode].language] || {};

            var targetConfig = $.extend(true, {}, keyboardConfigSvc.config, langConfig);

            // Input orientation...
            // Add rtl class if the config has the rtl flag.
            var rtlClass = keyboardConfigSvc.rtlClass;
            if (targetConfig.rtl){
                if (!kbElements.hasClass(rtlClass)){
                    kbElements.addClass(rtlClass);
                }
            } else {
                if (kbElements.hasClass(rtlClass)){
                    kbElements.removeClass(rtlClass);
                }
            }

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

                if (config.keyboardVisible){
                    if (keyboard && keyboard.$keyboard.hasClass("hidden")){
                        keyboard.$keyboard.removeClass("hidden");
                    }
                } else {
                    if (keyboard && !keyboard.$keyboard.hasClass("hidden")){
                        keyboard.$keyboard.addClass("hidden");
                    }
                }
            };

            if (enabled) {
                enableKeyboards(kbElements, targetConfig);
            }
        }
    }
})();