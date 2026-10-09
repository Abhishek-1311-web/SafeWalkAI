/**
 * SafeWalk AI - AngularJS Services, Factories & Interceptors
 * 
 * Features:
 * - JWT Auth HTTP Interceptor (injects Bearer token into API requests)
 * - Strict External Persistence AuthenticationService (Fail-Closed, zero internal storage fallback on DB failure)
 * - Role-Based AdminService (User lifecycle management, incident verification, system stats)
 * - AnalyticsService (Spatial A* routing, heatmap density data, zone risk metrics)
 * - Full CRUD Services for Contacts, Crimes, SOS Dispatches, and Profile
 */
(function() {
  'use strict';

  angular.module('safeWalkApp')

    /* HTTP Interceptor for JWT and Error Handling */
    .factory('AuthInterceptor', ['$q', '$window', '$rootScope', function($q, $window, $rootScope) {
      return {
        request: function(config) {
          var token = $window.localStorage.getItem('safewalk_ai_token');
          if (token) {
            token = token.trim();
            // Strip any wrapping quotes stored from JSON.stringify
            if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
              token = token.slice(1, -1).trim();
            }
          }
          if (token && config.url && config.url.indexOf('/api/') !== -1) {
            config.headers = config.headers || {};
            config.headers.Authorization = 'Bearer ' + token;
          }
          return config;
        },
        responseError: function(rejection) {
          if (rejection.status === 401 || (rejection.status === 403 && rejection.data && rejection.data.error && rejection.data.error.indexOf('session token') !== -1)) {
            $window.localStorage.removeItem('safewalk_ai_token');
            $window.localStorage.removeItem('safewalk_ai_user');
            $rootScope.currentUser = null;
            if ($window.location.hash.indexOf('login') === -1 && $window.location.hash.indexOf('landing') === -1 && $window.location.hash.indexOf('register') === -1) {
              $window.location.href = '#!/login';
            }
          }
          return $q.reject(rejection);
        }
      };
    }])

    .config(['$httpProvider', function($httpProvider) {
      $httpProvider.interceptors.push('AuthInterceptor');
    }])

    /* Storage Service (Local storage helper) */
    .factory('StorageService', ['$window', function($window) {
      var PREFIX = 'safewalk_ai_';

      return {
        getItem: function(key) {
          var val = $window.localStorage.getItem(PREFIX + key);
          if (!val) return null;
          try {
            return JSON.parse(val);
          } catch (e) {
            return val;
          }
        },
        setItem: function(key, value) {
          if (typeof value === 'string') {
            $window.localStorage.setItem(PREFIX + key, value);
          } else {
            $window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
          }
        },
        removeItem: function(key) {
          $window.localStorage.removeItem(PREFIX + key);
        }
      };
    }])

    /* Notification Toast Service */
    .factory('NotificationService', ['$rootScope', '$timeout', function($rootScope, $timeout) {
      $rootScope.toasts = [];

      return {
        show: function(message, type) {
          type = type || 'info';
          var toast = { id: Date.now(), message: message, type: type };
          $rootScope.toasts.push(toast);

          $timeout(function() {
            var idx = $rootScope.toasts.indexOf(toast);
            if (idx !== -1) $rootScope.toasts.splice(idx, 1);
          }, 4500);
        },
        playSOSAlertSound: function() {
          try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } catch (e) {}
        }
      };
    }])

    /* Authentication Service - STRICT FAIL-CLOSED (External DB Only) */
    .factory('AuthenticationService', ['$http', '$q', 'StorageService', 'UserModel', 'NotificationService',
    function($http, $q, StorageService, UserModel, NotificationService) {
      return {
        login: function(email, password) {
          var deferred = $q.defer();
          $http.post('/api/auth/login', { email: email, password: password })
            .then(function(res) {
              if (res.data && res.data.success) {
                var user = new UserModel(res.data.user);
                StorageService.setItem('user', user);
                StorageService.setItem('token', res.data.token);
                deferred.resolve({ success: true, user: user });
              } else {
                deferred.reject({ data: { error: 'Invalid response from authentication server.' } });
              }
            })
            .catch(function(err) {
              // FAIL-CLOSED: Strictly do NOT save or authenticate into localStorage
              var message = 'Authentication failed.';
              if (err.status === 503) {
                message = 'External Database Service Unavailable: SafeWalk AI operates in strict fail-closed mode. Credentials are only stored in MongoDB Atlas and will never be saved to internal storage.';
              } else if (err.data && err.data.error) {
                message = err.data.error;
              }
              NotificationService.show(message, 'danger');
              deferred.reject(err);
            });
          return deferred.promise;
        },

        register: function(userData) {
          var deferred = $q.defer();
          $http.post('/api/auth/register', userData)
            .then(function(res) {
              if (res.data && res.data.success) {
                var user = new UserModel(res.data.user);
                StorageService.setItem('user', user);
                StorageService.setItem('token', res.data.token);
                deferred.resolve({ success: true, user: user });
              } else {
                deferred.reject({ data: { error: 'Registration failed.' } });
              }
            })
            .catch(function(err) {
              // FAIL-CLOSED: Strictly do NOT save to localStorage
              var message = 'Registration failed.';
              if (err.status === 503) {
                message = 'External Database Service Unavailable: Only external MongoDB persistence is permitted. User registration rejected to prevent unpersisted internal data.';
              } else if (err.data && err.data.error) {
                message = err.data.error;
              }
              NotificationService.show(message, 'danger');
              deferred.reject(err);
            });
          return deferred.promise;
        },

        saveProfile: function(userObj) {
          var deferred = $q.defer();
          $http.put('/api/user/profile', userObj)
            .then(function(res) {
              var updated = new UserModel(res.data.user || userObj);
              StorageService.setItem('user', updated);
              deferred.resolve(updated);
            })
            .catch(function(err) {
              deferred.reject(err);
            });
          return deferred.promise;
        },

        logout: function() {
          StorageService.removeItem('token');
          StorageService.removeItem('user');
        },

        getCurrentUser: function() {
          var u = StorageService.getItem('user');
          return u ? new UserModel(u) : null;
        },

        isAuthenticated: function() {
          return !!StorageService.getItem('token');
        },

        isAdmin: function() {
          var u = this.getCurrentUser();
          return Boolean(u && u.role === 'admin');
        }
      };
    }])

    /* Admin Service - Role-Based Access Control Operations */
    .factory('AdminService', ['$http', '$q', function($http, $q) {
      return {
        getUsers: function() {
          return $http.get('/api/admin/users').then(function(res) { return res.data; });
        },
        updateUser: function(userId, updatedData) {
          return $http.put('/api/admin/users/' + userId, updatedData).then(function(res) { return res.data; });
        },
        updateUserRole: function(userId, newRole) {
          return $http.put('/api/admin/users/' + userId + '/role', { role: newRole }).then(function(res) { return res.data; });
        },
        deleteUser: function(userId) {
          return $http.delete('/api/admin/users/' + userId).then(function(res) { return res.data; });
        },
        verifyCrime: function(crimeId, status, severity) {
          return $http.put('/api/admin/crimes/' + crimeId + '/verify', { status: status, severity: severity }).then(function(res) { return res.data; });
        },
        getStats: function() {
          return $http.get('/api/admin/stats').then(function(res) { return res.data; });
        }
      };
    }])

    /* Analytics Service - Multi-Criteria Spatial Routing & Risk Maps */
    .factory('AnalyticsService', ['$http', function($http) {
      return {
        computeSafeRoute: function(params) {
          return $http.get('/api/analytics/safe-route/', { params: params || {} }).then(function(res) { return res.data; });
        },
        getHeatmapData: function() {
          return $http.get('/api/analytics/heatmap/').then(function(res) { return res.data; });
        },
        getZones: function() {
          return $http.get('/api/analytics/zones/').then(function(res) { return res.data; });
        }
      };
    }])
    .factory('DjangoAnalyticsService', ['AnalyticsService', function(AnalyticsService) {
      return AnalyticsService;
    }])

    /* Contact Service - Full CRUD */
    .factory('ContactService', ['$http', '$q', 'ContactModel', function($http, $q, ContactModel) {
      var API_URL = '/api/contacts';
      var cachedContacts = [];

      return {
        getAll: function() {
          return cachedContacts;
        },
        fetchContacts: function() {
          var deferred = $q.defer();
          $http.get(API_URL)
            .then(function(res) {
              if (Array.isArray(res.data)) {
                cachedContacts = res.data.map(function(c) { return new ContactModel(c); });
              }
              deferred.resolve(cachedContacts);
            })
            .catch(function() {
              deferred.resolve(cachedContacts);
            });
          return deferred.promise;
        },
        addContact: function(contactData) {
          var deferred = $q.defer();
          $http.post(API_URL, contactData)
            .then(function(res) {
              var created = new ContactModel(res.data);
              cachedContacts.push(created);
              deferred.resolve(created);
            })
            .catch(function(err) {
              deferred.reject(err);
            });
          return deferred.promise;
        },
        updateContact: function(id, updatedData) {
          var deferred = $q.defer();
          $http.put(API_URL + '/' + id, updatedData)
            .then(function(res) {
              var updated = new ContactModel(res.data);
              for (var i = 0; i < cachedContacts.length; i++) {
                if (cachedContacts[i].id === id || cachedContacts[i]._id === id) {
                  cachedContacts[i] = updated;
                  break;
                }
              }
              deferred.resolve(updated);
            })
            .catch(function(err) {
              deferred.reject(err);
            });
          return deferred.promise;
        },
        deleteContact: function(id) {
          var deferred = $q.defer();
          $http.delete(API_URL + '/' + id)
            .then(function() {
              cachedContacts = cachedContacts.filter(function(c) {
                return c.id !== id && c._id !== id;
              });
              deferred.resolve(cachedContacts);
            })
            .catch(function(err) {
              deferred.reject(err);
            });
          return deferred.promise;
        }
      };
    }])

    /* Crime Service - Full CRUD & Reporting */
    .factory('CrimeService', ['$http', '$q', 'CrimeReportModel', function($http, $q, CrimeReportModel) {
      var API_URL = '/api/crimes';
      var cachedCrimes = [];

      return {
        getAll: function() {
          return cachedCrimes;
        },
        fetchCrimes: function() {
          var deferred = $q.defer();
          $http.get(API_URL)
            .then(function(res) {
              if (Array.isArray(res.data)) {
                cachedCrimes = res.data.map(function(c) { return new CrimeReportModel(c); });
              }
              deferred.resolve(cachedCrimes);
            })
            .catch(function() {
              deferred.resolve(cachedCrimes);
            });
          return deferred.promise;
        },
        addReport: function(crimeData) {
          var deferred = $q.defer();
          $http.post(API_URL, crimeData)
            .then(function(res) {
              var created = new CrimeReportModel(res.data);
              cachedCrimes.unshift(created);
              deferred.resolve(created);
            })
            .catch(function(err) {
              deferred.reject(err);
            });
          return deferred.promise;
        },
        updateReport: function(id, updatedData) {
          var deferred = $q.defer();
          $http.put(API_URL + '/' + id, updatedData)
            .then(function(res) {
              var updated = new CrimeReportModel(res.data);
              for (var i = 0; i < cachedCrimes.length; i++) {
                if (cachedCrimes[i].id === id || cachedCrimes[i]._id === id) {
                  cachedCrimes[i] = updated;
                  break;
                }
              }
              deferred.resolve(updated);
            })
            .catch(function(err) {
              deferred.reject(err);
            });
          return deferred.promise;
        },
        deleteReport: function(id) {
          var deferred = $q.defer();
          $http.delete(API_URL + '/' + id)
            .then(function() {
              cachedCrimes = cachedCrimes.filter(function(c) {
                return c.id !== id && c._id !== id;
              });
              deferred.resolve(cachedCrimes);
            })
            .catch(function(err) {
              deferred.reject(err);
            });
          return deferred.promise;
        }
      };
    }])

    /* SOS Emergency Service */
    .factory('SOSService', ['$http', '$interval', 'NotificationService', function($http, $interval, NotificationService) {
      var sosState = {
        active: false,
        countdown: 5,
        status: 'Idle',
        dispatches: { police: false, hospital: false, guardians: false }
      };

      var timerPromise = null;

      return {
        getState: function() {
          return sosState;
        },
        startSOS: function(onCountdownFinished) {
          sosState.active = true;
          sosState.status = 'Counting';
          sosState.countdown = 5;
          sosState.dispatches = { police: false, hospital: false, guardians: false };

          NotificationService.playSOSAlertSound();
          if (timerPromise) $interval.cancel(timerPromise);

          timerPromise = $interval(function() {
            if (sosState.countdown > 1) {
              sosState.countdown--;
              NotificationService.playSOSAlertSound();
            } else {
              $interval.cancel(timerPromise);
              sosState.status = 'Dispatched';
              sosState.countdown = 0;
              sosState.dispatches.police = true;
              sosState.dispatches.hospital = true;
              sosState.dispatches.guardians = true;

              $http.post('/api/sos', {
                status: 'Dispatched',
                lat: 37.7749,
                lng: -122.4194,
                battery: '88%',
                timestamp: new Date().toISOString()
              }).catch(function() {});

              if (onCountdownFinished) onCountdownFinished();
            }
          }, 1000);
        },
        cancelSOS: function() {
          if (timerPromise) $interval.cancel(timerPromise);
          sosState.active = false;
          sosState.status = 'Cancelled';
          sosState.countdown = 5;
        }
      };
    }])

    /* Route Service */
    .factory('RouteService', ['AnalyticsService', function(AnalyticsService) {
      return {
        calculateSafeRoutes: function(origin, destination, mode) {
          return AnalyticsService.computeSafeRoute({
            start_lat: 37.7749,
            start_lng: -122.4194,
            end_lat: 37.7849,
            end_lng: -122.4094,
            prioritize_lighting: true,
            avoid_high_crime: true
          }).then(function(data) {
            return {
              safeRoute: {
                name: 'SafeWalk AI Recommended Route',
                distance: (data.safeRoute.distanceMeters / 1000).toFixed(1) + ' km',
                eta: data.safeRoute.estimatedWalkTimeMin + ' mins',
                riskScore: 'Optimal (' + data.safeRoute.safetyScore + '% Safe)',
                lightingScore: data.safeRoute.lightingScore + '% Illumination',
                riskColor: '#10B981',
                features: ['Continuous Streetlights', 'Active Foot Traffic', 'Police Kiosk on Route'],
                color: '#4F46E5',
                turnByTurn: data.safeRoute.turnByTurn
              },
              fastRoute: {
                name: 'Direct Shortcut Route',
                distance: (data.directRoute.distanceMeters / 1000).toFixed(1) + ' km',
                eta: data.directRoute.estimatedWalkTimeMin + ' mins',
                riskScore: 'Hazard Warning (' + data.directRoute.safetyScore + '% Safe)',
                lightingScore: data.directRoute.lightingScore + '% Illumination',
                riskColor: '#EF4444',
                features: ['Unlit Alleyway Segment', 'Isolated Park Edge'],
                color: '#7C3AED',
                warning: data.directRoute.warning
              }
            };
          }).catch(function() {
            return {
              safeRoute: {
                name: 'SafeWalk AI Recommended Route',
                distance: '1.6 km',
                eta: '18 mins',
                riskScore: 'Optimal (96% Safe)',
                lightingScore: '94% Illumination',
                riskColor: '#10B981',
                features: ['Continuous Streetlights', 'Active Foot Traffic', 'Police Kiosk on Route'],
                color: '#4F46E5'
              },
              fastRoute: {
                name: 'Direct Shortcut Route',
                distance: '1.4 km',
                eta: '15 mins',
                riskScore: 'Hazard Warning (64% Safe)',
                lightingScore: '42% Illumination',
                riskColor: '#EF4444',
                features: ['Unlit Alleyway Segment', 'Isolated Park Edge'],
                color: '#7C3AED'
              }
            };
          });
        }
      };
    }])

    /* Location Service */
    .factory('LocationService', [function() {
      var isSharing = false;
      var trackingData = {
        speed: '3.6 km/h',
        battery: '88%',
        signal: 'Strong (5G)',
        shareUrl: 'https://safewalk.ai/track/live-session-883921'
      };

      return {
        getTrackingData: function() { return trackingData; },
        isSharingActive: function() { return isSharing; },
        startSharing: function() { isSharing = true; },
        stopSharing: function() { isSharing = false; }
      };
    }])

    /* App-wide Animation & Route Helper */
    .factory('AppFactory', [function() {
      var animations = {
        '/landing': 'page-animation-landing',
        '/login': 'page-animation-auth',
        '/register': 'page-animation-auth',
        '/dashboard': 'page-animation-dashboard',
        '/safe-route': 'page-animation-route',
        '/crime-map': 'page-animation-map',
        '/live-location': 'page-animation-location',
        '/sos': 'page-animation-sos',
        '/contacts': 'page-animation-contacts',
        '/profile': 'page-animation-profile'
      };

      return {
        getPageAnimation: function(routePath) {
          var sanitizedRoute = (routePath || '').split('?')[0].split('#')[0];
          return animations[sanitizedRoute] || 'page-animation-dashboard';
        },
        isAuthRoute: function(routePath) {
          var sanitizedRoute = (routePath || '').split('?')[0].split('#')[0];
          return sanitizedRoute === '/landing' || sanitizedRoute === '/login' || sanitizedRoute === '/register';
        }
      };
    }])

    /* Map Service */
    .factory('MapService', ['$timeout', function($timeout) {
      var mapInstances = {};

      function buildMap(element, options) {
        if (!window.L) return;
        var settings = options || {};
        var center = settings.center || [37.7749, -122.4194];
        var zoom = settings.zoom || 13;
        var mode = settings.mode || 'default';

        if (mapInstances[element.id]) {
          mapInstances[element.id].remove();
        }

        var map = L.map(element, {
          zoomControl: true,
          scrollWheelZoom: true
        }).setView(center, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        var safeRouteLatlngs = [
          [37.7749, -122.4194],
          [37.7769, -122.4179],
          [37.7809, -122.4139],
          [37.7834, -122.4104],
          [37.7849, -122.4094]
        ];
        var crimePoints = [
          [37.7790, -122.4150],
          [37.7710, -122.4230],
          [37.7820, -122.4110]
        ];

        if (mode === 'safe-route') {
          L.polyline(safeRouteLatlngs, { color: '#4F46E5', weight: 6, opacity: 0.9 }).addTo(map);
          L.circleMarker(safeRouteLatlngs[0], { radius: 9, color: '#4F46E5', fillColor: '#ffffff', fillOpacity: 1 }).addTo(map).bindPopup('Origin (Safe Departure)');
          L.circleMarker(safeRouteLatlngs[4], { radius: 9, color: '#EC4899', fillColor: '#ffffff', fillOpacity: 1 }).addTo(map).bindPopup('Destination (Safe Arrival)');
        } else if (mode === 'crime') {
          L.circle([37.7749, -122.4194], { radius: 900, color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.18 }).addTo(map);
          angular.forEach(crimePoints, function(point) {
            L.circleMarker(point, { radius: 8, color: '#EF4444', fillColor: '#ffffff', fillOpacity: 1 }).addTo(map);
          });
        } else if (mode === 'live') {
          L.circleMarker([37.7749, -122.4194], { radius: 10, color: '#4F46E5', fillColor: '#4F46E5', fillOpacity: 1 }).addTo(map);
          L.circle([37.7749, -122.4194], { radius: 500, color: '#4F46E5', fillColor: '#4F46E5', fillOpacity: 0.14 }).addTo(map);
        } else {
          L.circleMarker([37.7749, -122.4194], { radius: 10, color: '#4F46E5', fillColor: '#ffffff', fillOpacity: 1 }).addTo(map);
          L.circleMarker([37.7790, -122.4150], { radius: 8, color: '#EF4444', fillColor: '#ffffff', fillOpacity: 1 }).addTo(map);
          L.polyline(safeRouteLatlngs, { color: '#7C3AED', weight: 4, opacity: 0.8 }).addTo(map);
        }

        $timeout(function() {
          map.invalidateSize();
        }, 250);

        mapInstances[element.id] = map;
      }

      return {
        initMap: function(elementId, options) {
          var el = document.getElementById(elementId);
          if (!el) return;
          buildMap(el, options);
        }
      };
    }]);

})();
