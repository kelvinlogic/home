(function () {
    'use strict';

    angular
        .module('fc.common')
        .controller('SearchCtrl', searchCtrl)
        .provider('searchSvc', searchSvcProvider);

    searchCtrl.$inject = ['rx', '$scope', '$modalInstance', 'searchSvc', "throttleValue", 'data'];

    /* @ngInject */

    /*
    * To open the search modal, use the code below:
    * */
    /*var modalInstance = $modal.open({
        templateUrl: "common/search/search.html",
        controller: "SearchCtrl as searchCtrl",
        resolve: {
            data: function () {
                return {
                    cancelKey: "fc.CANCEL_TEXT",
                    entity: "Hierarchy Configuration",
                    okKey: "fc.OK_TEXT",
                    titleKey: "fc.SEARCH_TEXT"
                };
            }
        }
    });

    modalInstance.result.then(function () {
        // We selected ok...
    }, function () {
        // We cancelled the search...
    });*/
    /* Remember to inject $modal */

    function searchCtrl(Rx, $scope, $modalInstance, searchSvc, throttleValue, data) {
        /* jshint validthis: true */
        var subject = new Rx.Subject();
        var vm = this;

        vm.cancel = cancel;
        vm.cancelKey = data.cancelKey;
        vm.entity = data.entity;
        vm.filter = null;
        vm.props = [];
        vm.items = [];
        vm.ok = ok;
        vm.okKey = data.okKey;
        vm.selectedItem = null;
        vm.titleKey = data.titleKey;

        activate();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function activate() {
            if (!vm.entity) {
                return;
            }

            $scope.$watch(function () {
                return vm.filter;
            }, function (newVal) {
                subject.onNext(newVal);
            });

            subject.throttle(throttleValue).distinctUntilChanged().subscribe(function (searchValue) {
                getData(searchValue, vm.entity);
            });
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

        function getData(searchValue, entity) {
            if (!entity) {
                return;
            }

            searchSvc.search(searchValue, entity).success(function (data) {
                vm.items = data;
                if (vm.items && vm.items.length) {
                    vm.props = getProps(vm.items[0]);
                }
            });
        }

        function getProps(object) {
            var props = [];
            if (!object) {
                return props;
            }

            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    props.push(prop);
                }
            }

            return props
        }

        function ok() {
            $modalInstance.close(vm.selectedItem);
        }
    }

    function searchSvcProvider() {
        var cfg = this;
        cfg.searchUrl = null;
        cfg.$get = searchSvc;

        searchSvc.$inject = ['$http'];

        function searchSvc($http) {
            return {
                search: search
            };

            function search(searchTerm, entity) {
                var config = {
                    params: {}
                };

                // Set the entity if it exists.
                if (entity) {
                    config.params.e = entity;
                }

                // Set the search term if it exists.
                if (searchTerm) {
                    config.params.q = searchTerm;
                }

                return $http.get(cfg.searchUrl, config);
            }
        }
    }
})();