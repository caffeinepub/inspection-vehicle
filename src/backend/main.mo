import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  type InspectionStatus = { #draft; #inProgress; #completed };
  type InspectionCategory = { #engine; #brakes; #tires; #lights; #body; #interior; #fluid };
  type PhotoCategory = { #front; #rear; #side; #damage };
  type CheckItemStatus = { #pass; #fail; #na };

  type Vehicle = {
    vin : Text;
    make : Text;
    model : Text;
    year : Nat16;
    licensePlate : Text;
    color : Text;
    odometer : Nat32;
    owner : Principal;
  };

  type InspectionChecklistItem = {
    category : InspectionCategory;
    item : Text;
    status : CheckItemStatus;
    notes : Text;
  };

  type PhotoReference = {
    category : PhotoCategory;
    blob : Storage.ExternalBlob;
    caption : Text;
  };

  type Inspection = {
    vehicleId : Text;
    inspector : Principal;
    inspectionId : Text;
    date : Time.Time;
    status : InspectionStatus;
    notes : Text;
    overallStatus : CheckItemStatus;
    checklistItems : [InspectionChecklistItem];
    photos : [PhotoReference];
  };

  public type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  module Vehicle {
    public func compare(a : Vehicle, b : Vehicle) : Order.Order {
      Text.compare(a.vin, b.vin);
    };
  };

  module Inspection {
    public func compare(a : Inspection, b : Inspection) : Order.Order {
      Text.compare(a.inspectionId, b.inspectionId);
    };
  };

  let vehicles = Map.empty<Text, Vehicle>();
  let inspections = Map.empty<Text, Inspection>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func getVehicleInternal(vin : Text) : Vehicle {
    switch (vehicles.get(vin)) {
      case (?vehicle) { vehicle };
      case (null) { Runtime.trap("Vehicle does not exist") };
    };
  };

  public query ({ caller }) func getVehicle(vin : Text) : async ?Vehicle {
    switch (vehicles.get(vin)) {
      case (?vehicle) {
        if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own vehicles");
        };
        ?vehicle;
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func addOrUpdateVehicle(vehicle : Vehicle) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add a vehicle");
    };

    // Check if vehicle exists
    switch (vehicles.get(vehicle.vin)) {
      case (?existingVehicle) {
        // Update: verify ownership
        if (existingVehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own vehicles");
        };
      };
      case (null) {
        // New vehicle: verify caller is the owner
        if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only add vehicles for yourself");
        };
      };
    };

    vehicles.add(vehicle.vin, vehicle);
  };

  public shared ({ caller }) func deleteVehicle(vin : Text) : async () {
    let vehicle = getVehicleInternal(vin);
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own vehicle");
    };
    vehicles.remove(vin);
  };

  public shared ({ caller }) func addInspection(inspection : Inspection) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add inspections");
    };

    let vehicle = getVehicleInternal(inspection.vehicleId);
    
    // Inspectors can create inspections for any vehicle, but must be the inspector
    if (inspection.inspector != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only create inspections as yourself");
    };

    inspections.add(inspection.inspectionId, inspection);
  };

  public query ({ caller }) func getInspection(inspectionId : Text) : async ?Inspection {
    switch (inspections.get(inspectionId)) {
      case (?inspection) {
        let vehicle = getVehicleInternal(inspection.vehicleId);
        // Allow access if caller is the inspector, vehicle owner, or admin
        if (inspection.inspector != caller and vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own inspections or inspections of your vehicles");
        };
        ?inspection;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func listVehicles() : async [Vehicle] {
    if (AccessControl.isAdmin(accessControlState, caller)) {
      // Admins can see all vehicles
      vehicles.values().toArray().sort();
    } else {
      // Regular users can only see their own vehicles
      vehicles.values().toArray().filter(func(v) { v.owner == caller }).sort();
    };
  };

  public query ({ caller }) func listInspectionsByVehicle(vehicleId : Text) : async [Inspection] {
    let vehicle = getVehicleInternal(vehicleId);
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view inspections for your own vehicles");
    };
    inspections.values().toArray().filter(func(i) { i.vehicleId == vehicleId }).sort();
  };

  public query ({ caller }) func listInspectionsByInspector(inspector : Principal) : async [Inspection] {
    if (inspector != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own inspections");
    };
    inspections.values().toArray().filter(func(i) { i.inspector == inspector }).sort();
  };

  public query ({ caller }) func listInspectionsByStatus(status : InspectionStatus) : async [Inspection] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list inspections");
    };

    if (AccessControl.isAdmin(accessControlState, caller)) {
      // Admins can see all inspections with the status
      inspections.values().toArray().filter(func(i) { i.status == status }).sort();
    } else {
      // Regular users can only see their own inspections or inspections of their vehicles
      inspections.values().toArray().filter(func(i) {
        if (i.status != status) { return false };
        if (i.inspector == caller) { return true };
        switch (vehicles.get(i.vehicleId)) {
          case (?vehicle) { vehicle.owner == caller };
          case (null) { false };
        };
      }).sort();
    };
  };

  public query ({ caller }) func getAllVehiclesByOwner(owner : Principal) : async [Vehicle] {
    if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own vehicles");
    };
    vehicles.values().toArray().filter(func(v) { v.owner == owner }).sort();
  };

  public query ({ caller }) func getAllInspections() : async [Inspection] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all inspections");
    };
    inspections.values().toArray().sort();
  };

  public query ({ caller }) func getInspectionsForVehicleOverTime(vehicleId : Text, startDate : Int, endDate : Int) : async [Inspection] {
    let vehicle = getVehicleInternal(vehicleId);
    if (vehicle.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view inspections for your own vehicles");
    };
    inspections.values().toArray().filter(func(i) { i.vehicleId == vehicleId and i.date >= startDate and i.date <= endDate }).sort();
  };
};
