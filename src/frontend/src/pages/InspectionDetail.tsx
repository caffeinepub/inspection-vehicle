import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Camera,
  Car,
  Check,
  ClipboardCheck,
  FileText,
  Minus,
  Printer,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import type { AppPage } from "../App";
import {
  CheckItemStatus,
  InspectionCategory,
  InspectionStatus,
} from "../backend";
import {
  useGetInspection,
  useGetVehicle,
  useIsCallerAdmin,
} from "../hooks/useQueries";

interface InspectionDetailProps {
  inspectionId: string;
  navigate: (page: AppPage) => void;
}

const CATEGORY_LABELS: Record<InspectionCategory, string> = {
  [InspectionCategory.engine]: "Engine",
  [InspectionCategory.brakes]: "Brakes",
  [InspectionCategory.tires]: "Tires",
  [InspectionCategory.lights]: "Lights",
  [InspectionCategory.body]: "Body",
  [InspectionCategory.interior]: "Interior",
  [InspectionCategory.fluid]: "Fluids",
};

const VEHICLE_FIELDS = [
  ["Make", "make"],
  ["Model", "model"],
  ["Year", "year"],
  ["VIN", "vin"],
  ["License Plate", "licensePlate"],
  ["Color", "color"],
  ["Odometer", "odometer"],
] as const;

function StatusBadge({ status }: { status: InspectionStatus }) {
  if (status === InspectionStatus.completed)
    return (
      <Badge
        className="text-white"
        style={{ background: "oklch(var(--status-completed))" }}
      >
        Completed
      </Badge>
    );
  if (status === InspectionStatus.inProgress)
    return (
      <Badge
        className="text-white"
        style={{ background: "oklch(var(--status-inprogress))" }}
      >
        In Progress
      </Badge>
    );
  return <Badge variant="secondary">Draft</Badge>;
}

function ItemStatusIcon({ status }: { status: CheckItemStatus }) {
  if (status === CheckItemStatus.pass)
    return (
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-full"
        style={{ background: "oklch(var(--status-completed))" }}
      >
        <Check className="w-3 h-3 text-white" />
      </span>
    );
  if (status === CheckItemStatus.fail)
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-destructive">
        <X className="w-3 h-3 text-white" />
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted">
      <Minus className="w-3 h-3 text-muted-foreground" />
    </span>
  );
}

function formatDate(time: bigint): string {
  return new Date(Number(time) / 1_000_000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InspectionDetail({
  inspectionId,
  navigate,
}: InspectionDetailProps) {
  const { data: inspection, isLoading } = useGetInspection(inspectionId);
  const { data: vehicle } = useGetVehicle(inspection?.vehicleId ?? "");
  const { data: isAdmin } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p
          data-ocid="inspection_detail.error_state"
          className="text-muted-foreground"
        >
          Inspection not found.
        </p>
        <Button
          onClick={() => navigate({ name: "dashboard" })}
          className="mt-4"
          variant="outline"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const groupedChecklist = Object.values(InspectionCategory)
    .map((cat) => ({
      category: cat,
      items: inspection.checklistItems.filter((i) => i.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <Button
            data-ocid="inspection_detail.back.button"
            variant="ghost"
            size="sm"
            onClick={() => navigate({ name: "dashboard" })}
            className="-ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "oklch(var(--navy))" }}
            >
              Inspection Report
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {inspection.inspectionId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={inspection.status} />
          <Button
            data-ocid="inspection_detail.print.button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 mr-1" /> Print
          </Button>
        </div>
      </motion.div>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Car
                  className="w-5 h-5"
                  style={{ color: "oklch(var(--teal))" }}
                />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {VEHICLE_FIELDS.map(([label, field]) => {
                    let value = String(vehicle[field] ?? "");
                    if (field === "odometer")
                      value = `${Number(vehicle[field]).toLocaleString()} km`;
                    return (
                      <div key={label}>
                        <p className="text-xs text-muted-foreground font-medium mb-0.5">
                          {label}
                        </p>
                        <p className="text-sm font-semibold">{value || "—"}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Vehicle ID:{" "}
                  <span className="font-mono font-semibold">
                    {inspection.vehicleId}
                  </span>
                </p>
              )}
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Inspection Date
                  </p>
                  <p className="text-sm font-semibold">
                    {formatDate(inspection.date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Inspector
                  </p>
                  <p className="text-sm font-semibold font-mono">
                    {inspection.inspector.toString().slice(0, 16)}...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {groupedChecklist.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardCheck
                    className="w-5 h-5"
                    style={{ color: "oklch(var(--teal))" }}
                  />
                  Checklist Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {groupedChecklist.map(({ category, items }) => (
                  <div key={category}>
                    <h4
                      className="text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "oklch(var(--teal))" }}
                    >
                      {CATEGORY_LABELS[category]}
                    </h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.item} className="flex items-start gap-3">
                          <ItemStatusIcon status={item.status} />
                          <div className="flex-1">
                            <span className="text-sm font-medium">
                              {item.item}
                            </span>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {inspection.photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Camera
                    className="w-5 h-5"
                    style={{ color: "oklch(var(--teal))" }}
                  />
                  Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {inspection.photos.map((photo) => (
                    <div
                      key={photo.category}
                      className="relative aspect-video rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={photo.blob.getDirectURL()}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1 capitalize">
                        {photo.caption}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {inspection.notes && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText
                    className="w-5 h-5"
                    style={{ color: "oklch(var(--teal))" }}
                  />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {inspection.notes}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className="shadow-card border-2"
              style={{ borderColor: "oklch(var(--teal) / 0.3)" }}
            >
              <CardContent className="pt-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="font-semibold text-sm">Admin Actions</h4>
                  <p className="text-xs text-muted-foreground">
                    Update the inspection status or manage this record.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    data-ocid="inspection_detail.mark_complete.button"
                    size="sm"
                    style={{ background: "oklch(var(--status-completed))" }}
                    className="text-white"
                  >
                    Mark Complete
                  </Button>
                  <Button
                    data-ocid="inspection_detail.delete.delete_button"
                    size="sm"
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
