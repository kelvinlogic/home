(function () {
    "use strict";

    angular
        .module("fc.startup")
        .controller("VerticalConfigCtrl", verticalConfigCtrl);

    verticalConfigCtrl.$inject = [];

    /* @ngInject */
    function verticalConfigCtrl()
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.titleKey = "fc.startup.config.vertical.PAGE_TITLE";

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
        }
    }
})();