/**
 * SafeWalk AI - Custom AngularJS Filters
 * 
 * Features:
 * - Dynamic Role Badges & Labels (Admin vs Standard User)
 * - Emergency Phone Number Formatter
 * - Incident Severity Badges & Icons
 * - Human-Readable Relative Time (timeAgo)
 * - Safety Rating Category & Text Truncation
 */
(function() {
  'use strict';

  angular.module('safeWalkApp')

    /* Role Badge CSS Class Filter */
    .filter('roleBadge', [function() {
      return function(role) {
        if (!role) return 'badge-secondary';
        var r = role.toString().toLowerCase();
        if (r === 'admin') return 'badge-danger';
        return 'badge-primary';
      };
    }])

    /* Role Display Label Filter */
    .filter('roleLabel', [function() {
      return function(role) {
        if (!role) return 'Standard User';
        var r = role.toString().toLowerCase();
        if (r === 'admin') return 'Administrator';
        return 'Standard User';
      };
    }])

    /* User Registration Status Badge Filter */
    .filter('statusBadge', [function() {
      return function(status) {
        if (!status) return 'badge-secondary';
        var s = status.toString().toLowerCase();
        if (s === 'verified') return 'badge-success';
        if (s === 'active') return 'badge-primary';
        if (s === 'pending') return 'badge-warning';
        if (s === 'suspended') return 'badge-danger';
        return 'badge-secondary';
      };
    }])

    /* User Registration Status Icon Filter */
    .filter('statusIcon', [function() {
      return function(status) {
        if (!status) return 'fa-circle-question';
        var s = status.toString().toLowerCase();
        if (s === 'verified') return 'fa-circle-check';
        if (s === 'active') return 'fa-bolt';
        if (s === 'pending') return 'fa-clock';
        if (s === 'suspended') return 'fa-ban';
        return 'fa-circle';
      };
    }])

    /* Phone Number Formatter Filter */
    .filter('phoneFormat', [function() {
      return function(input) {
        if (!input) return '';
        var raw = ('' + input).replace(/\D/g, '');

        // 10-digit standard format
        if (raw.length === 10) {
          return '(' + raw.slice(0, 3) + ') ' + raw.slice(3, 6) + '-' + raw.slice(6);
        }
        // 11-digit format starting with 1
        if (raw.length === 11 && raw[0] === '1') {
          return '+1 (' + raw.slice(1, 4) + ') ' + raw.slice(4, 7) + '-' + raw.slice(7);
        }
        // Short emergency codes (e.g. 911)
        if (raw.length <= 4) {
          return raw;
        }
        return input;
      };
    }])

    /* Severity to Badge CSS Class Filter */
    .filter('severityBadge', [function() {
      return function(severity) {
        if (!severity) return 'badge-secondary';
        var s = severity.toString().toLowerCase();
        if (s === 'high' || s === 'critical') return 'badge-danger';
        if (s === 'medium' || s === 'moderate') return 'badge-warning';
        if (s === 'low') return 'badge-success';
        return 'badge-primary';
      };
    }])

    /* Severity to FontAwesome Icon Filter */
    .filter('severityIcon', [function() {
      return function(severity) {
        if (!severity) return 'fa-circle-info';
        var s = severity.toString().toLowerCase();
        if (s === 'high' || s === 'critical') return 'fa-triangle-exclamation';
        if (s === 'medium' || s === 'moderate') return 'fa-circle-exclamation';
        if (s === 'low') return 'fa-circle-check';
        return 'fa-circle-info';
      };
    }])

    /* Relative Timestamp Filter */
    .filter('timeAgo', [function() {
      return function(dateInput) {
        if (!dateInput) return 'Recently';
        var date = new Date(dateInput);
        if (isNaN(date.getTime())) return dateInput;

        var now = new Date();
        var diffSecs = Math.floor((now - date) / 1000);

        if (diffSecs < 60) return 'Just now';
        var diffMins = Math.floor(diffSecs / 60);
        if (diffMins < 60) return diffMins + ' min' + (diffMins > 1 ? 's' : '') + ' ago';
        var diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return diffHours + ' hr' + (diffHours > 1 ? 's' : '') + ' ago';
        var diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return diffDays + ' days ago';

        return date.toLocaleDateString();
      };
    }])

    /* Safety Score Rating Category Filter */
    .filter('riskCategory', [function() {
      return function(score) {
        var num = parseInt(score, 10);
        if (isNaN(num)) return 'Unknown';
        if (num >= 90) return 'Optimal Safety';
        if (num >= 75) return 'Standard Safety';
        if (num >= 50) return 'Moderate Alert';
        return 'High Hazard';
      };
    }])

    /* String Capitalize Filter */
    .filter('capitalize', [function() {
      return function(input) {
        if (!input) return '';
        var str = input.toString();
        return str.charAt(0).toUpperCase() + str.slice(1);
      };
    }])

    /* Text Truncation Filter */
    .filter('truncateText', [function() {
      return function(text, length) {
        length = length || 60;
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
      };
    }])

    /* Filter Incidents by Severity */
    .filter('bySeverity', [function() {
      return function(items, severity) {
        if (!items || !severity || severity === 'All') return items;
        return items.filter(function(item) {
          return item.severity && item.severity.toLowerCase() === severity.toLowerCase();
        });
      };
    }]);

})();
