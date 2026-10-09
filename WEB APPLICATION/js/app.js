/**
 * SafeWalk AI - Main AngularJS Application Module
 * 
 * Features:
 * - Hash-bang ('!') routing configuration for SPA navigation
 * - Route Guards on $routeChangeStart (enforcing authentication and RBAC)
 * - Global session state & dark mode persistence
 */
(function() {
  'use strict';

  angular.module('safeWalkApp', ['ngRoute', 'ngAnimate'])
    .config(['$locationProvider', function($locationProvider) {
      // Standard hash-bang routing mode (#!/...)
      $locationProvider.hashPrefix('!');
    }])
    .run(['$rootScope', '$location', 'StorageService', 'AuthenticationService', 'NotificationService', 'AppFactory',
    function($rootScope, $location, StorageService, AuthenticationService, NotificationService, AppFactory) {
      
      // Global user session state
      $rootScope.currentUser = AuthenticationService.getCurrentUser();
      $rootScope.isSidebarOpen = false;
      $rootScope.isDarkMode = StorageService.getItem('darkMode') || false;
      $rootScope.activeEmergency = false;
      $rootScope.pageAnimation = AppFactory.getPageAnimation($location.path());

      // Theme initialization
      if ($rootScope.isDarkMode) {
        document.body.classList.add('dark-mode');
      }

      // Route Guards: Protect authenticated and admin-only routes
      $rootScope.$on('$routeChangeStart', function(event, next, current) {
        var routePath = next && next.$$route ? next.$$route.originalPath : '';
        var isAuth = AuthenticationService.isAuthenticated();
        var currentUser = AuthenticationService.getCurrentUser();
        $rootScope.currentUser = currentUser;

        var isPublic = (routePath === '/landing' || routePath === '/login' || routePath === '/register' || !routePath);

        // Protect authenticated views
        if (!isPublic && !isAuth) {
          event.preventDefault();
          NotificationService.show('Session required. Please sign in to access SafeWalk protection.', 'warning');
          $location.path('/login');
          return;
        }

        // Prevent logged-in users from needlessly seeing login/register
        if (isAuth && (routePath === '/login' || routePath === '/register')) {
          event.preventDefault();
          if (currentUser && currentUser.role === 'admin') {
            $location.path('/admin');
          } else {
            $location.path('/dashboard');
          }
          return;
        }

        // Protect Admin-only views
        if (next && next.$$route && next.$$route.requireAdmin) {
          if (!currentUser || currentUser.role !== 'admin') {
            event.preventDefault();
            NotificationService.show('Access restricted: Administrator privileges required.', 'danger');
            $location.path('/dashboard');
            return;
          }
        }
      });

      // Page animation update on route change
      $rootScope.$on('$routeChangeSuccess', function(event, current) {
        var route = current && current.$$route;
        $rootScope.pageAnimation = AppFactory.getPageAnimation(route && route.originalPath);
        $rootScope.isSidebarOpen = false;
      });

      // Global helpers
      $rootScope.toggleSidebar = function() {
        $rootScope.isSidebarOpen = !$rootScope.isSidebarOpen;
      };

      $rootScope.toggleDarkMode = function() {
        $rootScope.isDarkMode = !$rootScope.isDarkMode;
        StorageService.setItem('darkMode', $rootScope.isDarkMode);
        if ($rootScope.isDarkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      };

      $rootScope.logout = function() {
        AuthenticationService.logout();
        $rootScope.currentUser = null;
        NotificationService.show('Signed out successfully.', 'info');
        $location.path('/login');
      };

      $rootScope.triggerGlobalSOS = function() {
        $location.path('/sos');
      };

      $rootScope.isActive = function(path) {
        return $location.path() === path;
      };
    }]);

})();
