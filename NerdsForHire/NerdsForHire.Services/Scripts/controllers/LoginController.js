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
            .error(function (response) {
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
            vm.userData.grant_type = "password";
            var queryString = AuthService.createQString(vm.userData);
            AuthService.loginUser(queryString)
            .success(function (response) {
                vm.isLoggedIn = true;
                vm.message = "Successfully Logged In";
                vm.password = "";
                vm.token = response.access_token;
            })
            .error(function (response) {
                vm.password = "";
                vm.isLoggedIn = false;
                vm.token = "";
                vm.message = response.statusText + "\r\n";
                if (response.data.exceptionMessage)
                    vm.message += response.data.exceptionMessage;
                if (response.data.error)
                    vm.message += response.data.error;
            });
        }
    }]
)})();