/**
 * SafeWalk AI - Custom AngularJS Directives
 */
(function() {
  'use strict';

  angular.module('safeWalkApp')

    /* Safety Score Circular SVG Gauge Directive */
    .directive('safetyGauge', [function() {
      return {
        restrict: 'E',
        scope: {
          score: '='
        },
        template: `
          <div style="position:relative; width:160px; height:160px; display:flex; align-items:center; justify-content:center; margin:0 auto;">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" stroke="rgba(79, 70, 229, 0.15)" stroke-width="12" fill="none" />
              <circle cx="80" cy="80" r="70" 
                      stroke="url(#gaugeGradient)" 
                      stroke-width="12" 
                      fill="none" 
                      stroke-dasharray="440" 
                      stroke-dashoffset="{{ 440 - (440 * (score || 94) / 100) }}" 
                      stroke-linecap="round"
                      style="transition: stroke-dashoffset 1s ease-in-out; transform: rotate(-90deg); transform-origin: 50% 50%;" />
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#4F46E5" />
                  <stop offset="100%" stop-color="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <div style="position:absolute; text-align:center;">
              <span style="font-size:2.2rem; font-weight:800; background:linear-gradient(135deg, #4F46E5, #EC4899); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">{{ score || 94 }}%</span>
              <p style="font-size:0.75rem; color:#64748B; font-weight:600; text-transform:uppercase; margin-top:-4px;">Safety Score</p>
            </div>
          </div>
        `
      };
    }])

    /* Interactive Map Directive */
    .directive('interactiveMap', ['MapService', function(MapService) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var mapId = attrs.id || 'map-' + Date.now();
          element.attr('id', mapId);
          MapService.initMap(mapId, {
            mode: attrs.mapMode || 'default'
          });
        }
      };
    }])

    /* Password Strength Meter Directive */
    .directive('passwordStrength', [function() {
      return {
        restrict: 'E',
        scope: {
          password: '='
        },
        template: `
          <div style="margin-top:0.5rem;" ng-show="password">
            <div style="height:6px; background:#E2E8F0; border-radius:3px; overflow:hidden;">
              <div ng-style="{'width': getStrength() + '%', 'background-color': getColor()}" style="height:100%; transition:all 0.3s;"></div>
            </div>
            <div style="display:flex; justify-space-between; margin-top:4px; font-size:0.75rem; font-weight:600;" ng-style="{'color': getColor()}">
              <span>Strength: {{ getLabel() }}</span>
            </div>
          </div>
        `,
        link: function(scope) {
          scope.getStrength = function() {
            var p = scope.password || '';
            var s = 0;
            if (p.length > 5) s += 30;
            if (p.length > 8) s += 20;
            if (/[A-Z]/.test(p)) s += 25;
            if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) s += 25;
            return Math.min(s, 100);
          };

          scope.getLabel = function() {
            var st = scope.getStrength();
            if (st < 40) return 'Weak';
            if (st < 75) return 'Medium';
            return 'Strong Security';
          };

          scope.getColor = function() {
            var st = scope.getStrength();
            if (st < 40) return '#EF4444';
            if (st < 75) return '#F59E0B';
            return '#10B981';
          };
        }
      };
    }])

    /* Toast Manager Directive */
    .directive('toastManager', [function() {
      return {
        restrict: 'E',
        template: `
          <div class="toast-container">
            <div class="toast" ng-repeat="toast in toasts" ng-class="'toast-' + toast.type">
              <i class="fa-solid" ng-class="{'fa-circle-check': toast.type=='success', 'fa-triangle-exclamation': toast.type=='danger', 'fa-circle-info': toast.type=='info', 'fa-bell': toast.type=='warning'}" style="font-size:1.2rem; color:var(--primary);"></i>
              <span style="font-size:0.9rem; font-weight:500;">{{ toast.message }}</span>
            </div>
          </div>
        `
      };
    }]);

    /* enterAnimation directive - programmatic simple animation */
    angular.module('safeWalkApp')
      .directive('enterAnimation', ['AnimationService', '$timeout', function(AnimationService, $timeout) {
        return {
          restrict: 'A',
          link: function(scope, element, attrs) {
            var cls = attrs.enterAnimation || 'fade-in';
            var delay = parseInt(attrs.animDelay) || 50;
            var duration = parseInt(attrs.animDuration) || 600;
            $timeout(function() {
              AnimationService.animate(element, cls, duration);
            }, delay);
          }
        };
      }])

      /* whenVisible directive - triggers animation when element enters viewport */
      .directive('whenVisible', ['AnimationService', function(AnimationService) {
        return {
          restrict: 'A',
          link: function(scope, element, attrs) {
            var cls = attrs.whenVisible || 'slide-up';
            var duration = parseInt(attrs.animDuration) || 700;

            if ('IntersectionObserver' in window) {
              var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                  if (entry.isIntersecting) {
                    AnimationService.animate(element, cls, duration);
                    observer.unobserve(entry.target);
                  }
                });
              }, { threshold: 0.2 });
              observer.observe(element[0]);
            } else {
              // fallback: animate immediately
              AnimationService.animate(element, cls, duration);
            }
          }
        };
      }])

      /* animateOn directive - watches an expression and triggers animation when true */
      .directive('animateOn', ['AnimationService', function(AnimationService) {
        return {
          restrict: 'A',
          scope: {
            animateOn: '='
          },
          link: function(scope, element, attrs) {
            var cls = attrs.animateClass || 'slide-up';
            var duration = parseInt(attrs.animDuration) || 700;
            scope.$watch('animateOn', function(newVal) {
              if (newVal) {
                AnimationService.animate(element, cls, duration);
              }
            });
          }
        };
      }]);

})();
