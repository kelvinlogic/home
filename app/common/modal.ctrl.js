(function () {
    "use strict";

    angular
        .module("fc.common")
        .controller("ModalTemplateCtrl", modalTemplateCtrl);

    modalTemplateCtrl.$inject = ["$modalInstance", "data"];

    /* @ngInject */
    function modalTemplateCtrl($modalInstance, data)
    {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.bodyTextKey = data.bodyTextKey;
        vm.cancel = cancel;
        vm.cancelKey = data.cancelKey;
        vm.ok = ok;
        vm.okKey = data.okKey;
        vm.titleKey = data.titleKey;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
        }

        function cancel() {
            $modalInstance.dismiss();
        }

        function ok() {
            $modalInstance.close();
        }
    }
})();