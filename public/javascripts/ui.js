/**
 * Created by Claas on 01.09.2015.
 */

//Stupid IE
// Avoid `console` errors in browsers that lack a console.
(function () {
    var method;
    var noop = function () {
    };
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

var app = angular.module('eu', ['ngRoute']).run(function ($http, $rootScope, $sce, $location, $window) {
    $rootScope.$on('$routeChangeSuccess', function () {
        $window.ga('send', 'pageview', {page: angular.lowercase($location.path())});
    });

    $rootScope.loadingSites = true;
    $http.get('./../sites.json')
        .then(function (res) {
            $rootScope.sites = res.data;
            $rootScope.loadingSites = false;
        });

    $rootScope.menuButton = $sce.trustAsHtml('&equiv;');
    $rootScope.navigation_active = false;
    $rootScope.toggleNavigation = function () {
        $rootScope.navigation_active = !$rootScope.navigation_active;
    };
    $rootScope.hideNavigation = function () {
        $rootScope.navigation_active = false;
    };
});

app.controller('contentController', function ($scope, $routeParams, $rootScope, $location, $sce, $window, $http) {
    $scope.$on('$includeContentRequested', function (angularEvent, src) {
        $scope.loadingText = true;
    });
    $scope.$on('$includeContentError', function (angularEvent, src) {
        $scope.loading = false;
        $scope.toolUrl = 'html/404.html';
    });
    $scope.$on('$includeContentLoaded', function (angularEvent, src) {
        $scope.loadingText = false;
        var sitePath = angular.lowercase($routeParams.site);
        $rootScope.selectedSite = undefined;
        if ($rootScope.sites) {
            for (var i = 0; i < $rootScope.sites.length; i++) {
                if (angular.lowercase($rootScope.sites[i].path) === sitePath) {
                    $rootScope.selectedSite = $rootScope.sites[i];

                    $scope.converter.toUnit
                        = $scope.selectedSite.units[$scope.selectedSite.initialToUnit || 0];
                    $scope.converter.fromUnit
                        = $scope.selectedSite.units[$scope.selectedSite.initialFromUnit || 0];

                    console.log("Site selected");
                }
            }
        }
        if (!$rootScope.selectedSite) {
            $rootScope.selectedSite = {
                keywords: "knoverter umrechner umrechnen einheiten",
                description: "Einheiten-Umrechner.org ist deine Anlaufstelle für das Umrechnen von Einheiten aller Art!",
                path: sitePath
            };
        }
        $rootScope.shareText = encodeURIComponent($rootScope.selectedSite.description);
    });

    if ($routeParams.site) {
        $scope.toolUrl = '/html/' + angular.lowercase($routeParams.site) + '.html';
    } else {
        $scope.toolUrl = '/html/main.html';
    }

    var initial = {
        input: undefined,
        result: undefined,
        error: undefined
    };

    $scope.converter = angular.copy(initial);
    $scope.email = {};

    //TODO remove oder überarbeiten
    $scope.calculateMain = function(){
        console.log($rootScope.sites[0].units[0] === $scope.converter.toUnit);
        console.log($rootScope.sites[0].units[0]);
        console.log($scope.converter);
        var i = $rootScope.sites.length;
        while (i--) {
            if (contains($rootScope.sites[i].units,$scope.converter.toUnit)) {
                if (contains($rootScope.sites[i].units,$scope.converter.fromUnit)) {
                    $scope.calculate();
                } else {
                    $scope.converter.error = "Die Einheiten müssen in derselben Kategorie sein";

                }
                return;
            }
        }
        $scope.converter.error = "Bitte gib einen gültigen Wert ein und wähle Ausgangs- und Zieleinheit. 2";
    };
    $scope.calculate = function () {
        if ($scope.converter.fromUnit
            && $scope.converter.toUnit
            && validateDecimal($scope.converter.fromUnit.factorSI)
            && validateDecimal($scope.converter.toUnit.factorSI)
            && validateDecimal($scope.converter.input)) {

            $scope.converter.error = undefined;
            var result = $scope.converter.input * $scope.converter.fromUnit.factorSI / $scope.converter.toUnit.factorSI;
            $scope.converter.result = $sce.trustAsHtml("<b>" + round(result) + " " + $scope.converter.toUnit.name + "</b>.");
            $scope.converter.ratio = $sce.trustAsHtml("Das Verhältnis ist <b>" + (round (result/$scope.converter.input)) + "</b>");

            $window.ga('send', 'event', $rootScope.selectedSite.name, 'convert', $scope.converter.fromUnit.name + " to " + $scope.converter.toUnit.name, result);

        } else {
            $scope.converter.error = "Bitte gib einen gültigen Wert ein und wähle Ausgangs- und Zieleinheit.";
        }
    };
    $scope.reset = function () {
        $scope.converter = angular.copy(initial);
    };
    $scope.sendFeedback = function () {
        if ($scope.email.text) {
            $http.post('/sendmail', {
                text: $scope.email.text,
                sender: $scope.email.sender
            }).
                then(function (response) {
                    $scope.email = {};
                });
        }
    };

    var validateDecimal = function (decimal) {
        decimal = parseFloat(decimal);
        return angular.isNumber(decimal) && isFinite(decimal);
    };
    var round = function (decimal) {
      return parseFloat(decimal.toPrecision(10));
    };
    var contains = function(a, obj) {
        var i = a.length;
        while (i--) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }
});

app.config(function ($routeProvider, $locationProvider, $controllerProvider) {
    $routeProvider
        .when('/:site?', {
            templateUrl: 'html/tool_wrapper.html',
            controller: 'contentController'
        })
        .otherwise({
            templateUrl: 'html/404.html'
        });
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
});

app.filter('safe', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
});

app.directive('script', function () {
    return {
        restrict: 'E',
        scope: false,
        link: function (scope, elem, attr) {
            if (attr.type === 'text/javascript-lazy') {
                var s = document.createElement("script");
                s.type = "text/javascript";
                var src = elem.attr('src');
                if (src !== undefined) {
                    s.src = src;
                }
                else {
                    var code = elem.text();
                    s.text = code;
                }
                document.head.appendChild(s);
                elem.remove();
            }
        }
    };
});
app.directive('sharebar', function ($location, $http, $rootScope) {
    return {
        restrict: 'E',
        replace: 'true',
        templateUrl: "../directives/sharebar.html",
        link: function (scope, elem, attrs) {
            scope.shareUrl = encodeURIComponent($location.absUrl().replace("http://", "").replace("https://", "").replace("/#!", ""));
            $http({
                method: 'GET',
                url: 'fb',
                params: {url: scope.shareUrl}
            }).success(function (data) {
                scope.fbShareCount = data;
            });
            $http({
                method: 'GET',
                url: 'twitter',
                params: {url: scope.shareUrl}
            }).success(function (data) {
                scope.tweetCount = data;
            });
            $http({
                method: 'GET',
                url: 'gplus',
                params: {url: scope.shareUrl}
            }).success(function (data) {
                scope.gplusShareCount = data;
            });
        }
    };
});
app.directive('converter', function ($location, $http, $rootScope) {
    return {
        restrict: 'E',
        replace: 'true',
        templateUrl: "../directives/converter.html"
    };
});
