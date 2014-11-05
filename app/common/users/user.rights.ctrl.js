(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('UserRightsCtrl', userRights);

    userRights.$inject = ['lodash', '$scope', 'DTOptionsBuilder'];

    /* @ngInject */
    function userRights(_, $scope, DTOptionsBuilder) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.filters = {};
        vm.gridOptions = {};
        vm.rights = [];
        vm.selectedRight = null;
        vm.selectedRights = [];
        vm.titleKey = 'fc.common.rights.PAGE_TITLE';
        vm.toggleSelection = toggleSelection;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            setupGrid();

            load();

            // TODO: Add external filtering and sorting.
        }

        function load() {
            // TODO: Load user data here.
            vm.rights = [
                {id: 1, name: "Read"},
                {id: 2, name: "Write"}
            ];

            $scope.$watchCollection(function () {
                return vm.filters;
            }, function (newCollection) {
                if (newCollection.all) {
                    // Search on all fields.
                }

                if (newCollection.id) {
                    // Search on id field.
                }

                if (newCollection.name) {
                    // Search on name field.
                }

                if (newCollection.description) {
                    // Search on description field.
                }
            });
        }

        function setupGrid() {
            var sDom = "t"+
                "<'dt-toolbar-footer'<'col-sm-12 col-xs-12'i>>";

            vm.gridOptions = DTOptionsBuilder
                .newOptions()
                .withDOM(sDom)
                .withBootstrap()
                .withOption("paging", false)
                .withOption("autoWidth", true)
                .withOption('responsive', true);

            // TODO: Add external filtering and sorting.
        }

        function toggleSelection(item) {
            var index = vm.selectedRights.indexOf(item);
            item.isSelected = !item.isSelected;

            if (item.isSelected) {
                vm.selectedRight = item;

                // If item isn't in the selected items array...
                if (index < 0) {
                    // add it.
                    vm.selectedRights.push(item);
                }
            } else {
                // If item isn't in the selected items array...
                if (index > -1) {
                    // remove it.
                    vm.selectedRights.splice(index, 1);
                }

                vm.selectedRight = _.last(vm.selectedRights);
            }
        }
    }
})();