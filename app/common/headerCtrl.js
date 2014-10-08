(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('HeaderCtrl', headerCtrl);

    headerCtrl.$inject = [];

    /* @ngInject */
    function headerCtrl() {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
        }
    }
})();