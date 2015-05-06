(function () {
    "use strict";

    angular.module("app")
    .factory("AuthService", function ($rootScope, $http)
    {

        var loginUser = function (userData) {
            return $http({
                method: "POST",
                url: "",
                data: userData
            });
        };

        var registerUser = function (userData) {
            return $http({
                method: "POST",
                url: "/api/Account/Register",
                data: userData
            });
        };

        return {
            login: loginUser,
            registerUser: registerUser
        };
    })
})();