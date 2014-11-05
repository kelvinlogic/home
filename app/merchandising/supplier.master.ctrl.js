(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('SupplierMasterCtrl', supplierMaster);

    supplierMaster.$inject = ['lodash', '$scope'];

    /* @ngInject */
    function supplierMaster(_, $scope) {
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
        vm.selectedSuppliers = [];
        vm.selectedSupplier = null;
        vm.supplier = null;
        vm.titleKey = 'fc.merchandising.supplier.MASTER_PAGE_TITLE';

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up grid.
            setupGrid();
            // Set up pagination.
            setupPagination();

            // TODO: Load user data here.
            vm.gridOptions.data = [
                {id: 1, code: "CLL", name: "Compulynx Limited"},
                {id: 2, code: "CLL", name: "Compulynx Limited"},
                {id: 3, code: "CLL", name: "Compulynx Limited"},
                {id: 4, code: "CLL", name: "Compulynx Limited"}
            ];
        }

        function cancelChanges() {
            vm.supplier = null;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.supplier = angular.extend({}, vm.selectedSupplier);
            vm.selectedSuppliers = [];
            vm.selectedSupplier = null;
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.supplier = null;
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
                {name: "location", visible: false},
                {name: "city"},
                {name: "phone"},
                {name: "fax", visible: false},
                {name: "email"},
                {name: "phone2", visible: false},
                {name: "vatNo", visible: false},
                {name: "pin", visible: false}
            ];

            vm.gridOptions.onRegisterApi = function (gridApi) {
                _gridApi = gridApi;
                
                // Listen for row selection changed.
                gridApi.selection.on.rowSelectionChanged($scope, function (gridRow) {
                    var index = vm.selectedSuppliers.indexOf(gridRow.entity);

                    if (gridRow.isSelected) {
                        vm.selectedSupplier = gridRow.entity;

                        // If element isn't in the selected elements array...
                        if (index < 0) {
                            // add it.
                            vm.selectedSuppliers.push(gridRow.entity)
                        }
                    } else {
                        // If element isn't in the selected elements array...
                        if (index > -1) {
                            // remove it.
                            vm.selectedSuppliers.splice(index, 1);
                        }

                        vm.selectedSupplier = _.last(vm.selectedSuppliers);
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