(function () {
    "use strict";

    angular.module("app")
    .factory("AuthService", function ($rootScope, $http)
    {

        var loginUser = function (params) {
            return $http({
                method: "POST",
                url: "/Token",
                data: params,
                headers: { 'Content-Type': "application/x-www-form-urlencoded" }
            });
        };

        var registerUser = function (userData) {
            return $http({
                method: "POST",
                url: "/api/Account/Register",
                data: userData
            });
        };

        var createQString = function(data)
        {
            var str = [];
            for (var d in data)
            {
                str.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
            }
            return str.join('&');
        };

        return {
            loginUser: loginUser,
            registerUser: registerUser,
            createQString: createQString
        };
    })
})();


//transformRequest: function(data, headersGetter)
//{
//    var str = [];
//    for (var d in data)
//    {
//        str.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
//    }
//    return str.join('&');
//}