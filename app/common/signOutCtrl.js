(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('SignOutCtrl', signOutCtrl);

    signOutCtrl.$inject = ['$translate', '$window', 'appConfig', 'authSvc'];

    /* @ngInject */
    function signOutCtrl($translate, $window, config, authSvc) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.signOut = signOut;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
        }

        function signOut() {
            // Enter sign out logic here.
            // Get the current user.
            var user = authSvc.getCurrentUser();

            if (!user) {
                return;
            }

            var toTranslate = ["fc.common.SIGN_OUT_WARNING_TITLE", "fc.common.SIGN_OUT_WARNING_MESSAGE", "fc.NO_TEXT", "fc.YES_TEXT"];

            // Translate first.
            $translate(toTranslate).then(function (translations) {
                var signOutTitle = translations["fc.common.SIGN_OUT_WARNING_TITLE"],
                    signOutWarning = translations["fc.common.SIGN_OUT_WARNING_MESSAGE"],
                    noText = translations["fc.NO_TEXT"],
                    yesText = translations["fc.YES_TEXT"];

                // Ask for verification first.
                $.SmartMessageBox({
                    title : "<i class='fa fa-sign-out txt-color-orangeDark'></i> "+ signOutTitle + " <span class='txt-color-orangeDark'><strong>" + user.name + "</strong></span>?",
                    content : signOutWarning,
                    buttons : '[' + noText + '][' + yesText + ']'

                }, function(ButtonPressed) {
                    if (ButtonPressed === yesText) {
                        authSvc.signOut().then(function () {
                            $window.location = config.loginPage;
                        }, function () {
                            $window.location = config.loginPage;
                        });
                    }
                });
            });
        }
    }
})();