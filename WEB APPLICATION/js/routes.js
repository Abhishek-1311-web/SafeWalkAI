/**
 * SafeWalk AI - AngularJS Route Configuration
 * Configures SPA views with hash-bang navigation and RBAC route metadata.
 */
(function() {
  'use strict';

  angular.module('safeWalkApp')
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider
        .when('/landing', {
          templateUrl: '../pages/landing.html',
          controller: 'LandingController',
          controllerAs: 'vm'
        })
        .when('/login', {
          templateUrl: '../pages/login.html',
          controller: 'LoginController',
          controllerAs: 'vm'
        })
        .when('/register', {
          templateUrl: '../pages/register.html',
          controller: 'RegisterController'
          // Stripped controllerAs: 'vm' to bind directly to $scope
        })
        .when('/dashboard', {
          templateUrl: '../pages/dashboard.html',
          controller: 'DashboardController',
          controllerAs: 'vm'
        })
        .when('/safe-route', {
          templateUrl: '../pages/safe-route.html',
          controller: 'RouteController',
          controllerAs: 'vm'
        })
        .when('/crime-map', {
          templateUrl: '../pages/crime-map.html',
          controller: 'CrimeMapController',
          controllerAs: 'vm'
        })
        .when('/live-location', {
          templateUrl: '../pages/live-location.html',
          controller: 'LocationController',
          controllerAs: 'vm'
        })
        .when('/sos', {
          templateUrl: '../pages/sos.html',
          controller: 'SOSController',
          controllerAs: 'vm'
        })
        .when('/contacts', {
          templateUrl: '../pages/contacts.html',
          controller: 'ContactController',
          controllerAs: 'vm'
        })
        .when('/profile', {
          templateUrl: '../pages/profile.html',
          controller: 'ProfileController',
          controllerAs: 'vm'
        })
        .when('/admin', {
          templateUrl: '../pages/admin.html',
          controller: 'AdminController',
          controllerAs: 'vm',
          requireAdmin: true
        })
        .otherwise({
          redirectTo: '/landing'
        });
    }]);

})();
