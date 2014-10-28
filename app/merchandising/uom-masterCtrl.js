(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('UomMasterCtrl', uomMaster);

    uomMaster.$inject = ['lodash', '$scope'];

    /* @ngInject */
    function uomMaster(_, $scope) {
        /* jshint validthis: true */
        var vm = this,
            _gridApi = null;

        vm.activate = activate;
        vm.cancelChanges = cancelChanges;
        vm.edit = edit;
        vm.gridOptions = {};
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.saveChanges = saveChanges;
        vm.selectedAll = false;
        vm.selectedUoms = [];
        vm.selectedUom = null;
        vm.uom = null;
        vm.titleKey = 'fc.merchandising.uom.MASTER_PAGE_TITLE';

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up grid.
            setupGrid();
            // Set up pagination.
            setupPagination();

            // TODO: Load user data here.
            vm.gridOptions.data = [
                {id: 1, code: "CLL", name: "Compulynx Limited", packable: true},
                {id: 2, code: "CLL", name: "Compulynx Limited"},
                {id: 3, code: "CLL", name: "Compulynx Limited"},
                {id: 4, code: "CLL", name: "Compulynx Limited"}
            ];
        }

        function cancelChanges() {
            vm.uom = null;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.uom = angular.extend({}, vm.selectedUom);
            vm.selectedUoms = [];
            vm.selectedUom = null;
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.uom = null;
        }

        function setupGrid() {
            vm.gridOptions.enableGridMenu = true;
//            vm.gridOptions.enableRowHeaderSelection = false;
//            vm.gridOptions.enableScrollbars = false;
            vm.gridOptions.enableSelectAll = true;
            vm.gridOptions.enableSelectionBatchEvent = false;
            vm.gridOptions.multiSelect = true;

            vm.gridOptions.columnDefs = [
                {name: "id", visible: false},
                {name: "code"},
                {name: "name"},
                {name: "packable", cellTemplate: '<div class="ui-grid-cell-contents"><i class="fa fa-check" data-ng-if="COL_FIELD"></i></div>'}
            ];

            vm.gridOptions.onRegisterApi = function (gridApi) {
                _gridApi = gridApi;
                
                // Listen for row selection changed.
                gridApi.selection.on.rowSelectionChanged($scope, function (gridRow) {
                    var index = vm.selectedUoms.indexOf(gridRow.entity);

                    if (gridRow.isSelected) {
                        vm.selectedUom = gridRow.entity;

                        // If element isn't in the selected elements array...
                        if (index < 0) {
                            // add it.
                            vm.selectedUoms.push(gridRow.entity)
                        }
                    } else {
                        // If element isn't in the selected elements array...
                        if (index > -1) {
                            // remove it.
                            vm.selectedUoms.splice(index, 1);
                        }

                        vm.selectedUom = _.last(vm.selectedUoms);
                    }
                });
            };

            // TODO: Add external filtering and sorting.
        }

        function setupPagination() {
            vm.pagination.page = 1;
            vm.pagination.total = 100;
            vm.pagination.maxSize = 5;
        }
    }
})();