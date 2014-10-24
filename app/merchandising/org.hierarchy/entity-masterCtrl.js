(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('EntityMasterCtrl', entityMaster);

    entityMaster.$inject = ['$scope'];

    /* @ngInject */
    function entityMaster($scope) {
        /* jshint validthis: true */
        var vm = this;

        vm.activate = activate;
        vm.cancelChanges = cancelChanges;
        vm.edit = edit;
        vm.entities = [];
        vm.gridOptions = {};
        vm.pageChanged = pageChanged;
        vm.pagination = {};
        vm.saveChanges = saveChanges;
        vm.selectedEntity = null;
        vm.entity = null;
        vm.titleKey = 'fc.merchandising.hierarchy.entity.MASTER_PAGE_TITLE';

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            // Set up pagination.
            vm.pagination.page = 1;
            vm.pagination.total = 100;
            vm.pagination.maxSize = 5;

            // TODO: Load user data here.
            vm.gridOptions.data = vm.entities = [
                {id: 1, code: "CLL", name: "Compulynx Limited"},
                {id: 2, code: "CLL", name: "Compulynx Limited"},
                {id: 3, code: "CLL", name: "Compulynx Limited"},
                {id: 4, code: "CLL", name: "Compulynx Limited"}
            ];

            vm.gridOptions.enableRowSelection = true;
//            vm.gridOptions.enableRowHeaderSelection = false;
            vm.gridOptions.enableScrollbars = false;
            vm.gridOptions.enableSelectAll = false;
            vm.gridOptions.multiSelect = false;

            vm.gridOptions.columnDefs = [
                {name: "id", width: "5%"},
                {name: "code", width: "10%"},
                {name: "name", width: "30%"},
                {name: "description", width: "40%"},
                {name: "location", width: "15%"}
            ];

            vm.gridOptions.onRegisterApi = function (gridApi) {
                // Listen for row selection changed.
                gridApi.selection.on.rowSelectionChanged($scope, function (gridRow) {
                    if (gridRow.isSelected) {
                        vm.selectedEntity = gridRow.entity;
                    } else {
                        vm.selectedEntity = null;
                    }
                });
            };

            // TODO: Add external filtering and sorting.
        }

        function cancelChanges() {
            vm.entity = null
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
    }
})();