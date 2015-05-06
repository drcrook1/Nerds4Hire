(function () {
    "use strict";

    angular.module('app')
    .controller("LoginController", ["$scope", "AuthService", function ( $scope, AuthService) {
        var vm = this;
        vm.isLoggedIn = false;
        vm.message = "stuff";
        vm.userData = {
            userName: '',
            email: '',
            password: '',
            confirmPassword: ''
        };

        vm.register = function()
        {
            vm.userData.confirmPassword = vm.userData.password;
            AuthService.registerUser(vm.userData)
            .success(function (data) {
                vm.login();
                vm.message = "Registration Successful";
            })
            .error(function (data, status, headers, config) {
                vm.isLoggedIn = false;
                vm.message = response.statusText + "\r\n";
                if (response.data.exceptionMessage)
                    vm.message += response.data.exceptionMessage;
                if(response.data.modelState)
                {
                    for(var key in response.data.modelState)
                    {
                        vm.message += response.data.modelState[key] + "\r\n";
                    }
                }
            });
        }

        vm.login = function()
        {

        }
    }]
)})();