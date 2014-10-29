(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('CurrencyMasterCtrl', currencyMaster);

    currencyMaster.$inject = ['lodash', '$scope'];

    /* @ngInject */
    function currencyMaster(_, $scope) {
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
        vm.selectedCurrencies = [];
        vm.selectedCurrency = null;
        vm.currency = null;
        vm.titleKey = 'fc.merchandising.currency.MASTER_PAGE_TITLE';

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up grid.
            setupGrid();
            // Set up pagination.
            setupPagination();

            // TODO: Load user data here.
            vm.gridOptions.data = [
                {id: 1, code: "$", name: "US Dollar"},
                {id: 2, code: "€", name: "Euro"},
                {id: 3, code: "£", name: "Sterling Pound"},
                {id: 4, code: "¥", name: "Japanese Yen"},
                {id: 5, code: "KES", name: "Kenyan Shilling"}
            ];
        }

        function cancelChanges() {
            vm.currency = null;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.currency = angular.extend({}, vm.selectedCurrency);
            vm.selectedCurrencies = [];
            vm.selectedCurrency = null;
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.currency = null;
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
                    var index = vm.selectedCurrencies.indexOf(gridRow.entity);

                    if (gridRow.isSelected) {
                        vm.selectedCurrency = gridRow.entity;

                        // If element isn't in the selected elements array...
                        if (index < 0) {
                            // add it.
                            vm.selectedCurrencies.push(gridRow.entity)
                        }
                    } else {
                        // If element isn't in the selected elements array...
                        if (index > -1) {
                            // remove it.
                            vm.selectedCurrencies.splice(index, 1);
                        }

                        vm.selectedCurrency = _.last(vm.selectedCurrencies);
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