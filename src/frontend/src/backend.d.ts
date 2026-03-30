import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Inspection {
    status: InspectionStatus;
    date: Time;
    checklistItems: Array<InspectionChecklistItem>;
    notes: string;
    inspectionId: string;
    overallStatus: CheckItemStatus;
    photos: Array<PhotoReference>;
    vehicleId: string;
    inspector: Principal;
}
export interface Vehicle {
    vin: string;
    model: string;
    licensePlate: string;
    owner: Principal;
    make: string;
    color: string;
    year: number;
    odometer: number;
}
export interface InspectionChecklistItem {
    status: CheckItemStatus;
    item: string;
    notes: string;
    category: InspectionCategory;
}
export interface PhotoReference {
    blob: ExternalBlob;
    caption: string;
    category: PhotoCategory;
}
export interface UserProfile {
    name: string;
}
export enum CheckItemStatus {
    na = "na",
    fail = "fail",
    pass = "pass"
}
export enum InspectionCategory {
    fluid = "fluid",
    tires = "tires",
    brakes = "brakes",
    interior = "interior",
    body = "body",
    lights = "lights",
    engine = "engine"
}
export enum InspectionStatus {
    completed = "completed",
    draft = "draft",
    inProgress = "inProgress"
}
export enum PhotoCategory {
    front = "front",
    damage = "damage",
    rear = "rear",
    side = "side"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addInspection(inspection: Inspection): Promise<void>;
    addOrUpdateVehicle(vehicle: Vehicle): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteVehicle(vin: string): Promise<void>;
    getAllInspections(): Promise<Array<Inspection>>;
    getAllVehiclesByOwner(owner: Principal): Promise<Array<Vehicle>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInspection(inspectionId: string): Promise<Inspection | null>;
    getInspectionsForVehicleOverTime(vehicleId: string, startDate: bigint, endDate: bigint): Promise<Array<Inspection>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVehicle(vin: string): Promise<Vehicle | null>;
    isCallerAdmin(): Promise<boolean>;
    listInspectionsByInspector(inspector: Principal): Promise<Array<Inspection>>;
    listInspectionsByStatus(status: InspectionStatus): Promise<Array<Inspection>>;
    listInspectionsByVehicle(vehicleId: string): Promise<Array<Inspection>>;
    listVehicles(): Promise<Array<Vehicle>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
