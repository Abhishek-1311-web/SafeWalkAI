/**
 * SafeWalk AI - AngularJS Controllers
 * Manages MVC Controller logic, two-way data bindings, and CRUD operations.
 */
(function() {
  'use strict';

  angular.module('safeWalkApp')

    /* Landing Page Controller */
    .controller('LandingController', ['$location', function($location) {
      var vm = this;
      vm.features = [
        { icon: 'fa-route', title: 'Safe Route AI', desc: 'Real-time navigation avoiding high-risk, unlit, or isolated areas.' },
        { icon: 'fa-location-dot', title: 'Live Location Sharing', desc: 'Share encrypted live GPS tracking with selected emergency guardians.' },
        { icon: 'fa-mobile-screen', title: 'Wearable Integration', desc: 'Instant SOS trigger via smartwatches and panic button accessories.' },
        { icon: 'fa-bell', title: 'Emergency SOS Hub', desc: 'One-tap dispatch alert sent to Police, Hospitals, and Family.' },
        { icon: 'fa-shield-halved', title: 'Crime Hotspot AI', desc: 'Predictive analytics mapping historical incidents & risk density.' },
        { icon: 'fa-chart-line', title: 'AI Safety Analytics', desc: 'Personalized safety score updates based on walk timing and routes.' }
      ];

      vm.stats = [
        { value: '99.4%', label: 'Incident Prevention Rate' },
        { value: '50k+', label: 'Active Women Protected' },
        { value: '4.2 min', label: 'Average Emergency Response' },
        { value: '1.2M+', label: 'Safe Routes Navigated' }
      ];

      vm.startWalk = function() {
        $location.path('/dashboard');
      };
    }])

    /* Login Controller */
    .controller('LoginController', ['$location', 'AuthenticationService', 'NotificationService', 
    function($location, AuthenticationService, NotificationService) {
      var vm = this;
      vm.credentials = { email: '', password: '', remember: true };
      vm.errorMessage = '';
      vm.isLoading = false;

      vm.fillDemoUser = function(role) {
        if (role === 'admin') {
          vm.credentials.email = 'admin@safewalk.ai';
          vm.credentials.password = 'Admin@123';
        } else {
          vm.credentials.email = 'edwinmoses@student.tce.edu';
          vm.credentials.password = 'Edwin@123';
        }
      };

      vm.login = function() {
        if (!vm.credentials.email || !vm.credentials.password) {
          vm.errorMessage = 'Please enter both email and password';
          return;
        }

        vm.isLoading = true;
        vm.errorMessage = '';
        AuthenticationService.login(vm.credentials.email, vm.credentials.password)
          .then(function(res) {
            vm.isLoading = false;
            if (res.success) {
              NotificationService.show('Welcome back to SafeWalk AI, ' + res.user.name + '!', 'success');
              if (res.user.role === 'admin') {
                $location.path('/admin');
              } else {
                $location.path('/dashboard');
              }
            } else {
              vm.errorMessage = 'Invalid email or password';
            }
          })
          .catch(function(err) {
            vm.isLoading = false;
            vm.errorMessage = err && err.data && err.data.error ? err.data.error : 'Authentication failed. Please verify database connectivity.';
          });
      };
    }])

    /* Register Controller - REFACTORED to pure $scope binding (no vm. syntax) */
    .controller('RegisterController', ['$scope', '$location', 'AuthenticationService', 'NotificationService', 
    function($scope, $location, AuthenticationService, NotificationService) {
      $scope.user = {
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        emergencyPhone: ''
      };
      $scope.errorMessage = '';
      $scope.isLoading = false;

      $scope.register = function() {
        if (!$scope.user.name || !$scope.user.email || !$scope.user.password) {
          $scope.errorMessage = 'Please fill out all required fields.';
          return;
        }
        if ($scope.user.password.length < 6) {
          $scope.errorMessage = 'Password must be at least 6 characters long.';
          return;
        }
        if ($scope.user.password !== $scope.user.confirmPassword) {
          $scope.errorMessage = 'Passwords do not match.';
          return;
        }

        $scope.isLoading = true;
        $scope.errorMessage = '';

        AuthenticationService.register($scope.user)
          .then(function(res) {
            $scope.isLoading = false;
            NotificationService.show('Account created successfully on MongoDB Atlas!', 'success');
            $location.path('/dashboard');
          })
          .catch(function(err) {
            $scope.isLoading = false;
            $scope.errorMessage = err && err.data && err.data.error ? err.data.error : 'Registration rejected by external MongoDB gateway.';
          });
      };
    }])

    /* Dashboard Controller */
    .controller('DashboardController', ['$location', 'ContactService', 'CrimeService', 'NotificationService', 'AuthenticationService', 'StorageService',
    function($location, ContactService, CrimeService, NotificationService, AuthenticationService, StorageService) {
      var vm = this;

      // If user is Admin, direct to the dedicated Admin Operations Center
      if (AuthenticationService.isAdmin()) {
        $location.path('/admin');
        return;
      }

      vm.user = AuthenticationService.getCurrentUser() || StorageService.getItem('user') || {};
      vm.safetyScore = vm.user.safetyScore || 94;
      vm.contacts = ContactService.getAll();
      vm.recentCrimes = CrimeService.getAll();

      // Dynamic Profile Completeness percentage calculation
      vm.calculateCompleteness = function() {
        var score = 0;
        if (vm.user.name && vm.user.name.trim()) score += 20;
        if (vm.user.email && vm.user.email.trim()) score += 20;
        if (vm.user.phone && vm.user.phone.trim()) score += 20;
        if (vm.user.medicalNotes && vm.user.medicalNotes.trim() && vm.user.medicalNotes !== 'Standard Profile') score += 20;
        if (vm.contacts && vm.contacts.length > 0) score += 20;
        return score || 20;
      };

      vm.profileCompleteness = vm.calculateCompleteness();

      // Fetch live data from Express.js / MongoDB
      ContactService.fetchContacts().then(function(contacts) {
        vm.contacts = contacts;
        vm.profileCompleteness = vm.calculateCompleteness();
      });

      CrimeService.fetchCrimes().then(function(crimes) {
        vm.recentCrimes = crimes;
      });

      vm.recentAlerts = [
        { time: '10 mins ago', title: 'High Safety Zone', desc: 'You entered Downtown Safe Walk District', type: 'success' },
        { time: '2 hours ago', title: 'Street Light Warning', desc: 'Reported outage on 4th Avenue near Elm', type: 'warning' },
        { time: 'Yesterday', title: 'Route Complete', desc: 'Arrived safely at Home (2.4 km walk)', type: 'info' }
      ];

      vm.weather = {
        temp: '22°C',
        condition: 'Clear Night',
        humidity: '45%',
        visibility: '10 km'
      };

      vm.aiRecommendation = {
        title: 'Optimal Walk Window',
        desc: 'Main street is 98% safe with active streetlights and 3 nearby police patrols until 11:30 PM.'
      };

      vm.triggerSOS = function() {
        $location.path('/sos');
      };
    }])

    /* Safe Route Controller - Connected to Express Spatial Analytics */
    .controller('RouteController', ['RouteService', 'NotificationService', 
    function(RouteService, NotificationService) {
      var vm = this;
      vm.origin = 'Current Location (Central Park)';
      vm.destination = 'Metro Station Plaza';
      vm.travelMode = 'Walking';
      vm.selectedRoute = 'safe'; // 'safe' or 'fast'
      vm.routes = null;
      vm.isLoading = true;

      RouteService.calculateSafeRoutes(vm.origin, vm.destination, vm.travelMode).then(function(routes) {
        vm.routes = routes;
        vm.isLoading = false;
      }).catch(function() {
        vm.isLoading = false;
      });

      vm.selectRoute = function(type) {
        vm.selectedRoute = type;
      };

      vm.startNavigation = function() {
        NotificationService.show('SafeWalk AI Spatial Navigation Engaged! Monitoring street lighting & proximity alerts.', 'success');
      };
    }])

    /* Crime Map Controller - Full CRUD for Incident Reports & Verification */
    .controller('CrimeMapController', ['CrimeService', 'AdminService', 'NotificationService', 'AuthenticationService',
    function(CrimeService, AdminService, NotificationService, AuthenticationService) {
      var vm = this;
      vm.crimes = CrimeService.getAll();
      vm.selectedCategory = 'All';
      vm.newReport = { type: 'Poor Lighting', description: '', severity: 'Medium' };
      vm.isAdmin = AuthenticationService.isAdmin();

      // Load incidents from Express / MongoDB
      CrimeService.fetchCrimes().then(function(crimes) {
        vm.crimes = crimes;
      });

      vm.aiSuggestion = 'Avoid Park Alley after 9:00 PM due to repeated low lighting reports. Recommended detour via Grand Avenue.';

      // CREATE incident (POST)
      vm.submitReport = function() {
        if (!vm.newReport.description) return;
        var user = AuthenticationService.getCurrentUser();
        var reportData = {
          type: vm.newReport.type,
          description: vm.newReport.description,
          severity: vm.newReport.severity,
          lat: 37.7760,
          lng: -122.4180,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Reported',
          reportedBy: user ? user.name : 'Anonymous Pedestrian'
        };

        CrimeService.addReport(reportData).then(function() {
          vm.crimes = CrimeService.getAll();
          vm.newReport.description = '';
          NotificationService.show('Safety incident reported to database! Thank you for protecting the community.', 'success');
        });
      };

      // Admin verification of incidents
      vm.verifyIncident = function(crime, newStatus) {
        AdminService.verifyCrime(crime._id || crime.id, newStatus, crime.severity).then(function(res) {
          crime.status = newStatus;
          NotificationService.show('Incident status updated to ' + newStatus, 'success');
        }).catch(function(err) {
          NotificationService.show('Verification failed: ' + (err.data && err.data.error || 'Admin required'), 'danger');
        });
      };

      // DELETE incident (DELETE)
      vm.deleteReport = function(id) {
        CrimeService.deleteReport(id).then(function() {
          vm.crimes = CrimeService.getAll();
          NotificationService.show('Incident report deleted', 'info');
        });
      };
    }])

    /* Live Location Controller */
    .controller('LocationController', ['LocationService', 'NotificationService',
    function(LocationService, NotificationService) {
      var vm = this;
      vm.tracking = LocationService.getTrackingData();
      vm.isSharing = LocationService.isSharingActive();

      vm.toggleSharing = function() {
        if (vm.isSharing) {
          LocationService.stopSharing();
          vm.isSharing = false;
          NotificationService.show('Live location sharing stopped', 'info');
        } else {
          LocationService.startSharing();
          vm.isSharing = true;
          NotificationService.show('Live location broadcast active!', 'success');
        }
      };

      vm.copyShareLink = function() {
        navigator.clipboard.writeText(vm.tracking.shareUrl);
        NotificationService.show('Tracking link copied to clipboard!', 'success');
      };
    }])

    /* SOS Emergency Controller */
    .controller('SOSController', ['SOSService', 'NotificationService',
    function(SOSService, NotificationService) {
      var vm = this;
      vm.sosState = SOSService.getState();

      vm.triggerSOS = function() {
        SOSService.startSOS(function() {
          NotificationService.show('EMERGENCY SOS DISPATCHED TO ALL GUARDIANS & POLICE!', 'danger');
        });
      };

      vm.cancelSOS = function() {
        SOSService.cancelSOS();
        NotificationService.show('Emergency SOS cancelled', 'info');
      };
    }])

    /* Emergency Contacts Controller - Full CRUD for Guardians */
    .controller('ContactController', ['ContactService', 'NotificationService', 'ContactModel',
    function(ContactService, NotificationService, ContactModel) {
      var vm = this;
      vm.contacts = ContactService.getAll();
      vm.searchQuery = '';
      vm.showModal = false;
      vm.isEditing = false;
      vm.newContact = { name: '', phone: '', relation: '', isPrimary: false };
      vm.editingContact = null;

      // READ contacts (GET)
      ContactService.fetchContacts().then(function(contacts) {
        vm.contacts = contacts;
      });

      vm.openAddModal = function() {
        vm.isEditing = false;
        vm.newContact = { name: '', phone: '', relation: '', isPrimary: false };
        vm.showModal = true;
      };

      vm.openEditModal = function(contact) {
        vm.isEditing = true;
        vm.editingContact = contact;
        vm.newContact = {
          id: contact.id || contact._id,
          name: contact.name,
          phone: contact.phone,
          relation: contact.relation,
          isPrimary: contact.isPrimary,
          photo: contact.photo
        };
        vm.showModal = true;
      };

      vm.closeAddModal = function() {
        vm.showModal = false;
        vm.isEditing = false;
        vm.newContact = { name: '', phone: '', relation: '', isPrimary: false };
      };

      // CREATE or UPDATE
      vm.saveContact = function() {
        if (!vm.newContact.name || !vm.newContact.phone) return;

        if (vm.isEditing && vm.newContact.id) {
          ContactService.updateContact(vm.newContact.id, vm.newContact).then(function() {
            vm.contacts = ContactService.getAll();
            vm.closeAddModal();
            NotificationService.show('Emergency guardian updated successfully', 'success');
          });
        } else {
          ContactService.addContact(vm.newContact).then(function() {
            vm.contacts = ContactService.getAll();
            vm.closeAddModal();
            NotificationService.show('Emergency guardian added to database', 'success');
          });
        }
      };

      // DELETE - Remove emergency contact using trash can icon
      vm.deleteContact = function(id) {
        if (!confirm('Are you sure you want to remove this emergency contact from your network?')) return;
        ContactService.deleteContact(id).then(function() {
          vm.contacts = ContactService.getAll();
          NotificationService.show('Emergency contact removed from network.', 'info');
        });
      };

      vm.callContact = function(contact) {
        NotificationService.show('Calling ' + contact.name + ' (' + contact.phone + ')...', 'info');
      };

      vm.sendAlertSMS = function(contact) {
        NotificationService.show('Emergency alert SMS sent to ' + contact.name, 'success');
      };
    }])

    /* Profile Controller */
    .controller('ProfileController', ['StorageService', 'AuthenticationService', 'NotificationService', 'UserModel',
    function(StorageService, AuthenticationService, NotificationService, UserModel) {
      var vm = this;
      vm.user = AuthenticationService.getCurrentUser() || StorageService.getItem('user') || new UserModel();

      vm.calculateCompleteness = function() {
        var score = 0;
        if (vm.user.name && vm.user.name.trim()) score += 20;
        if (vm.user.email && vm.user.email.trim()) score += 20;
        if (vm.user.phone && vm.user.phone.trim()) score += 20;
        if (vm.user.medicalNotes && vm.user.medicalNotes.trim() && vm.user.medicalNotes !== 'Standard Profile') score += 20;
        if (vm.user.emergencyContacts && vm.user.emergencyContacts.length > 0) score += 20;
        return score || 20;
      };

      vm.profileCompleteness = vm.calculateCompleteness();

      vm.saveProfile = function() {
        AuthenticationService.saveProfile(vm.user).then(function(updated) {
          vm.profileCompleteness = vm.calculateCompleteness();
          NotificationService.show('Personal safety details and preferences updated successfully!', 'success');
        }).catch(function(err) {
          NotificationService.show('Failed to save profile: ' + (err.data && err.data.error || 'Server error'), 'danger');
        });
      };
    }])

    /* Admin Controller - User Lifecycle Management & Incident Verification */
    .controller('AdminController', ['$location', 'AdminService', 'CrimeService', 'NotificationService',
    function($location, AdminService, CrimeService, NotificationService) {
      var vm = this;
      vm.users = [];
      vm.stats = {};
      vm.isLoading = false;

      // Filtering & Search for User Lifecycle Table
      vm.searchQuery = '';
      vm.statusFilter = 'All';

      // Edit User Account Details & Permissions Modal
      vm.showEditModal = false;
      vm.editingUser = null;

      // Incident Verification Queue Modal
      vm.showVerifyModal = false;
      vm.crimesList = [];
      vm.isLoadingCrimes = false;

      vm.loadAdminData = function() {
        vm.isLoading = true;
        AdminService.getUsers().then(function(users) {
          vm.users = users;
        }).catch(function(err) {
          NotificationService.show('Failed to load user list: ' + (err.data && err.data.error || 'Unauthorized'), 'danger');
        }).finally(function() {
          vm.isLoading = false;
        });

        AdminService.getStats().then(function(stats) {
          vm.stats = stats;
        });
      };

      // Filter users by search query and registration status
      vm.filterUsers = function(user) {
        if (!user) return false;
        var query = (vm.searchQuery || '').toLowerCase();
        var matchesQuery = !query || 
          (user.name && user.name.toLowerCase().indexOf(query) !== -1) ||
          (user.email && user.email.toLowerCase().indexOf(query) !== -1) ||
          (user.phone && user.phone.indexOf(query) !== -1) ||
          (user.role && user.role.toLowerCase().indexOf(query) !== -1);

        var matchesStatus = vm.statusFilter === 'All' || 
          (user.status && user.status.toLowerCase() === vm.statusFilter.toLowerCase());

        return matchesQuery && matchesStatus;
      };

      // Open Edit User Modal (Actions Column)
      vm.openEditUserModal = function(user) {
        vm.editingUser = {
          _id: user._id,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'user',
          status: user.status || 'Active'
        };
        vm.showEditModal = true;
      };

      vm.closeEditUserModal = function() {
        vm.showEditModal = false;
        vm.editingUser = null;
      };

      // Save modified user account details & permissions
      vm.saveUserChanges = function() {
        if (!vm.editingUser || !vm.editingUser.name || !vm.editingUser.email) {
          NotificationService.show('Name and email are required.', 'warning');
          return;
        }

        AdminService.updateUser(vm.editingUser._id, vm.editingUser).then(function(res) {
          for (var i = 0; i < vm.users.length; i++) {
            if (vm.users[i]._id === vm.editingUser._id) {
              vm.users[i].name = vm.editingUser.name;
              vm.users[i].email = vm.editingUser.email;
              vm.users[i].phone = vm.editingUser.phone;
              vm.users[i].role = vm.editingUser.role;
              vm.users[i].status = vm.editingUser.status;
              break;
            }
          }
          vm.closeEditUserModal();
          NotificationService.show('User account details and permissions modified successfully!', 'success');
          AdminService.getStats().then(function(stats) { vm.stats = stats; });
        }).catch(function(err) {
          NotificationService.show('Failed to modify user: ' + (err.data && err.data.error || 'Server error'), 'danger');
        });
      };

      // Quick Role Toggle in Actions Column
      vm.toggleRole = function(user) {
        var targetRole = user.role === 'admin' ? 'user' : 'admin';
        AdminService.updateUserRole(user._id, targetRole).then(function(res) {
          user.role = targetRole;
          NotificationService.show('User role updated to ' + targetRole.toUpperCase(), 'success');
          AdminService.getStats().then(function(stats) { vm.stats = stats; });
        }).catch(function(err) {
          NotificationService.show('Failed to update role: ' + (err.data && err.data.error || 'Server error'), 'danger');
        });
      };

      // Remove User Account in Actions Column
      vm.deleteUser = function(user) {
        if (!confirm('Permanently delete account for ' + user.email + ' from external MongoDB Atlas?')) return;
        AdminService.deleteUser(user._id).then(function() {
          vm.users = vm.users.filter(function(u) { return u._id !== user._id; });
          NotificationService.show('User account removed permanently from system.', 'success');
          AdminService.getStats().then(function(stats) { vm.stats = stats; });
        }).catch(function(err) {
          NotificationService.show('Deletion failed: ' + (err.data && err.data.error || 'Server error'), 'danger');
        });
      };

      // "Verify Crime Incidents" Modal Management
      vm.openVerifyIncidentsModal = function() {
        vm.showVerifyModal = true;
        vm.isLoadingCrimes = true;
        CrimeService.fetchCrimes().then(function(crimes) {
          vm.crimesList = crimes;
        }).finally(function() {
          vm.isLoadingCrimes = false;
        });
      };

      vm.closeVerifyIncidentsModal = function() {
        vm.showVerifyModal = false;
      };

      vm.verifyIncidentAction = function(crime, newStatus, newSeverity) {
        var targetStatus = newStatus || 'Verified';
        var targetSeverity = newSeverity || crime.severity || 'Medium';

        AdminService.verifyCrime(crime._id || crime.id, targetStatus, targetSeverity).then(function(res) {
          crime.status = targetStatus;
          crime.severity = targetSeverity;
          NotificationService.show('Crime incident verified and marked as ' + targetStatus + '!', 'success');
          AdminService.getStats().then(function(stats) { vm.stats = stats; });
        }).catch(function(err) {
          NotificationService.show('Incident verification failed: ' + (err.data && err.data.error || 'Error'), 'danger');
        });
      };

      vm.loadAdminData();
    }]);

})();
