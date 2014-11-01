(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('ProductBrandMasterCtrl', productBrandMaster);

    productBrandMaster.$inject = ['lodash', '$scope'];

    /* @ngInject */
    function productBrandMaster(_, $scope) {
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
        vm.selectedProductBrands = [];
        vm.selectedProductBrand = null;
        vm.productBrand = null;
        vm.titleKey = 'fc.merchandising.productBrand.MASTER_PAGE_TITLE';

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up grid.
            setupGrid();
            // Set up pagination.
            setupPagination();

            // TODO: Load user data here.
            vm.gridOptions.data = [
                {id: 1, code: "CocaCola", name: "Coca Cola"},
                {id: 2, code: "Pepsi", name: "Pepsi"},
                {id: 3, code: "BB", name: "Blue Band"},
                {id: 4, code: "Bic", name: "Bic"},
                {id: 5, code: "Nutella", name: "Nutella"}
            ];
        }

        function cancelChanges() {
            vm.productBrand = null;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.productBrand = angular.extend({}, vm.selectedProductBrand);
            vm.selectedProductBrands = [];
            vm.selectedProductBrand = null;
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.productBrand = null;
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
                {name: "name"}
            ];

            vm.gridOptions.onRegisterApi = function (gridApi) {
                _gridApi = gridApi;
                
                // Listen for row selection changed.
                gridApi.selection.on.rowSelectionChanged($scope, function (gridRow) {
                    var index = vm.selectedProductBrands.indexOf(gridRow.entity);

                    if (gridRow.isSelected) {
                        vm.selectedProductBrand = gridRow.entity;

                        // If element isn't in the selected elements array...
                        if (index < 0) {
                            // add it.
                            vm.selectedProductBrands.push(gridRow.entity)
                        }
                    } else {
                        // If element isn't in the selected elements array...
                        if (index > -1) {
                            // remove it.
                            vm.selectedProductBrands.splice(index, 1);
                        }

                        vm.selectedProductBrand = _.last(vm.selectedProductBrands);
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