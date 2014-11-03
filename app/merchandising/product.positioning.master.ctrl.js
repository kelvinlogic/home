(function () {
    'use strict';

    angular
        .module('fc.merchandising')
        .controller('ProductPositioningMasterCtrl', productPositioningMaster);

    productPositioningMaster.$inject = ['lodash', '$scope'];

    /* @ngInject */
    function productPositioningMaster(_, $scope) {
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
        vm.selectedPositionings = [];
        vm.selectedPositioning = null;
        vm.positioning = null;
        vm.titleKey = 'fc.merchandising.productPositioning.MASTER_PAGE_TITLE';

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
            vm.positioning = null;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.positioning = angular.extend({}, vm.selectedPositioning);
            vm.selectedPositionings = [];
            vm.selectedPositioning = null;
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.positioning = null;
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
                    var index = vm.selectedPositionings.indexOf(gridRow.entity);

                    if (gridRow.isSelected) {
                        vm.selectedPositioning = gridRow.entity;

                        // If element isn't in the selected elements array...
                        if (index < 0) {
                            // add it.
                            vm.selectedPositionings.push(gridRow.entity)
                        }
                    } else {
                        // If element isn't in the selected elements array...
                        if (index > -1) {
                            // remove it.
                            vm.selectedPositionings.splice(index, 1);
                        }

                        vm.selectedPositioning = _.last(vm.selectedPositionings);
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