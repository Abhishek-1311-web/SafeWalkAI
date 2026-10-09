/**
 * SafeWalk AI - Unified Data Models
 * Dual-environment module:
 * - Node.js: Mongoose Schemas & Models (bcrypt password hashing, RBAC, emergency contact arrays)
 * - Browser: AngularJS Domain Factories
 */
(function() {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. NODE.JS / EXPRESS / MONGOOSE ENVIRONMENT
  // --------------------------------------------------------------------------
  if (typeof module !== 'undefined' && module.exports) {
    const mongoose = require('mongoose');
    const bcrypt = require('bcryptjs');

    // Emergency Contact Sub-Schema
    const emergencyContactSubSchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      relation: { type: String, default: 'Emergency Guardian', trim: true },
      photo: { type: String, default: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
      isPrimary: { type: Boolean, default: false }
    }, { _id: true });

    // User Schema with Password Hashing & RBAC
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      status: { type: String, enum: ['Active', 'Verified', 'Suspended'], default: 'Active' },
      phone: { type: String, default: '', trim: true },
      medicalNotes: { type: String, default: 'Standard Profile' },
      safetyScore: { type: Number, default: 94 },
      profilePic: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
      emergencyContacts: [emergencyContactSubSchema],
      notificationsEnabled: { type: Boolean, default: true },
      locationPermission: { type: Boolean, default: true },
      sosVoiceActivated: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    });

    // Hash password before saving to external MongoDB
    userSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
      } catch (err) {
        next(err);
      }
    });

    // Password verification helper method
    userSchema.methods.comparePassword = async function(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    };

    // Strip password from JSON serialization
    userSchema.methods.toPublicJSON = function() {
      const obj = this.toObject();
      delete obj.password;
      return obj;
    };

    // Contact Schema (Standalone collection for quick CRUD)
    const contactSchema = new mongoose.Schema({
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      relation: { type: String, default: 'Emergency Contact', trim: true },
      photo: { type: String, default: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
      isPrimary: { type: Boolean, default: false },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      createdAt: { type: Date, default: Date.now }
    });

    // Crime Incident Schema with Verification Status
    const crimeSchema = new mongoose.Schema({
      type: { type: String, required: true, trim: true },
      severity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
      description: { type: String, required: true, trim: true },
      lat: { type: Number, default: 37.7749 },
      lng: { type: Number, default: -122.4194 },
      date: { type: String, default: () => new Date().toISOString().split('T')[0] },
      time: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      status: {
        type: String,
        enum: ['Reported', 'Under Investigation', 'Verified', 'Resolved', 'Police Patrol Added', 'Avoid at Night'],
        default: 'Reported'
      },
      reportedBy: { type: String, default: 'Anonymous Pedestrian' },
      verifiedBy: { type: String, default: null },
      createdAt: { type: Date, default: Date.now }
    });

    // SOS Emergency Dispatch Schema
    const sosSchema = new mongoose.Schema({
      status: { type: String, default: 'Active' },
      lat: { type: Number, default: 37.7749 },
      lng: { type: Number, default: -122.4194 },
      battery: { type: String, default: '88%' },
      timestamp: { type: Date, default: Date.now },
      userEmail: { type: String, default: 'user@safewalk.ai' },
      dispatchedTo: { type: [String], default: ['Police Emergency', 'EMS', 'Designated Guardians'] }
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
    const Crime = mongoose.models.Crime || mongoose.model('Crime', crimeSchema);
    const SOSAlert = mongoose.models.SOSAlert || mongoose.model('SOSAlert', sosSchema);

    module.exports = {
      User,
      Contact,
      Crime,
      SOSAlert
    };
  }

  // --------------------------------------------------------------------------
  // 2. BROWSER / ANGULARJS ENVIRONMENT
  // --------------------------------------------------------------------------
  if (typeof angular !== 'undefined') {
    angular.module('safeWalkApp')

      /* Contact Model */
      .factory('ContactModel', [function() {
        function Contact(data) {
          data = data || {};
          this.id = data.id || data._id || Date.now();
          this.name = data.name || '';
          this.phone = data.phone || '';
          this.relation = data.relation || 'Emergency Contact';
          this.photo = data.photo || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80';
          this.isPrimary = Boolean(data.isPrimary);
          this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        }

        Contact.prototype.isValid = function() {
          return !!(this.name.trim() && this.phone.trim() && this.relation.trim());
        };

        Contact.prototype.toJSON = function() {
          return {
            id: this.id,
            name: this.name,
            phone: this.phone,
            relation: this.relation,
            photo: this.photo,
            isPrimary: this.isPrimary,
            createdAt: this.createdAt
          };
        };

        Contact.build = function(data) {
          return new Contact(data);
        };

        return Contact;
      }])

      /* Crime Report Model */
      .factory('CrimeReportModel', [function() {
        function CrimeReport(data) {
          data = data || {};
          this.id = data.id || data._id || Date.now();
          this.type = data.type || 'Poor Lighting';
          this.severity = data.severity || 'Medium'; // Low, Medium, High
          this.description = data.description || '';
          this.lat = Number(data.lat) || 37.7749;
          this.lng = Number(data.lng) || -122.4194;
          this.date = data.date || new Date().toISOString().split('T')[0];
          this.time = data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          this.status = data.status || 'Reported';
          this.reportedBy = data.reportedBy || 'Anonymous Pedestrian';
          this.verifiedBy = data.verifiedBy || null;
        }

        CrimeReport.prototype.isHighRisk = function() {
          return this.severity === 'High';
        };

        CrimeReport.prototype.isValid = function() {
          return !!(this.type && this.description.trim());
        };

        CrimeReport.prototype.toJSON = function() {
          return {
            id: this.id,
            type: this.type,
            severity: this.severity,
            description: this.description,
            lat: this.lat,
            lng: this.lng,
            date: this.date,
            time: this.time,
            status: this.status,
            reportedBy: this.reportedBy,
            verifiedBy: this.verifiedBy
          };
        };

        CrimeReport.build = function(data) {
          return new CrimeReport(data);
        };

        return CrimeReport;
      }])

      /* User Profile Model */
      .factory('UserModel', [function() {
        function User(data) {
          data = data || {};
          this._id = data._id || data.id || null;
          this.name = data.name || 'SafeWalk User';
          this.email = data.email || 'user@safewalk.ai';
          this.role = data.role || 'user'; // 'user' | 'admin'
          this.status = data.status || 'Active'; // 'Active' | 'Verified' | 'Suspended'
          this.phone = data.phone || '';
          this.medicalNotes = data.medicalNotes || 'Blood Group B+, Asthmatic';
          this.safetyScore = data.safetyScore !== undefined ? data.safetyScore : 94;
          this.profilePic = data.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
          this.emergencyContacts = data.emergencyContacts || [];
          this.notificationsEnabled = data.notificationsEnabled !== undefined ? data.notificationsEnabled : true;
          this.locationPermission = data.locationPermission !== undefined ? data.locationPermission : true;
          this.sosVoiceActivated = data.sosVoiceActivated !== undefined ? data.sosVoiceActivated : true;
          this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        }

        User.prototype.isAdmin = function() {
          return this.role === 'admin';
        };

        User.prototype.getInitials = function() {
          if (!this.name) return 'SW';
          var parts = this.name.split(' ');
          return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
        };

        User.prototype.toJSON = function() {
          return {
            id: this._id,
            name: this.name,
            email: this.email,
            role: this.role,
            status: this.status,
            phone: this.phone,
            medicalNotes: this.medicalNotes,
            safetyScore: this.safetyScore,
            profilePic: this.profilePic,
            emergencyContacts: this.emergencyContacts,
            notificationsEnabled: this.notificationsEnabled,
            locationPermission: this.locationPermission,
            sosVoiceActivated: this.sosVoiceActivated,
            createdAt: this.createdAt
          };
        };

        User.build = function(data) {
          return new User(data);
        };

        return User;
      }])

      /* SOS Alert Model */
      .factory('SOSAlertModel', [function() {
        function SOSAlert(data) {
          data = data || {};
          this.id = data.id || data._id || 'SOS-' + Date.now();
          this.timestamp = data.timestamp || new Date().toISOString();
          this.status = data.status || 'Active';
          this.lat = Number(data.lat) || 37.7749;
          this.lng = Number(data.lng) || -122.4194;
          this.battery = data.battery || '88%';
          this.dispatchedTo = data.dispatchedTo || ['Police Emergency', 'EMS', 'Designated Guardians'];
        }

        SOSAlert.build = function(data) {
          return new SOSAlert(data);
        };

        return SOSAlert;
      }]);
  }

})();
