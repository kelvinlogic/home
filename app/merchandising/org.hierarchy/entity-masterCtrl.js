(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('EntityMasterCtrl', entityMaster);

    entityMaster.$inject = ['lodash', '$scope'];

    /* @ngInject */
    function entityMaster(_, $scope) {
        /* jshint validthis: true */
        var vm = this,
            _gridApi = null;

        vm.activate = activate;
        vm.cancelChanges = cancelChanges;
        vm.canToggleSelection = canToggleSelection;
        vm.edit = edit;
        vm.entities = [];
        vm.gridOptions = {};
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.saveChanges = saveChanges;
        vm.selectAll = selectAll;
        vm.selectedAll = false;
        vm.selectedEntities = [];
        vm.selectedEntity = null;
        vm.entity = null;
        vm.titleKey = 'fc.merchandising.hierarchy.entity.MASTER_PAGE_TITLE';

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up grid.
            setupGrid();
            // Set up pagination.
            setupPagination();

            // TODO: Load user data here.
            vm.gridOptions.data = vm.entities = [
                {id: 1, code: "CLL", name: "Compulynx Limited"},
                {id: 2, code: "CLL", name: "Compulynx Limited"},
                {id: 3, code: "CLL", name: "Compulynx Limited"},
                {id: 4, code: "CLL", name: "Compulynx Limited"}
            ];
        }

        function cancelChanges() {
            vm.entity = null;
        }

        function canToggleSelection() {
            return _gridApi;
        }

        function edit() {
            // Use extend to prevent reference copying.
            vm.entity = angular.extend({}, vm.selectedEntity);
        }

        function pageChanged() {
            // TODO: Enter page change logic.
            var currentPage = vm.pagination.page;
        }

        function saveChanges() {
            // TODO: Enter save logic
            vm.entity = null;
        }

        function selectAll() {
            if (!_gridApi) {
                return;
            }

            if (vm.selectedAll) {
                _gridApi.selection.clearSelectedRows();
            } else {
                // TODO: Not raising event. Reported. https://github.com/angular-ui/ng-grid/issues/1912
                _gridApi.selection.selectAllRows();
            }

            vm.selectedAll = !vm.selectedAll;
        }

        function setupGrid() {
//            vm.gridOptions.enableRowHeaderSelection = false;
            vm.gridOptions.enableScrollbars = false;
            vm.gridOptions.enableSelectAll = true;
            vm.gridOptions.enableSelectionBatchEvent = false;
            vm.gridOptions.multiSelect = true;

            vm.gridOptions.columnDefs = [
                {name: "id", width: "5%"},
                {name: "code", width: "10%"},
                {name: "name", width: "30%"},
                {name: "description", width: "40%"},
                {name: "location", width: "15%"}
            ];

            vm.gridOptions.onRegisterApi = function (gridApi) {
                _gridApi = gridApi;
                
                // Listen for row selection changed.
                gridApi.selection.on.rowSelectionChanged($scope, function (gridRow) {
                    var index = vm.selectedEntities.indexOf(gridRow.entity);

                    if (gridRow.isSelected) {
                        vm.selectedEntity = gridRow.entity;

                        // If element isn't in the selected elements array...
                        if (index < 0) {
                            // add it.
                            vm.selectedEntities.push(gridRow.entity)
                        }
                    } else {
                        // If element isn't in the selected elements array...
                        if (index > -1) {
                            // remove it.
                            vm.selectedEntities.splice(index, 1);
                        }

                        vm.selectedEntity = _.last(vm.selectedEntities);
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