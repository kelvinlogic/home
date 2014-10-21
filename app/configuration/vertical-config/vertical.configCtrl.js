(function () {
    "use strict";

    angular
        .module("fc.configuration")
        .controller("VerticalConfigCtrl", verticalConfigCtrl);

    verticalConfigCtrl.$inject = [];

    /* @ngInject */
    function verticalConfigCtrl()
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.titleKey = "fc.configuration.vertical.PAGE_TITLE";

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
        }
    }
})();