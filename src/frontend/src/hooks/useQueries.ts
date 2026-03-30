import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Inspection,
  InspectionStatus,
  UserProfile,
  Vehicle,
} from "../backend";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetAllInspections() {
  const { actor, isFetching } = useActor();
  return useQuery<Inspection[]>({
    queryKey: ["inspections"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInspections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInspection(inspectionId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Inspection | null>({
    queryKey: ["inspection", inspectionId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getInspection(inspectionId);
    },
    enabled: !!actor && !isFetching && !!inspectionId,
  });
}

export function useListVehicles() {
  const { actor, isFetching } = useActor();
  return useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listVehicles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetVehicle(vin: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Vehicle | null>({
    queryKey: ["vehicle", vin],
    queryFn: async () => {
      if (!actor || !vin) return null;
      return actor.getVehicle(vin);
    },
    enabled: !!actor && !isFetching && !!vin,
  });
}

export function useAddInspection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inspection: Inspection) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addInspection(inspection);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
    },
  });
}

export function useAddOrUpdateVehicle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicle: Vehicle) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addOrUpdateVehicle(vehicle);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListInspectionsByStatus(status: InspectionStatus) {
  const { actor, isFetching } = useActor();
  return useQuery<Inspection[]>({
    queryKey: ["inspections", "status", status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listInspectionsByStatus(status);
    },
    enabled: !!actor && !isFetching,
  });
}
